const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabaseAdmin } = require('../config/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get available surveys for all users (students and faculty)
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Get surveys user has already responded to
    const { data: userResponses } = await supabaseAdmin
      .from('responses')
      .select('survey_id')
      .eq('user_id', req.user.userId);
    
    const respondedSurveyIds = userResponses.map(r => r.survey_id);

    // Fetch all published surveys with creator information
    let { data: surveys, count, error } = await supabaseAdmin
      .from('surveys')
      .select(`
        *,
        users!surveys_created_by_fkey (
          firstName,
          lastName,
          email
        )
      `, { count: 'exact' })
      .eq('status', 'PUBLISHED')
      .order('created_at', { ascending: false });
    
    
    // Filter by completion status if requested
    if (status === 'completed') {
      surveys = surveys.filter(s => respondedSurveyIds.includes(s.id));
    } else if (status === 'available') {
      surveys = surveys.filter(s => !respondedSurveyIds.includes(s.id));
    }

    const total = surveys.length;

    // Manual pagination
    const paginated = surveys.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    // Format surveys and add completion status
    const surveysWithStatus = paginated.map(survey => ({
      id: survey.id,
      title: survey.title,
      description: survey.description,
      createdBy: survey.created_by,
      creator: survey.users ? {
        firstName: survey.users.firstName,
        lastName: survey.users.lastName,
        fullName: `${survey.users.firstName} ${survey.users.lastName}`,
        email: survey.users.email
      } : null,
      status: survey.status,
      responseCount: survey.response_count,
      targetAudience: survey.target_audience,
      startDate: survey.start_date,
      endDate: survey.end_date,
      createdAt: survey.created_at,
      updatedAt: survey.updated_at,
      isCompleted: respondedSurveyIds.includes(survey.id)
    }));

    res.json({
      surveys: surveysWithStatus,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total
      }
    });
  } catch (error) {
    console.error('Get surveys error:', error);
    res.status(500).json({ error: 'Server error fetching surveys' });
  }
});

// Get specific survey details
router.get('/:id', auth, async (req, res) => {
  try {
    // Get survey details
    const { data: survey, error: surveyError } = await supabaseAdmin
      .from('surveys')
      .select('*')
      .eq('id', req.params.id)
      .eq('status', 'PUBLISHED')
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

    // Check if user has already responded
    const { data: existingResponse } = await supabaseAdmin
      .from('responses')
      .select('*')
      .eq('survey_id', req.params.id)
      .eq('user_id', req.user.userId)
      .single();

    // Format survey with questions
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
        type: q.type === 'text' ? 'SHORT_ANSWER' : q.type === 'multiple' ? 'MULTIPLE_CHOICE' : 'SHORT_ANSWER',
        required: true,
        order: q.order,
        options: q.options || []
      }))
    };

    res.json({
      survey: formattedSurvey,
      hasResponded: !!existingResponse
    });
  } catch (error) {
    console.error('Get survey error:', error);
    res.status(500).json({ error: 'Server error fetching survey' });
  }
});

