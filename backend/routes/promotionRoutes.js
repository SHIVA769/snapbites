const express = require('express');
const router = express.Router();
const {
    createPromotion,
    getPromotions,
    getPromotionById,
    approvePromotion,
    rejectPromotion,
    cancelPromotion,
    getActivePromotions
} = require('../controllers/promotionController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Public route
router.get('/active', getActivePromotions);

// Protected routes
router.route('/')
    .post(protect, authorize('owner', 'admin'), createPromotion)
    .get(protect, getPromotions);

router.route('/:id')
    .get(protect, getPromotionById)
    .delete(protect, authorize('owner', 'admin'), cancelPromotion);

// Admin only routes
router.patch('/:id/approve', protect, authorize('admin'), approvePromotion);
router.patch('/:id/reject', protect, authorize('admin'), rejectPromotion);

module.exports = router;
