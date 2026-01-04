const express = require('express');
const router = express.Router();
const { generateContent, getCreatorInsights } = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

// Generate AI captions and hashtags (Protected for creators/users)
router.post('/generate', protect, generateContent);

// Get AI performance insights for creators
router.post('/insights', protect, getCreatorInsights);

module.exports = router;
