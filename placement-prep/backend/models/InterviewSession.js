const mongoose = require('mongoose');

const interviewSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  questions: [
    {
      question: { type: String, required: true },
      type: { type: String, enum: ['resume', 'dsa', 'behavioral'], required: true },
      userAnswerTranscript: { type: String, default: '' },
      timeTakenSeconds: { type: Number, default: 0 },
      feedback: { type: String, default: '' },
      suggestedAnswer: { type: String, default: '' },
    },
  ],
  overallFeedback: {
    type: String,
    default: '',
  },
}, { timestamps: true });

const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);

module.exports = InterviewSession;