const express = require('express');
const router = express.Router();
const protect = require('../middleware/temp');
const { generateInterviewRoadmap } = require('../controllers/aiInterviewController');

router.post('/generate-from-interview', protect, generateInterviewRoadmap);

module.exports = router;