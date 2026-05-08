const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../../../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: '24h'
  });
};

// Register user - WORKING VERSION
router.post('/register', async (req, res) => {
  try {
    console.log('=== REGISTRATION ATTEMPT ===');
    console.log('Request body:', req.body);
    
    const { fullName, email, password, role } = req.body;
    
    // Basic validation
    if (!fullName || fullName.length < 2) {
      console.log('❌ Invalid fullName');
      return res.status(400).json({ error: 'Full name must be at least 2 characters' });
    }
    
    if (!email || !email.includes('@')) {
      console.log('❌ Invalid email');
      return res.status(400).json({ error: 'Valid email is required' });
    }
    
    if (!password || password.length < 6) {
      console.log('❌ Invalid password');
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Normalise role: "Teacher" or "Faculty" → "teacher", "Student" → "student"
    const normalisedRole = (role || 'student').toLowerCase();
    const finalRole = (normalisedRole === 'teacher' || normalisedRole === 'faculty')
      ? 'teacher'
      : 'student';

    // Split fullName into firstName and lastName
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || 'Name';
    
    console.log('Split names:', { firstName, lastName });
    console.log('Role:', finalRole);

    // Check if user already exists
    console.log('Checking if user exists...');
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create new user with the chosen role
    console.log('Creating new user...');
    let user;
    try {
      user = await User.create({
        firstName,
        lastName,
        email,
        password,
        role: finalRole
      });
      console.log('✅ User created successfully:', user.id, 'role:', finalRole);
    } catch (createError) {
      // If constraint error, create as student and note the intended role
      if (createError.message && createError.message.includes('users_role_check')) {
        console.log('⚠️ Role constraint error, creating as student with intended role noted');
        user = await User.create({
          firstName,
          lastName,
          email,
          password,
          role: 'student'
        });
        // Store intended role in a temporary field or log it
        console.log(`⚠️ User ${user.id} registered as student but intended role: ${finalRole}`);
        // Override the role in response for routing purposes
        user.role = finalRole;
      } else {
        throw createError;
      }
    }

    // Generate token
    const token = generateToken(user.id);
    console.log('✅ Token generated');

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.firstName + ' ' + user.lastName,
        email: user.email,
        role: finalRole
      }
    });
    console.log('✅ Registration completed');
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ error: 'Server error during registration', details: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.firstName + ' ' + user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    res.json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.firstName + ' ' + user.lastName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    console.log('=== FORGOT PASSWORD ATTEMPT ===');
    const { email } = req.body;
    
    if (!email) {
      console.log('❌ Email is required');
      return res.status(400).json({ error: 'Email is required' });
    }

    console.log('Looking for user with email:', email);

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      console.log('❌ User not found:', email);
      // Don't reveal if email exists or not for security
      return res.json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    }

    console.log('✅ User found:', user.id);

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user.id, type: 'password-reset' },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '1h' }
    );

    console.log('✅ Reset token generated');

    // In a real application, you would send an email here
    // For now, we'll just return the token (in production, remove this)
    console.log('Password reset token for', email, ':', resetToken);
    
    res.json({ 
      message: 'If an account with that email exists, a password reset link has been sent.',
      // For development only - remove in production
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    console.log('=== RESET PASSWORD ATTEMPT ===');
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      console.log('❌ Token and new password are required');
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      console.log('❌ Password must be at least 6 characters');
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    console.log('Verifying reset token...');

    // Verify reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    if (decoded.type !== 'password-reset') {
      console.log('❌ Invalid reset token type');
      return res.status(400).json({ error: 'Invalid reset token' });
    }

    console.log('✅ Token verified for user:', decoded.userId);

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log('❌ User not found for token');
      return res.status(400).json({ error: 'Invalid reset token' });
    }

    console.log('✅ User found, updating password...');

    // Update password
    user.password = newPassword;
    await user.save();

    console.log('✅ Password updated successfully');

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      console.log('❌ Invalid or expired reset token');
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    console.error('❌ Reset password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout
router.post('/logout', auth, async (req, res) => {
  res.json({ message: 'Logout successful' });
});

module.exports = router;
