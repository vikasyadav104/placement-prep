const express = require('express');
const router = express.Router();
const { generateInterviewQuestions, saveInterviewScore} = require('../controllers/interviewController');
const protect = require('../middleware/authMiddleware');
const { submitInterviewSession, getInterviewHistory } = require('../controllers/interviewSessionController');

router.post('/generate-questions', protect, generateInterviewQuestions);
router.post('/save-score', protect, saveInterviewScore);
router.post('/submit-session', protect, submitInterviewSession);
router.get('/history', protect, getInterviewHistory);

module.exports = router;