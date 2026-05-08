const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Response = require('../models/Response');
const { auth } = require('../middleware/auth');
const { supabaseAdmin } = require('../config/database');
const multer = require('multer');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

const router = express.Router();

// All user routes require authentication
router.use(auth);

// Test endpoint to debug database connection
router.get('/test-db', async (req, res) => {
  try {
    console.log('Testing database connection...');
    
    // Test 1: Simple user query
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('id', req.user.userId)
      .single();
    
    console.log('User test result:', { user: user?.email, error: userError });
    
    // Test 2: Simple responses query
    const { data: responses, error: responsesError } = await supabaseAdmin
      .from('user_responses')
      .select('id, survey_id')
      .eq('user_id', req.user.userId)
      .limit(1);
    
    console.log('Responses test result:', { 
      count: responses?.length || 0, 
      error: responsesError 
    });
    
    // Test 3: Simple surveys query
    const { data: surveys, error: surveysError } = await supabaseAdmin
      .from('surveys')
      .select('id, title')
      .limit(1);
    
    console.log('Surveys test result:', { 
      count: surveys?.length || 0, 
      error: surveysError 
    });
    
    res.json({
      message: 'Database test completed',
      results: {
        user: !!user,
        responses: responses?.length || 0,
        surveys: surveys?.length || 0,
        errors: {
          user: userError?.message,
          responses: responsesError?.message,
          surveys: surveysError?.message
        }
      }
    });
    
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      error: 'Database test failed',
      details: error.message 
    });
  }
});

// Get user's responses
router.get('/responses', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // First, try to get responses from user_responses table
    console.log('Fetching responses for user:', req.user.userId);
    console.log('Query params:', { page: pageNum, limit: limitNum });
    
    let responses, responsesError;
    
    try {
      const result = await supabaseAdmin
        .from('user_responses')
        .select('*')
        .eq('user_id', req.user.userId)
        .order('submitted_at', { ascending: false })
        .range((pageNum - 1) * limitNum, pageNum * limitNum - 1);
      
      responses = result.data;
      responsesError = result.error;
    } catch (err) {
      console.error('Query execution error:', err);
      responsesError = err;
    }

    console.log('Basic responses query result:', { 
      responses: responses?.length || 0, 
      error: responsesError?.message || 'Unknown error'
    });

    if (responsesError) {
      console.error('Get responses error:', responsesError);
      console.error('User ID:', req.user.userId);
      console.error('Query params:', { page: pageNum, limit: limitNum });
      return res.status(500).json({ 
        error: 'Server error fetching responses',
        details: responsesError.message 
      });
    }

    console.log('Responses found:', responses?.length || 0);
    console.log('Sample response:', responses?.[0]);

    // Get survey information separately
    const surveyIds = [...new Set((responses || []).map(r => r.survey_id))];
    let surveysData = {};
    
    if (surveyIds.length > 0) {
      const { data: surveys, error: surveysError } = await supabaseAdmin
        .from('surveys')
        .select('id, title, description, created_at')
        .in('id', surveyIds);
      
      if (surveysError) {
        console.error('Surveys error:', surveysError);
      } else {
        surveysData = (surveys || []).reduce((acc, survey) => {
          acc[survey.id] = survey;
          return acc;
        }, {});
      }
    }

    // Get total count
    const { count, error: countError } = await supabaseAdmin
      .from('user_responses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.userId);

    if (countError) {
      console.error('Count error:', countError);
    }

    // Get answer counts for each response
    const responseIds = (responses || []).map(r => r.id);
    let answerCounts = {};
    
    if (responseIds.length > 0) {
      const { data: answers } = await supabaseAdmin
        .from('answers')
        .select('response_id')
        .in('response_id', responseIds);
      
      answerCounts = (answers || []).reduce((acc, answer) => {
        acc[answer.response_id] = (acc[answer.response_id] || 0) + 1;
        return acc;
      }, {});
    }

    // Format responses
    const formattedResponses = (responses || []).map(response => {
      const survey = surveysData[response.survey_id];
      return {
        _id: response.id,
        surveyId: survey ? {
          _id: survey.id,
          title: survey.title,
          description: survey.description,
          createdAt: survey.created_at
        } : {
          _id: response.survey_id,
          title: 'Unknown Survey',
          description: 'Survey information not available',
          createdAt: null
        },
        submittedAt: response.submitted_at,
        completionTime: response.completion_time,
        isCompleted: response.is_completed,
        answers: answerCounts[response.id] || 0
      };
    });

    res.json({
      responses: formattedResponses,
      pagination: {
        current: pageNum,
        pages: Math.ceil((count || 0) / limitNum),
        total: count || 0
      }
    });
  } catch (error) {
    console.error('Get user responses error:', error);
    res.status(500).json({ error: 'Server error fetching responses' });
  }
});

