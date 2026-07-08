const express = require('express');
const router = express.Router();
const { fetchLeetcodeStats } = require('../controllers/leetcodeController');
const protect = require('../middleware/authMiddleware');

router.get('/fetch', protect, fetchLeetcodeStats);

module.exports = router;