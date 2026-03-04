const express = require('express');
const { body, validationResult } = require('express-validator');
const Survey = require('../models/Survey');
const Response = require('../models/Response');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and faculty/admin role
router.use(auth);
router.use(authorize('FACULTY', 'ADMIN'));

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

    const survey = new Survey({
      title,
      description,
      questions,
      createdBy: req.user._id
    });

    await survey.save();
    await survey.populate('createdBy', 'fullName email');

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
    const query = { createdBy: req.user._id };
    
    if (status) {
      query.status = status;
    }

    const surveys = await Survey.find(query)
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Survey.countDocuments(query);

    res.json({
      surveys,
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

    const survey = await Survey.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    if (survey.status === 'PUBLISHED') {
      return res.status(400).json({ error: 'Cannot edit published survey' });
    }

    const { title, description, questions } = req.body;

    if (title) survey.title = title;
    if (description !== undefined) survey.description = description;
    if (questions) {
      // Validate multiple choice questions have options
      for (const question of questions) {
        if (question.type === 'MULTIPLE_CHOICE' && (!question.options || question.options.length < 2)) {
          return res.status(400).json({
            error: 'Multiple choice questions must have at least 2 options'
          });
        }
      }
      survey.questions = questions;
    }

    await survey.save();
    await survey.populate('createdBy', 'fullName email');

    res.json({
      message: 'Survey updated successfully',
      survey
    });
  } catch (error) {
    console.error('Update survey error:', error);
    res.status(500).json({ error: 'Server error updating survey' });
  }
});

// Delete survey
router.delete('/surveys/:id', async (req, res) => {
  try {
    const survey = await Survey.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    if (survey.status === 'PUBLISHED') {
      return res.status(400).json({ error: 'Cannot delete published survey' });
    }

    await Survey.findByIdAndDelete(req.params.id);

    res.json({ message: 'Survey deleted successfully' });
  } catch (error) {
    console.error('Delete survey error:', error);
    res.status(500).json({ error: 'Server error deleting survey' });
  }
});

// Publish survey
router.post('/surveys/:id/publish', async (req, res) => {
  try {
    const survey = await Survey.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    if (survey.status === 'PUBLISHED') {
      return res.status(400).json({ error: 'Survey is already published' });
    }

    if (!survey.questions || survey.questions.length === 0) {
      return res.status(400).json({ error: 'Survey must have at least one question to publish' });
    }

    survey.status = 'PUBLISHED';
    survey.publishedAt = new Date();

    await survey.save();

    res.json({
      message: 'Survey published successfully',
      survey
    });
  } catch (error) {
    console.error('Publish survey error:', error);
    res.status(500).json({ error: 'Server error publishing survey' });
  }
});

// Unpublish survey
router.post('/surveys/:id/unpublish', async (req, res) => {
  try {
    const survey = await Survey.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    if (survey.status !== 'PUBLISHED') {
      return res.status(400).json({ error: 'Survey is not published' });
    }

    survey.status = 'DRAFT';
    survey.publishedAt = undefined;

    await survey.save();

    res.json({
      message: 'Survey unpublished successfully',
      survey
    });
  } catch (error) {
    console.error('Unpublish survey error:', error);
    res.status(500).json({ error: 'Server error unpublishing survey' });
  }
});

// Get survey responses
router.get('/surveys/:id/responses', async (req, res) => {
  try {
    const survey = await Survey.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    const { page = 1, limit = 10 } = req.query;

    const responses = await Response.find({ surveyId: req.params.id })
      .populate('userId', 'fullName email')
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Response.countDocuments({ surveyId: req.params.id });

    res.json({
      survey,
      responses,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
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
    const survey = await Survey.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    const response = await Response.findOne({
      surveyId: req.params.id,
      userId: req.params.userId
    }).populate('userId', 'fullName email');

    if (!response) {
      return res.status(404).json({ error: 'Response not found' });
    }

    res.json({ response });
  } catch (error) {
    console.error('Get response details error:', error);
    res.status(500).json({ error: 'Server error fetching response details' });
  }
});

module.exports = router;
