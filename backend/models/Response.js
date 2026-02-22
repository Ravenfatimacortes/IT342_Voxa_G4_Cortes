const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  questionType: {
    type: String,
    enum: ['MULTIPLE_CHOICE', 'SHORT_ANSWER'],
    required: true
  },
  answer: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
});

const responseSchema = new mongoose.Schema({
  surveyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Survey',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [answerSchema],
  submittedAt: {
    type: Date,
    default: Date.now
  },
  completionTime: {
    type: Number, // in seconds
    required: true
  },
  ipAddress: {
    type: String
  }
}, {
  timestamps: true
});

// Ensure one response per user per survey
responseSchema.index({ surveyId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Response', responseSchema);
