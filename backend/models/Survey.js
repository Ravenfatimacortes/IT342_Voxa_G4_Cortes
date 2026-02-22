const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
    maxlength: [500, 'Question text cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['MULTIPLE_CHOICE', 'SHORT_ANSWER'],
    required: [true, 'Question type is required']
  },
  options: [{
    type: String,
    trim: true,
    maxlength: [200, 'Option text cannot exceed 200 characters']
  }],
  required: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    required: true
  }
});

const surveySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Survey title is required'],
    trim: true,
    maxlength: [200, 'Survey title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  questions: [questionSchema],
  status: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED', 'CLOSED'],
    default: 'DRAFT'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  publishedAt: {
    type: Date
  },
  expiresAt: {
    type: Date
  },
  responseCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
surveySchema.index({ status: 1, createdAt: -1 });
surveySchema.index({ createdBy: 1 });

// Update response count
surveySchema.methods.incrementResponseCount = function() {
  this.responseCount += 1;
  return this.save();
};

module.exports = mongoose.model('Survey', surveySchema);
