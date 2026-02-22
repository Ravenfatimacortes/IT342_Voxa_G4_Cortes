const express = require('express');
const { body, validationResult } = require('express-validator');
const Survey = require('../models/Survey');
const Response = require('../models/Response');
const { auth } = require('../middleware/auth');

const router = express.Router();

// All survey routes require authentication
router.use(auth);

// Get available surveys for students
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { status: 'PUBLISHED' };

    // Check if user has already responded to surveys
    const userResponses = await Response.find({ userId: req.user._id })
      .distinct('surveyId');

    let surveys;
    
    if (status === 'completed') {
      // Get surveys user has completed
      query._id = { $in: userResponses };
    } else if (status === 'available') {
      // Get surveys user hasn't completed yet
      query._id = { $nin: userResponses };
    }

    surveys = await Survey.find(query)
      .populate('createdBy', 'fullName')
      .sort({ publishedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Add completion status for each survey
    const surveysWithStatus = surveys.map(survey => ({
      ...survey.toObject(),
      isCompleted: userResponses.includes(survey._id.toString())
    }));

    const total = await Survey.countDocuments(query);

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
      _id: req.params.id,
      status: 'PUBLISHED'
    }).populate('createdBy', 'fullName');

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    // Check if user has already responded
    const existingResponse = await Response.findOne({
      surveyId: req.params.id,
      userId: req.user._id
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

// Submit survey response
router.post('/:id/responses', [
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

    const survey = await Survey.findOne({
      _id: req.params.id,
      status: 'PUBLISHED'
    });

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    // Check if user has already responded
    const existingResponse = await Response.findOne({
      surveyId: req.params.id,
      userId: req.user._id
    });

    if (existingResponse) {
      return res.status(400).json({ error: 'You have already responded to this survey' });
    }

    const { answers, completionTime } = req.body;

    // Validate answers against survey questions
    const surveyQuestionIds = survey.questions.map(q => q._id.toString());
    const answerQuestionIds = answers.map(a => a.questionId.toString());

    // Check if all required questions are answered
    const requiredQuestions = survey.questions.filter(q => q.required);
    const answeredQuestionIds = answers.map(a => a.questionId.toString());

    for (const question of requiredQuestions) {
      if (!answeredQuestionIds.includes(question._id.toString())) {
        return res.status(400).json({
          error: `Required question "${question.questionText}" is not answered`
        });
      }
    }

    // Check if all answered questions exist in the survey
    for (const questionId of answerQuestionIds) {
      if (!surveyQuestionIds.includes(questionId)) {
        return res.status(400).json({
          error: 'Invalid question ID in answers'
        });
      }
    }

    // Validate multiple choice answers
    for (const answer of answers) {
      const question = survey.questions.find(q => q._id.toString() === answer.questionId.toString());
      
      if (question.type === 'MULTIPLE_CHOICE') {
        if (!question.options.includes(answer.answer)) {
          return res.status(400).json({
            error: `Invalid option for question: ${question.questionText}`
          });
        }
      }
    }

    // Create response
    const response = new Response({
      surveyId: req.params.id,
      userId: req.user._id,
      answers: answers.map(answer => {
        const question = survey.questions.find(q => q._id.toString() === answer.questionId.toString());
        return {
          questionId: answer.questionId,
          questionText: question.questionText,
          questionType: question.type,
          answer: answer.answer
        };
      }),
      completionTime,
      ipAddress: req.ip
    });

    await response.save();

    // Update survey response count
    await survey.incrementResponseCount();

    res.status(201).json({
      message: 'Response submitted successfully',
      response
    });
  } catch (error) {
    console.error('Submit response error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'You have already responded to this survey' });
    }
    res.status(500).json({ error: 'Server error submitting response' });
  }
});

module.exports = router;