// Create new survey
router.post('/', [
  auth,
  body('title').notEmpty().withMessage('Survey title is required'),
  body('description').optional().isString(),
  body('questions').isArray({ min: 1 }).withMessage('At least one question is required'),
  body('questions.*.text').notEmpty().withMessage('Question text is required'),
  body('questions.*.type').isIn(['multiple', 'text', 'rating']).withMessage('Invalid question type'),
  body('questions.*.options').if(body('questions.*.type').equals('multiple')).isArray({ min: 2 }).withMessage('Multiple choice questions need at least 2 options')
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
    console.log('=== SURVEY CREATION ATTEMPT ===');
    console.log('Request body:', req.body);
    console.log('User from auth:', req.user);

    // Create the survey
    const { data: survey, error: surveyError } = await supabaseAdmin
      .from('surveys')
      .insert([{
        title,
        description,
        created_by: req.user.userId,
        status: 'PUBLISHED',
        response_count: 0
      }])
      .select()
      .single();

    if (surveyError) {
      console.error('❌ Survey creation error:', surveyError);
      return res.status(500).json({ error: 'Failed to create survey', details: surveyError.message });
    }

    console.log('✅ Survey created successfully:', survey);

    // Create questions for the survey
    const questionsToInsert = questions.map((question, index) => ({
      survey_id: survey.id,
      text: question.text,
      type: question.type,
      options: question.options || null,
      "order": index + 1
    }));

    const { data: createdQuestions, error: questionsError } = await supabaseAdmin
      .from('questions')
      .insert(questionsToInsert)
      .select();

    if (questionsError) {
      console.error('❌ Questions creation error:', questionsError);
      // Rollback survey creation
      await supabaseAdmin.from('surveys').delete().eq('id', survey.id);
      return res.status(500).json({ error: 'Failed to create questions', details: questionsError.message });
    }

    console.log('✅ Questions created successfully:', createdQuestions);

    res.status(201).json({
      ...survey,
      questions: createdQuestions
    });
  } catch (error) {
    console.error('❌ Create survey error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Submit survey response
router.post('/:id/responses', [
  auth,
  body('answers').isArray({ min: 1 })
    .withMessage('At least one answer is required'),
  body('answers.*.questionId').notEmpty()
    .withMessage('Question ID is required'),
  body('answers.*.answer').notEmpty()
    .withMessage('Answer is required'),
  body('completionTime').isInt({ min: 1 })
    .withMessage('Completion time must be a positive integer')
], async (req, res) => {
  try {
    console.log('=== SURVEY RESPONSE SUBMISSION ATTEMPT ===');
    console.log('Request body:', req.body);
    console.log('Survey ID:', req.params.id);
    console.log('User from auth:', req.user);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { answers, completionTime } = req.body;
    const surveyId = req.params.id;
    
    console.log('Processing survey response for survey:', surveyId);
    console.log('Answers count:', answers?.length || 0);

    // Check if survey exists
    const { data: survey, error: surveyError } = await supabaseAdmin
      .from('surveys')
      .select('*')
      .eq('id', surveyId)
      .eq('status', 'PUBLISHED')
      .single();
    
    if (surveyError || !survey) {
      console.log('❌ Survey not found or error:', surveyError);
      return res.status(404).json({ error: 'Survey not found' });
    }
    
    console.log('✅ Survey found:', survey);

    // Check if user has already responded
    const { data: existingResponse } = await supabaseAdmin
      .from('responses')
      .select('*')
      .eq('survey_id', surveyId)
      .eq('user_id', req.user.userId)
      .single();
    
    if (existingResponse) {
      console.log('❌ User already responded:', existingResponse);
      return res.status(400).json({ error: 'You have already responded to this survey' });
    }

    console.log('✅ User has not responded yet, creating response...');
    
    // Create response first
    const { data: response, error: responseError } = await supabaseAdmin
      .from('responses')
      .insert([{
        survey_id: surveyId,
        user_id: req.user.userId,
        completion_time: completionTime,
        is_completed: true,
        submitted_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (responseError) {
      console.error('❌ Create response error:', responseError);
      return res.status(500).json({ error: 'Server error creating response', details: responseError.message });
    }
    
    console.log('✅ Response created successfully:', response);

    // Store individual answers in the answers table
    const answersToInsert = answers.map(answer => {
      const answerRecord = {
        response_id: response.id,
        question_id: answer.questionId,
      };

      // Store answer based on question type
      if (typeof answer.answer === 'string') {
        answerRecord.answer_text = answer.answer;
      } else if (typeof answer.answer === 'number') {
        answerRecord.rating = answer.answer;
      } else {
        answerRecord.answer_options = answer.answer;
      }

      return answerRecord;
    });

    // Insert all answers
    const { data: insertedAnswers, error: answersError } = await supabaseAdmin
      .from('answers')
      .insert(answersToInsert)
      .select();

    if (answersError) {
      console.error('Insert answers error:', answersError);
      // Rollback response creation if answers fail
      await supabaseAdmin
        .from('responses')
        .delete()
        .eq('id', response.id);
      
      return res.status(500).json({ error: 'Server error saving answers' });
    }

    // Update survey response count
    await supabaseAdmin.rpc('increment_response_count', { 
      survey_id_param: surveyId 
    });

    // Return success response
    res.status(201).json({
      message: 'Survey response submitted successfully',
      responseId: response.id,
      answersCount: insertedAnswers.length
    });
  } catch (error) {
    console.error('Submit response error:', error);
    res.status(500).json({ error: 'Server error submitting response' });
  }
});

module.exports = router;
