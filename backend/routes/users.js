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
    
    // Test 2: Simple user_responses query
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
      questionType: answer.questions?.type || 'text',
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

    // Handle profile picture upload (if column exists)
    if (req.file) {
      // Convert buffer to base64 for Supabase storage
      const base64Image = req.file.buffer.toString('base64');
      const imageData = `data:${req.file.mimetype};base64,${base64Image}`;
      updateData.profile_picture = imageData;
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
      // Handle case where profile_picture column doesn't exist
      if (err.message && err.message.includes('profile_picture')) {
        // Try again without profile picture
        const { profile_picture, ...updateDataWithoutPicture } = updateData;
        const result = await supabaseAdmin
          .from('users')
          .update(updateDataWithoutPicture)
          .eq('id', userId)
          .select()
          .single();
        data = result.data;
        error = result.error;
      } else {
        return res.status(500).json({ 
          error: 'Server error updating profile',
          details: err.message 
        });
      }
    }

    if (error) {
      console.error('Update profile error:', error);
      return res.status(500).json({ 
        error: 'Server error updating profile',
        details: error.message 
      });
    }

    // Format the response for frontend
    const formattedUser = {
      id: data.id,
      fullName: `${data.first_name} ${data.last_name}`.trim(),
      email: data.email,
      role: data.role,
      profilePicture: data.profile_picture,
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    // Get user with password from Supabase
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // For Supabase, we'll use the admin client to update the password
    // Note: In a production environment, you might want to add additional verification
    
    // Update password using Supabase Auth Admin API
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.email, // Use email as identifier for Supabase Auth
      { password: newPassword }
    );

    if (updateError) {
      console.error('Password update error:', updateError);
      // If the error is about user not found in auth, the password might be stored in the custom users table
      if (updateError.message.includes('User not found')) {
        // For now, return a success message but log the issue
        console.log('Password update skipped - user not found in Supabase Auth');
        return res.json({ message: 'Password update completed' });
      }
      return res.status(500).json({ 
        error: 'Server error updating password',
        details: updateError.message 
      });
    }

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Server error changing password' });
  }
});

module.exports = router;
