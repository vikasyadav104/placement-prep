const express = require('express');
const router = express.Router();
const { fetchLeetcodeStats } = require('../controllers/leetcodeController');
const protect = require('../middleware/temp');

router.get('/fetch', protect, fetchLeetcodeStats);

module.exports = router;