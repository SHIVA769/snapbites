const express = require('express');
const router = express.Router();
const { placeOrder, getMyOrders } = require('../controllers/orderController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
    .post(protect, placeOrder)
    .get(protect, getMyOrders);

module.exports = router;
