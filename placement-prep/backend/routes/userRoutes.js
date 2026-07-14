const express = require('express');
const router = express.Router();
const protect = require('../middleware/AuthMiddleware');

// Import BOTH of your controllers now
const { syncProfiles, getUserProfile } = require('../controllers/userController');

// Route 1: Syncing the IDs (POST request)
router.post('/sync-profiles', protect, syncProfiles);

// Route 2: Fetching the profile data (GET request)
router.get('/profile', protect, getUserProfile);

module.exports = router;