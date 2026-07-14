const express = require('express');
const router = express.Router();
const { fetchCodeforcesStats } = require('../controllers/codeforcesController');
const protect = require('../middleware/AuthMiddleware');

router.get('/fetch', protect, fetchCodeforcesStats);

module.exports = router;