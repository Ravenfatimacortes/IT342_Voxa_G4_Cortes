const express = require('express');
const { body, validationResult } = require('express-validator');
const Survey = require('../models/Survey');
const Response = require('../models/Response');
const { auth, authorize } = require('../middleware/auth');
const { supabaseAdmin } = require('../config/database');

const router = express.Router();

// All admin routes require authentication and faculty/admin role
router.use(auth);
router.use(authorize('teacher', 'faculty', 'admin'));

// Create new survey
router.post('/surveys', [
  body('title').trim().isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description').optional().trim().isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('questions').isArray({ min: 1 })
    .withMessage('At least one question is required'),
  body('questions.*.questionText').trim().isLength({ min: 1, max: 500 })
    .withMessage('Question text must be between 1 and 500 characters'),
  body('questions.*.type').isIn(['MULTIPLE_CHOICE', 'SHORT_ANSWER'])
    .withMessage('Question type must be MULTIPLE_CHOICE or SHORT_ANSWER'),
  body('questions.*.required').isBoolean()
    .withMessage('Required field must be boolean'),
  body('questions.*.order').isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { title, description, questions } = req.body;

    // Validate multiple choice questions have options
    for (const question of questions) {
      if (question.type === 'MULTIPLE_CHOICE' && (!question.options || question.options.length < 2)) {
        return res.status(400).json({
          error: 'Multiple choice questions must have at least 2 options'
        });
      }
    }

    // Create survey with Supabase - start as DRAFT, user can publish when ready
    const { data: surveyData, error: surveyError } = await supabaseAdmin
      .from('surveys')
      .insert([{
        title,
        description,
        created_by: req.user.userId,
        status: 'DRAFT'
      }])
      .select()
      .single();

    if (surveyError) {
      console.error('Create survey error:', surveyError);
      return res.status(500).json({ error: 'Server error creating survey' });
    }

    // Create questions
    const questionsToInsert = questions.map((q, index) => ({
      survey_id: surveyData.id,
      text: q.questionText,
      type: q.type === 'SHORT_ANSWER' ? 'short_answer' : q.type === 'MULTIPLE_CHOICE' ? 'multiple_choice' : 'short_answer',
      "order": q.order,
      is_required: q.required !== undefined ? q.required : true,
      options: q.options || [],
      validation_rules: q.validationRules || {},
      settings: q.settings || {}
    }));

    const { data: questionsData, error: questionsError } = await supabaseAdmin
      .from('questions')
      .insert(questionsToInsert)
      .select();

    if (questionsError) {
      console.error('Create questions error:', questionsError);
      console.error('Questions to insert:', JSON.stringify(questionsToInsert, null, 2));
      return res.status(500).json({ 
        error: 'Server error creating questions',
        details: questionsError.message 
      });
    }

    // Format response manually to avoid Survey.formatSurvey issues
    const survey = {
      id: surveyData.id,
      title: surveyData.title,
      description: surveyData.description,
      createdBy: surveyData.created_by,
      status: surveyData.status,
      responseCount: surveyData.response_count,
      targetAudience: surveyData.target_audience,
      startDate: surveyData.start_date,
      endDate: surveyData.end_date,
      createdAt: surveyData.created_at,
      updatedAt: surveyData.updated_at,
      questions: (questionsData || []).map(q => ({
        id: q.id,
        questionText: q.text,
        type: q.type === 'short_answer' ? 'SHORT_ANSWER' : q.type === 'multiple_choice' ? 'MULTIPLE_CHOICE' : 'SHORT_ANSWER',
        required: q.is_required,
        order: q.order,
        options: q.options || [],
        validationRules: q.validation_rules || {},
        settings: q.settings || {}
      }))
    };

    res.status(201).json({
      message: 'Survey created successfully',
      survey
    });
  } catch (error) {
    console.error('Create survey error:', error);
    res.status(500).json({ error: 'Server error creating survey' });
  }
});

