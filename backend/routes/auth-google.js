const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Initialize passport
require('../config/passport')(passport);

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: '24h'
  });
};

// Google OAuth routes
router.get('/', passport.authenticate('google', { 
  scope: ['profile', 'email'],
  prompt: 'select_account'
}));

router.get(
  '/callback',
  passport.authenticate('google', { failureRedirect: '/login?error=google-auth-failed' }),
  async (req, res) => {
    try {
      // Generate JWT token
      const token = generateToken(req.user.id);

      // Redirect to frontend with token
      res.redirect(`http://localhost:3000/auth/success?token=${token}&user=${encodeURIComponent(JSON.stringify({
        id: req.user.id,
        firstName: req.user.first_name,
        lastName: req.user.last_name,
        email: req.user.email,
        avatar: req.user.avatar,
        role: req.user.role
      }))}`);
    } catch (error) {
      console.error('Google auth callback error:', error);
      res.redirect('http://localhost:3000/login?error=server-error');
    }
  }
);

// Get current user (for frontend)
router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      user: {
        id: req.user.id,
        firstName: req.user.first_name,
        lastName: req.user.last_name,
        email: req.user.email,
        avatar: req.user.avatar,
        role: req.user.role
      }
    });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('http://localhost:3000/login');
});

module.exports = router;
