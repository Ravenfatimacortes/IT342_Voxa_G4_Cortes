const express = require('express');
const { body, validationResult } = require('express-validator');
const { Survey, Question } = require('../models/Survey');
const { Response, Answer } = require('../models/Response');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get available surveys for students
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const whereClause = { status: 'PUBLISHED' };

    // Check if user has already responded to surveys
    const userResponses = await Response.findAll({
      where: { userId: req.user.userId },
      attributes: ['surveyId']
    });
    const respondedSurveyIds = userResponses.map(r => r.surveyId);

    let surveys;
    
    if (status === 'completed') {
      // Get surveys user has completed
      whereClause.id = { [require('sequelize').Op.in]: respondedSurveyIds };
    } else if (status === 'available') {
      // Get surveys user hasn't completed yet
      whereClause.id = { [require('sequelize').Op.notIn]: respondedSurveyIds };
    }

    surveys = await Survey.findAll({
      where: whereClause,
      include: [{
        model: require('../models/User'),
        as: 'creator',
        attributes: ['id', 'firstName', 'lastName']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    // Add completion status for each survey
    const surveysWithStatus = surveys.map(survey => ({
      ...survey.toJSON(),
      isCompleted: respondedSurveyIds.includes(survey.id)
    }));

    const total = await Survey.count({ where: whereClause });

    res.json({
      surveys: surveysWithStatus,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get surveys error:', error);
    res.status(500).json({ error: 'Server error fetching surveys' });
  }
});

// Get specific survey details
router.get('/:id', async (req, res) => {
  try {
    const survey = await Survey.findOne({
      where: {
        id: req.params.id,
        status: 'PUBLISHED'
      },
      include: [{
        model: require('../models/User'),
        as: 'creator',
        attributes: ['id', 'firstName', 'lastName']
      }, {
        model: Question,
        as: 'questions',
        order: [['order', 'ASC']]
      }]
    });

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    // Check if user has already responded
    const existingResponse = await Response.findOne({
      where: {
        surveyId: req.params.id,
        userId: req.user.userId
      }
    });

    res.json({
      survey,
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
  body('title').trim().isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description').trim().isLength({ min: 1, max: 1000 })
    .withMessage('Description must be between 1 and 1000 characters'),
  body('questions').isArray({ min: 1 })
    .withMessage('At least one question is required'),
  body('questions.*.text').trim().isLength({ min: 1 })
    .withMessage('Question text is required'),
  body('questions.*.type').isIn(['multiple', 'text', 'rating'])
    .withMessage('Invalid question type'),
  body('questions.*.options').isArray()
    .withMessage('Options must be an array')
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

    // Create survey
    const survey = await Survey.create({
      title,
      description,
      createdBy: req.user.userId,
      status: 'PUBLISHED'
    });

    // Create questions
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      await Question.create({
        surveyId: survey.id,
        text: question.text,
        type: question.type,
        options: question.options || [],
        order: i + 1
      });
    }

    // Return created survey with questions
    const createdSurvey = await Survey.findByPk(survey.id, {
      include: [{
        model: Question,
        as: 'questions',
        order: [['order', 'ASC']]
      }]
    });

    res.status(201).json(createdSurvey);
  } catch (error) {
    console.error('Create survey error:', error);
    res.status(500).json({ error: 'Server error creating survey' });
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { answers, completionTime } = req.body;
    const surveyId = req.params.id;

    // Check if survey exists
    const survey = await Survey.findByPk(surveyId);
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    // Check if user has already responded
    const existingResponse = await Response.findOne({
      where: {
        surveyId,
        userId: req.user.userId
      }
    });

    if (existingResponse) {
      return res.status(400).json({ error: 'You have already responded to this survey' });
    }

    // Create response
    const response = await Response.create({
      surveyId,
      userId: req.user.userId,
      completionTime,
      isCompleted: true
    });

    // Create answers
    for (const answer of answers) {
      await Answer.create({
        responseId: response.id,
        questionId: answer.questionId,
        answerText: typeof answer.answer === 'string' ? answer.answer : JSON.stringify(answer.answer),
        rating: answer.rating || null
      });
    }

    res.status(201).json({
      message: 'Survey response submitted successfully',
      responseId: response.id
    });
  } catch (error) {
    console.error('Submit response error:', error);
    res.status(500).json({ error: 'Server error submitting response' });
  }
});

module.exports = router;
