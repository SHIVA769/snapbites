const express = require('express');
const router = express.Router();
const { getUserProfile, getCommissionStats, getUserActivities, toggleFollow } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/:id/profile', getUserProfile);
router.get('/commission-stats', protect, getCommissionStats);
router.get('/activities', protect, getUserActivities);
router.post('/:id/follow', protect, toggleFollow);

module.exports = router;
