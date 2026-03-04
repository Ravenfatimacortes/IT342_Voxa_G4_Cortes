const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectDB, sequelize } = require('./config/database');
const authRoutes = require('./routes/auth-working');
const surveyRoutes = require('./routes/surveys');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const postRoutes = require('./routes/posts');

const app = express();

// Connect to XAMPP MySQL Database
connectDB().then(() => {
  // Sync database models
  const User = require('./models/User');
  const { Survey, Question } = require('./models/Survey');
  const { Response, Answer } = require('./models/Response');
  const Post = require('./models/Post');
  const Comment = require('./models/Comment');
  const Like = require('./models/Like');
  
  // Set up associations
  User.hasMany(Survey, { foreignKey: 'createdBy', as: 'surveys' });
  Survey.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
  
  User.hasMany(Response, { foreignKey: 'userId', as: 'responses' });
  Response.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  
  Survey.hasMany(Response, { foreignKey: 'surveyId', as: 'responses' });
  Response.belongsTo(Survey, { foreignKey: 'surveyId', as: 'survey' });
  
  // Post associations
  User.hasMany(Post, { foreignKey: 'userId', as: 'posts' });
  Post.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  
  Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });
  Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' });
  
  User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
  Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  
  Post.hasMany(Like, { foreignKey: 'postId', as: 'postLikes' });
  Like.belongsTo(Post, { foreignKey: 'postId', as: 'post' });
  
  User.hasMany(Like, { foreignKey: 'userId', as: 'likes' });
  Like.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  
  // Sync all models with database
  sequelize.sync({ force: false, alter: true })
    .then(() => {
      console.log('Database synchronized successfully');
    })
    .catch(err => {
      console.error('Error synchronizing database:', err);
    });
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-production-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:19006'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/surveys', surveyRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/posts', postRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Voxa API is running',
    database: 'XAMPP MySQL',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

module.exports = app;
