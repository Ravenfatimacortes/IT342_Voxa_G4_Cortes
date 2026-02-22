const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Response = require('../models/Response');
const { auth } = require('../middleware/auth');

const router = express.Router();

// All user routes require authentication
router.use(auth);

// Get user's responses
router.get('/responses', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const responses = await Response.find({ userId: req.user._id })
      .populate('surveyId', 'title description createdAt')
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Response.countDocuments({ userId: req.user._id });

    res.json({
      responses,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
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
    const response = await Response.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('surveyId', 'title description createdAt');

    if (!response) {
      return res.status(404).json({ error: 'Response not found' });
    }

    res.json({ response });
  } catch (error) {
    console.error('Get response details error:', error);
    res.status(500).json({ error: 'Server error fetching response details' });
  }
});

// Update user profile
router.put('/profile', [
  body('fullName').optional().trim().isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('email').optional().isEmail().normalizeEmail()
    .withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { fullName, email } = req.body;
    const updateData = {};

    if (fullName) updateData.fullName = fullName;
    if (email) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: req.user._id } 
      });
      
      if (existingUser) {
        return res.status(400).json({ error: 'Email is already taken' });
      }
      
      updateData.email = email;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
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

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');
    
    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Server error changing password' });
  }
});

module.exports = router;