// Get specific response details
router.get('/responses/:id', async (req, res) => {
  try {
    // Get response with survey and user info
    const { data: response, error: responseError } = await supabaseAdmin
      .from('user_responses')
      .select(`
        *,
        surveys (
          id,
          title,
          description
        )
      `)
      .eq('id', req.params.id)
      .eq('user_id', req.user.userId)
      .single();

    if (responseError || !response) {
      return res.status(404).json({ error: 'Response not found' });
    }

    // Get answers with question text
    const { data: answersData } = await supabaseAdmin
      .from('answers')
      .select(`
        *,
        questions (
          id,
          text,
          type
        )
      `)
      .eq('response_id', response.id)
      .order('question_id');

    // Format answers with question text
    const formattedAnswers = (answersData || []).map(answer => ({
      questionId: answer.question_id,
      answer: answer.answer_text || answer.rating || answer.answer_options,
      questionType: answer.questions?.type === 'multiple' ? 'MULTIPLE_CHOICE' : 'SHORT_ANSWER',
      questionText: answer.questions?.text || `Question ${answer.question_id}`
    }));

    // Format the response
    const formattedResponse = {
      id: response.id,
      surveyId: {
        _id: response.surveys?.id,
        title: response.surveys?.title,
        description: response.surveys?.description
      },
      answers: formattedAnswers,
      submittedAt: response.submitted_at,
      completionTime: response.completion_time,
      isCompleted: response.is_completed
    };

    res.json({ response: formattedResponse });
  } catch (error) {
    console.error('Get response details error:', error);
    res.status(500).json({ error: 'Server error fetching response details' });
  }
});

