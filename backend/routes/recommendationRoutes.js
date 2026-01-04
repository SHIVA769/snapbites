const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/recommendationController');
const { protect, optionalAuth } = require('../middlewares/authMiddleware');

// Get personalized recommendations (optional auth for public users)
router.get('/', optionalAuth, getRecommendations);

module.exports = router;