// Get all surveys for admin
router.get('/surveys', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    let query = supabaseAdmin
      .from('surveys')
      .select('*', { count: 'exact' })
      .eq('created_by', req.user.userId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: surveys, error, count } = await query
      .range((pageNum - 1) * limitNum, pageNum * limitNum - 1);

    if (error) {
      console.error('Get surveys error:', error);
      return res.status(500).json({ error: 'Server error fetching surveys' });
    }

    // Get questions for each survey
    const surveysWithQuestions = await Promise.all(
      (surveys || []).map(async (survey) => {
        const { data: questions } = await supabaseAdmin
          .from('questions')
          .select('*')
          .eq('survey_id', survey.id)
          .order('"order"', { ascending: true });

        // Format response manually to avoid Survey.formatSurvey issues
        const formattedSurvey = {
          id: survey.id,
          title: survey.title,
          description: survey.description,
          createdBy: survey.created_by,
          status: survey.status,
          responseCount: survey.response_count,
          targetAudience: survey.target_audience,
          startDate: survey.start_date,
          endDate: survey.end_date,
          createdAt: survey.created_at,
          updatedAt: survey.updated_at,
          questions: (questions || []).map(q => ({
            id: q.id,
            questionText: q.text,
            type: q.type === 'short_answer' ? 'SHORT_ANSWER' : q.type === 'multiple_choice' ? 'MULTIPLE_CHOICE' : 'SHORT_ANSWER',
            required: q.is_required,
            order: q.order,
            options: q.options || []
          }))
        };
        
        // Add response count
        const { count: responseCount } = await supabaseAdmin
          .from('user_responses')
          .select('*', { count: 'exact', head: true })
          .eq('survey_id', survey.id);
        
        formattedSurvey.responseCount = responseCount || 0;
        
        return formattedSurvey;
      })
    );

    res.json({
      surveys: surveysWithQuestions,
      pagination: {
        current: pageNum,
        pages: Math.ceil((count || 0) / limitNum),
        total: count || 0
      }
    });
  } catch (error) {
    console.error('Get surveys error:', error);
    res.status(500).json({ error: 'Server error fetching surveys' });
  }
});

// Update survey
router.put('/surveys/:id', [
  body('title').optional().trim().isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description').optional().trim().isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('questions').optional().isArray()
    .withMessage('Questions must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    // Get existing survey
    const existingSurvey = await Survey.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!existingSurvey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    if (existingSurvey.status === 'PUBLISHED') {
      return res.status(400).json({ error: 'Cannot edit published survey' });
    }

    const { title, description, questions } = req.body;

    // Prepare update data
    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (questions) {
      // Validate multiple choice questions have options
      for (const question of questions) {
        if (question.type === 'MULTIPLE_CHOICE' && (!question.options || question.options.length < 2)) {
          return res.status(400).json({
            error: 'Multiple choice questions must have at least 2 options'
          });
        }
      }
      updateData.questions = questions;
    }

    // Update survey using Supabase
    const { data: updatedSurvey, error: updateError } = await supabaseAdmin
      .from('surveys')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) {
      console.error('Update survey error:', updateError);
      return res.status(500).json({ error: 'Server error updating survey' });
    }

    // Get updated survey with questions
    const surveyWithQuestions = await Survey.findById(req.params.id, true);

    res.json({
      message: 'Survey updated successfully',
      survey: surveyWithQuestions
    });
  } catch (error) {
    console.error('Update survey error:', error);
    res.status(500).json({ error: 'Server error updating survey' });
  }
});

