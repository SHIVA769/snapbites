const Reel = require('../models/Reel');
const User = require('../models/User');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { trackActivity } = require('../utils/activity.service');

const placeOrder = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id })
            .populate('items.menuItem')
            .populate({
                path: 'items.reel',
                populate: { path: 'creator', select: 'commissionRate' }
            });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        const totalAmount = cart.items.reduce((acc, item) => acc + item.quantity * item.price, 0);

        const orderItems = await Promise.all(cart.items.map(async (i) => {
            let commission = { amount: 0 };

            if (i.reel && i.reel.creator) {
                const rate = i.reel.creator.commissionRate || 0.05;
                commission = {
                    creator: i.reel.creator._id,
                    amount: i.price * i.quantity * rate
                };
            }

            return {
                menuItem: i.menuItem._id,
                name: i.menuItem.name,
                quantity: i.quantity,
                price: i.price,
                reel: i.reel ? i.reel._id : null,
                commission
            };
        }));

        const order = await Order.create({
            user: req.user._id,
            restaurant: cart.restaurant,
            items: orderItems,
            totalAmount,
            status: 'placed'
        });

        // Clear Cart
        cart.items = [];
        await cart.save();

        // Track "order" activity for each unique reel involved
        const uniqueReelIds = [...new Set(orderItems.filter(i => i.reel).map(i => i.reel.toString()))];

        if (uniqueReelIds.length > 0) {
            uniqueReelIds.forEach(reelId => {
                trackActivity({
                    userId: req.user._id,
                    action: 'order',
                    reelId,
                    orderId: order._id
                });
            });
        } else {
            // Track base order activity if no reels involved
            trackActivity({
                userId: req.user._id,
                action: 'order',
                orderId: order._id
            });
        }

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { placeOrder, getMyOrders };
