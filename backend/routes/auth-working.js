const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

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
    
    const { fullName, email, password } = req.body;
    
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

    // Split fullName into firstName and lastName
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || 'Name';
    
    console.log('Split names:', { firstName, lastName });

    // Check if user already exists
    console.log('Checking if user exists...');
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create new user
    console.log('Creating new user...');
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: 'student'
    });
    console.log('✅ User created successfully:', user.id);

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
        role: 'student'
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
    const user = await User.findOne({ where: { email } });
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
    const user = await User.findByPk(req.user.userId);
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

// Logout
router.post('/logout', auth, async (req, res) => {
  res.json({ message: 'Logout successful' });
});

module.exports = router;
