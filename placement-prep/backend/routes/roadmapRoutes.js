const express = require('express');
const router = express.Router();
const { generateRoadmap } = require('../controllers/roadmapController');
const protect = require('../middleware/temp');

router.post('/generate', protect, generateRoadmap);

module.exports = router;