// Delete survey
router.delete('/surveys/:id', async (req, res) => {
  try {
    // Check if survey exists and belongs to user
    const { data: survey, error: fetchError } = await supabaseAdmin
      .from('surveys')
      .select('*')
      .eq('id', req.params.id)
      .eq('created_by', req.user.userId)
      .single();

    if (fetchError || !survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    // Delete the survey (regardless of status since we want to allow deleting published surveys)
    const { error: deleteError } = await supabaseAdmin
      .from('surveys')
      .delete()
      .eq('id', req.params.id);

    if (deleteError) {
      console.error('Delete survey error:', deleteError);
      return res.status(500).json({ error: 'Server error deleting survey' });
    }

    // Note: Related records in responses and answers tables should be 
    // automatically deleted due to foreign key constraints if they are set up correctly
    // in your Supabase database. If not, you may need to add:
    // ALTER TABLE responses ADD CONSTRAINT responses_survey_id_fkey 
    //   FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE;
    // ALTER TABLE answers ADD CONSTRAINT answers_response_id_fkey 
    //   FOREIGN KEY (response_id) REFERENCES responses(id) ON DELETE CASCADE;

    res.json({ message: 'Survey deleted successfully' });
  } catch (error) {
    console.error('Delete survey error:', error);
    res.status(500).json({ error: 'Server error deleting survey' });
  }
});

// Publish survey
router.post('/surveys/:id/publish', async (req, res) => {
  try {
    // Check if survey exists and belongs to user
    const { data: survey, error: fetchError } = await supabaseAdmin
      .from('surveys')
      .select('*')
      .eq('id', req.params.id)
      .eq('created_by', req.user.userId)
      .single();

    if (fetchError || !survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    if (survey.status === 'PUBLISHED') {
      return res.status(400).json({ error: 'Survey is already published' });
    }

    // Check if survey has questions
    const { data: questions, error: questionsError } = await supabaseAdmin
      .from('questions')
      .select('*')
      .eq('survey_id', req.params.id);

    if (questionsError || !questions || questions.length === 0) {
      return res.status(400).json({ error: 'Survey must have at least one question to publish' });
    }

    // Update survey status
    const { data: updatedSurvey, error: updateError } = await supabaseAdmin
      .from('surveys')
      .update({
        status: 'PUBLISHED'
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) {
      console.error('Publish survey error:', updateError);
      return res.status(500).json({ error: 'Server error publishing survey' });
    }

    // Format response manually to avoid Survey.formatSurvey issues
    const formattedSurvey = {
      id: updatedSurvey.id,
      title: updatedSurvey.title,
      description: updatedSurvey.description,
      createdBy: updatedSurvey.created_by,
      status: updatedSurvey.status,
      responseCount: updatedSurvey.response_count,
      targetAudience: updatedSurvey.target_audience,
      startDate: updatedSurvey.start_date,
      endDate: updatedSurvey.end_date,
      createdAt: updatedSurvey.created_at,
      updatedAt: updatedSurvey.updated_at,
      questions: (questions || []).map(q => ({
        id: q.id,
        questionText: q.text,
        type: q.type === 'short_answer' ? 'SHORT_ANSWER' : q.type === 'multiple_choice' ? 'MULTIPLE_CHOICE' : 'SHORT_ANSWER',
        required: q.is_required,
        order: q.order,
        options: q.options || []
      }))
    };

    res.json({
      message: 'Survey published successfully',
      survey: formattedSurvey
    });
  } catch (error) {
    console.error('Publish survey error:', error);
    res.status(500).json({ error: 'Server error publishing survey' });
  }
});

// Unpublish survey
router.post('/surveys/:id/unpublish', async (req, res) => {
  try {
    // Check if survey exists and belongs to user
    const { data: survey, error: fetchError } = await supabaseAdmin
      .from('surveys')
      .select('*')
      .eq('id', req.params.id)
      .eq('created_by', req.user.userId)
      .single();

    if (fetchError || !survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    if (survey.status !== 'PUBLISHED') {
      return res.status(400).json({ error: 'Survey is not published' });
    }

    // Update survey status to DRAFT
    const { data: updatedSurvey, error: updateError } = await supabaseAdmin
      .from('surveys')
      .update({
        status: 'DRAFT'
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) {
      console.error('Unpublish survey error:', updateError);
      return res.status(500).json({ error: 'Server error unpublishing survey' });
    }

    res.json({
      message: 'Survey unpublished successfully',
      survey: updatedSurvey
    });
  } catch (error) {
    console.error('Unpublish survey error:', error);
    res.status(500).json({ error: 'Server error unpublishing survey' });
  }
});

// Get single survey details
router.get('/surveys/:id', async (req, res) => {
  try {
    // Check if survey exists and belongs to user
    const { data: survey, error: surveyError } = await supabaseAdmin
      .from('surveys')
      .select('*')
      .eq('id', req.params.id)
      .eq('created_by', req.user.userId)
      .single();

    if (surveyError || !survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    // Get survey questions
    const { data: questions } = await supabaseAdmin
      .from('questions')
      .select('*')
      .eq('survey_id', req.params.id)
      .order('"order"', { ascending: true });

    // Get response count
    const { count: responseCount } = await supabaseAdmin
      .from('user_responses')
      .select('*', { count: 'exact', head: true })
      .eq('survey_id', req.params.id);

    // Format survey
    const formattedSurvey = {
      id: survey.id,
      title: survey.title,
      description: survey.description,
      createdBy: survey.created_by,
      status: survey.status,
      responseCount: responseCount || 0,
      targetAudience: survey.target_audience,
      startDate: survey.start_date,
      endDate: survey.end_date,
      createdAt: survey.created_at,
      updatedAt: survey.updated_at,
      questions: (questions || []).map(q => ({
        id: q.id,
        questionText: q.text,
        type: q.type === 'short_answer' ? 'SHORT_ANSWER' : q.type === 'multiple_choice' ? 'MULTIPLE_CHOICE' : 'SHORT_ANSWER',
        required: q.is_required,
        order: q.order,
        options: q.options || []
      }))
    };

    res.json({ survey: formattedSurvey });
  } catch (error) {
    console.error('Get survey details error:', error);
    res.status(500).json({ error: 'Server error fetching survey details' });
  }
});

// Get survey responses
router.get('/surveys/:id/responses', async (req, res) => {
  try {
    // Check if survey exists and belongs to user
    const { data: survey, error: surveyError } = await supabaseAdmin
      .from('surveys')
      .select('*')
      .eq('id', req.params.id)
      .eq('created_by', req.user.userId)
      .single();

    if (surveyError || !survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Get responses with user info
    const { data: responses, error: responsesError } = await supabaseAdmin
      .from('user_responses')
      .select(`
        *,
        user_id (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('survey_id', req.params.id)
      .order('submitted_at', { ascending: false })
      .range((pageNum - 1) * limitNum, pageNum * limitNum - 1);

    if (responsesError) {
      console.error('Get responses error:', responsesError);
      return res.status(500).json({ error: 'Server error fetching responses' });
    }

    // Get total count
    const { count, error: countError } = await supabaseAdmin
      .from('user_responses')
      .select('*', { count: 'exact', head: true })
      .eq('survey_id', req.params.id);

    // Get survey questions
    const { data: questions } = await supabaseAdmin
      .from('questions')
      .select('*')
      .eq('survey_id', req.params.id)
      .order('"order"', { ascending: true });

    // Format survey and responses
    const formattedSurvey = {
      id: survey.id,
      title: survey.title,
      description: survey.description,
      createdBy: survey.created_by,
      status: survey.status,
      responseCount: survey.response_count,
      targetAudience: survey.target_audience,
      startDate: survey.start_date,
      endDate: survey.end_date,
      createdAt: survey.created_at,
      updatedAt: survey.updated_at,
      questions: (questions || []).map(q => ({
        id: q.id,
        questionText: q.text,
        type: q.type === 'short_answer' ? 'SHORT_ANSWER' : q.type === 'multiple_choice' ? 'MULTIPLE_CHOICE' : 'SHORT_ANSWER',
        required: q.is_required,
        order: q.order,
        options: q.options || []
      }))
    };

    // Get answers for each response
    const responseIds = (responses || []).map(r => r.id);
    let answersData = [];
    
    if (responseIds.length > 0) {
      const { data: answers } = await supabaseAdmin
        .from('answers')
        .select('*')
        .in('response_id', responseIds)
        .order('question_id');
      
      answersData = answers || [];
    }

    // Format responses
    const formattedResponses = (responses || []).map(response => {
      const responseAnswers = answersData
        .filter(answer => answer.response_id === response.id)
        .map(answer => ({
          questionId: answer.question_id,
          answer: answer.answer_text || answer.rating || answer.answer_options,
          questionType: answer.answer_text ? 'text' : answer.rating ? 'rating' : 'options'
        }));

      return {
        id: response.id,
        userId: {
          _id: response.user_id?.id,
          fullName: `${response.user_id?.first_name || ''} ${response.user_id?.last_name || ''}`.trim(),
          email: response.user_id?.email
        },
        surveyId: response.survey_id,
        submittedAt: response.submitted_at,
        completionTime: response.completion_time,
        answers: responseAnswers,
        isCompleted: response.is_completed
      };
    });

    res.json({
      survey: formattedSurvey,
      responses: formattedResponses,
      pagination: {
        current: pageNum,
        pages: Math.ceil((count || 0) / limitNum),
        total: count || 0
      }
    });
  } catch (error) {
    console.error('Get survey responses error:', error);
    res.status(500).json({ error: 'Server error fetching survey responses' });
  }
});

// Get specific response details
router.get('/surveys/:id/responses/:userId', async (req, res) => {
  try {
    // Check if survey exists and belongs to user
    const { data: survey, error: surveyError } = await supabaseAdmin
      .from('surveys')
      .select('*')
      .eq('id', req.params.id)
      .eq('created_by', req.user.userId)
      .single();

    if (surveyError || !survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    // Get response with user info
    const { data: response, error: responseError } = await supabaseAdmin
      .from('user_responses')
      .select(`
        *,
        user_id (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('survey_id', req.params.id)
      .eq('user_id', req.params.userId)
      .single();

    if (responseError || !response) {
      return res.status(404).json({ error: 'Response not found' });
    }

    // Get survey questions
    const { data: questions } = await supabaseAdmin
      .from('questions')
      .select('*')
      .eq('survey_id', req.params.id)
      .order('"order"', { ascending: true });

    // Get answers for this specific response
    const { data: answersData } = await supabaseAdmin
      .from('answers')
      .select('*')
      .eq('response_id', response.id)
      .order('question_id');

    // Format answers
    const formattedAnswers = (answersData || []).map(answer => ({
      questionId: answer.question_id,
      answer: answer.answer_text || answer.rating || answer.answer_options,
      questionType: answer.answer_text ? 'text' : answer.rating ? 'rating' : 'options'
    }));
    
    const formattedSurvey = {
      id: survey.id,
      title: survey.title,
      description: survey.description,
      questions: (questions || []).map(q => ({
        id: q.id,
        questionText: q.text,
        type: q.type === 'short_answer' ? 'SHORT_ANSWER' : q.type === 'multiple_choice' ? 'MULTIPLE_CHOICE' : 'SHORT_ANSWER',
        required: q.is_required,
        order: q.order,
        options: q.options || []
      }))
    };

    const formattedResponse = {
      id: response.id,
      userId: {
        _id: response.user_id?.id,
        fullName: `${response.user_id?.first_name || ''} ${response.user_id?.last_name || ''}`.trim(),
        email: response.user_id?.email
      },
      surveyId: response.survey_id,
      submittedAt: response.submitted_at,
      completionTime: response.completion_time,
      answers: formattedAnswers,
      isCompleted: response.is_completed
    };

    res.json({ 
      response: formattedResponse,
      survey: formattedSurvey 
    });
  } catch (error) {
    console.error('Get response details error:', error);
    res.status(500).json({ error: 'Server error fetching response details' });
  }
});

module.exports = router;
