const express = require('express');
const router = express.Router();
const { getTopicScores } = require('../controllers/scoreController');
const protect = require('../middleware/AuthMiddleware');

router.get('/topics', protect, getTopicScores);

module.exports = router;