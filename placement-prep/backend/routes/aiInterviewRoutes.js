const express = require('express');
const router = express.Router();
const protect = require('../middleware/AuthMiddleware');
const { generateInterviewRoadmap } = require('../controllers/aiInterviewController');

router.post('/generate-from-interview', protect, generateInterviewRoadmap);

module.exports = router;