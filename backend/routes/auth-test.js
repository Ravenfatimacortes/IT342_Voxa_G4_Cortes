const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Simple in-memory user store for testing
const users = [];

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback-secret-voxa-app-2024', {
    expiresIn: process.env.JWT_EXPIRE || '24h'
  });
};

// Register user
router.post('/register', async (req, res) => {
  try {
    console.log('Test registration request:', req.body);
    
    const { fullName, email, password } = req.body;
    
    // Basic validation
    if (!fullName || fullName.length < 2) {
      return res.status(400).json({ error: 'Full name must be at least 2 characters' });
    }
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Split fullName into firstName and lastName
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || 'Name';

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = {
      id: users.length + 1,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: 'student'
    };
    
    users.push(user);
    console.log('Test user created:', user.email);

    // Generate token
    const token = generateToken(user.id);

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
  } catch (error) {
    console.error('Test registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    console.log('Test login request:', req.body);
    const { email, password } = req.body;

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
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
    console.error('Test login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-voxa-app-2024');
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token or user not found.' });
    }

    res.json({
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
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
