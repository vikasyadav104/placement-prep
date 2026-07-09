const mongoose = require('mongoose');

const interviewSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  overallScore: {
    type: Number,
    required: true,
  },
  overallFeedback: {
    type: String,
    required: true,
  },
  detailedAnalysis: [{
    question: String,
    userAnswer: String,
    critique: String,
    idealResponse: String,
    score: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);