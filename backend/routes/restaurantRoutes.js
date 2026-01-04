const express = require('express');
const router = express.Router();
const { createRestaurant, getRestaurants, getRestaurantById } = require('../controllers/restaurantController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.route('/')
    .post(protect, authorize('owner', 'admin'), upload.single('image'), createRestaurant)
    .get(getRestaurants);

router.route('/:id').get(getRestaurantById);

module.exports = router;
