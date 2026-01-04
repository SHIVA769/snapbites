const express = require('express');
const router = express.Router();
const {
    getRestaurantMenuItems,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem
} = require('../controllers/menuItemController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.route('/')
    .post(protect, authorize('owner', 'admin'), createMenuItem);

router.route('/:id')
    .patch(protect, authorize('owner', 'admin'), updateMenuItem)
    .delete(protect, authorize('owner', 'admin'), deleteMenuItem);

router.get('/restaurant/:restaurantId', getRestaurantMenuItems);

module.exports = router;