// Update user profile
router.put('/profile', upload.single('profilePicture'), async (req, res) => {
  try {
    const { fullName } = req.body;
    const userId = req.user.userId;
    
    // Parse fullName into first and last name
    const nameParts = fullName ? fullName.trim().split(' ') : ['', ''];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    const updateData = {
      first_name: firstName,
      last_name: lastName,
      updated_at: new Date().toISOString()
    };

    // Handle profile picture upload - try new schema first, fall back to old
    if (req.file) {
      // Convert buffer to base64 for Supabase storage
      const base64Image = req.file.buffer.toString('base64');
      const imageData = `data:${req.file.mimetype};base64,${base64Image}`;
      
      // Try new schema (profile_pictures table)
      try {
        const { data: pictureData, error: pictureError } = await supabaseAdmin
          .from('profile_pictures')
          .insert([{
            user_id: userId,
            file_name: req.file.originalname,
            file_path: imageData,
            file_size: req.file.size,
            mime_type: req.file.mimetype,
            is_active: true
          }])
          .select()
          .single();
        
        if (pictureError) {
          throw pictureError;
        }
        
        // Deactivate old profile pictures
        await supabaseAdmin
          .from('profile_pictures')
          .update({ is_active: false })
          .eq('user_id', userId)
          .neq('id', pictureData.id);
        
        console.log('Profile picture uploaded successfully (new schema):', pictureData);
      } catch (err) {
        console.log('New schema failed, trying fallback:', err.message);
        
        // Fallback: try updating users table directly (old schema)
        try {
          const { error: fallbackError } = await supabaseAdmin
            .from('users')
            .update({ profile_picture: imageData })
            .eq('id', userId);
          
          if (fallbackError) {
            console.error('Both profile picture methods failed:', fallbackError);
            // Continue without profile picture update
          } else {
            console.log('Profile picture updated successfully (fallback method)');
          }
        } catch (fallbackErr) {
          console.error('Fallback method also failed:', fallbackErr);
          // Continue without profile picture update
        }
      }
    }

    // Update user in Supabase
    let data, error;
    try {
      const result = await supabaseAdmin
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();
      data = result.data;
      error = result.error;
    } catch (err) {
      console.error('Update profile error:', err);
      return res.status(500).json({ 
        error: 'Server error updating profile',
        details: err.message 
      });
    }

    if (error) {
      console.error('Update profile error:', error);
      return res.status(500).json({ 
        error: 'Server error updating profile',
        details: error.message 
      });
    }

    // Get profile picture - try new schema first, fall back to old
    let profilePicture = null;
    try {
      // Try new schema (profile_pictures table)
      const { data: pictureData } = await supabaseAdmin
        .from('profile_pictures')
        .select('file_path')
        .eq('user_id', data.id)
        .eq('is_active', true)
        .single();
      
      profilePicture = pictureData?.file_path || null;
    } catch (err) {
      console.log('New schema profile picture fetch failed, trying fallback:', err.message);
      
      // Fallback: try getting from users table (old schema)
      try {
        const { data: userData } = await supabaseAdmin
          .from('users')
          .select('profile_picture')
          .eq('id', data.id)
          .single();
        
        profilePicture = userData?.profile_picture || null;
      } catch (fallbackErr) {
        console.error('Both profile picture fetch methods failed:', fallbackErr);
        profilePicture = null;
      }
    }

    // Format the response for frontend
    const formattedUser = {
      id: data.id,
      fullName: `${data.first_name} ${data.last_name}`.trim(),
      email: data.email,
      role: data.role,
      profilePicture: profilePicture,
      createdAt: data.created_at
    };
    
    res.json({
      message: 'Profile updated successfully',
      user: formattedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error updating profile' });
  }
});

// Change password
router.put('/password', [
  body('currentPassword').notEmpty()
    .withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
], async (req, res) => {
  try {
    console.log('=== PASSWORD CHANGE ATTEMPT ===');
    console.log('Request body:', { ...req.body, currentPassword: '[REDACTED]', newPassword: '[REDACTED]' });
    console.log('User ID:', req.user?.userId);
    console.log('User object:', { ...req.user, password: '[REDACTED]' });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation failed:', errors.array());
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    console.log('Fetching user from database...');

    // Get user with password from Supabase
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    console.log('User query result:', { 
      found: !!user, 
      error: userError?.message,
      userId: userId 
    });

    if (userError || !user) {
      console.log('❌ User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User found, comparing passwords...');

    // Import bcrypt for password comparison
    const bcrypt = require('bcryptjs');

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    console.log('Password comparison result:', isCurrentPasswordValid);

    if (!isCurrentPasswordValid) {
      console.log('❌ Current password incorrect');
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    console.log('Current password valid, hashing new password...');

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    console.log('New password hashed, updating database...');

    // Update password in users table with multiple fallback strategies
    let updateError;
    let updateSuccess = false;

    // Strategy 1: Try direct update
    try {
      console.log('Trying direct update...');
      const result = await supabaseAdmin
        .from('users')
        .update({ 
          password: hashedNewPassword
        })
        .eq('id', userId);
      
      if (!result.error) {
        updateSuccess = true;
        console.log('✅ Direct update successful');
      } else {
        updateError = result.error;
        console.log('❌ Direct update failed:', result.error.message);
      }
    } catch (err) {
      updateError = err;
      console.log('❌ Direct update exception:', err.message);
    }

    // Strategy 2: If direct update fails due to social_links, try without any additional fields
    if (!updateSuccess && updateError && updateError.message && updateError.message.includes('social_links')) {
      console.log('Trying minimal update to avoid triggers...');
      
      try {
        // Try updating with minimal data to avoid triggering other operations
        const { error: minimalError } = await supabaseAdmin
          .from('users')
          .update({ password: hashedNewPassword })
          .eq('id', userId)
          .select('id')
          .single();
        
        if (!minimalError) {
          updateSuccess = true;
          updateError = null;
          console.log('✅ Minimal update successful');
        }
      } catch (minimalErr) {
        console.log('❌ Minimal update failed:', minimalErr.message);
      }
    }

    // Strategy 3: Last resort - try to update with a raw SQL approach
    if (!updateSuccess && updateError && updateError.message && updateError.message.includes('social_links')) {
      console.log('Trying raw SQL approach...');
      
      try {
        // Use a raw SQL update through the Supabase client
        const { error: rawError } = await supabaseAdmin
          .rpc('execute_sql', {
            query: `UPDATE users SET password = $1 WHERE id = $2`,
            params: [hashedNewPassword, userId]
          });
        
        if (!rawError) {
          updateSuccess = true;
          updateError = null;
          console.log('✅ Raw SQL update successful');
        } else {
          console.log('❌ Raw SQL update failed:', rawError.message);
        }
      } catch (rawErr) {
        console.log('❌ Raw SQL update exception:', rawErr.message);
      }
    }

    if (updateError) {
      console.error('❌ Password update error:', updateError);
      return res.status(500).json({ 
        error: 'Server error updating password',
        details: updateError.message 
      });
    }

    console.log('✅ Password updated successfully');
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({ 
      error: 'Server error changing password',
      details: error.message 
    });
  }
});

module.exports = router;
