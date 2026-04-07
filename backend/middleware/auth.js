const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Simple in-memory cache for user lookups (5 minute TTL)
const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-voxa-app-2024');
    
    // Check cache first
    const cacheKey = `user_${decoded.userId}`;
    const cachedUser = userCache.get(cacheKey);
    
    let user;
    if (cachedUser && (Date.now() - cachedUser.timestamp) < CACHE_TTL) {
      user = cachedUser.data;
    } else {
      // Fetch from database and cache
      user = await User.findByPk(decoded.userId, {
        attributes: ['id', 'email', 'role', 'firstName', 'lastName', 'profileImageUrl']
      });
      
      if (user) {
        userCache.set(cacheKey, {
          data: user,
          timestamp: Date.now()
        });
        
        // Clean up old cache entries periodically
        if (userCache.size > 100) {
          const now = Date.now();
          for (const [key, value] of userCache.entries()) {
            if (now - value.timestamp > CACHE_TTL) {
              userCache.delete(key);
            }
          }
        }
      }
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token or user not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    res.status(500).json({ error: 'Server error in authentication.' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied. Insufficient permissions.' 
      });
    }
    next();
  };
};

module.exports = { auth, authorize };
