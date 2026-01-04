const Cart = require('../models/Cart');

const addToCart = async (req, res) => {
    const { restaurantId, menuItemId, quantity, price, reelId } = req.body;
    const userId = req.user._id;

    try {
        let cart = await Cart.findOne({ user: userId });

        if (cart) {
            if (cart.restaurant.toString() !== restaurantId) {
                cart.restaurant = restaurantId;
                cart.items = [];
            }
        } else {
            cart = new Cart({ user: userId, restaurant: restaurantId, items: [] });
        }

        const itemIndex = cart.items.findIndex(p => p.menuItem.toString() === menuItemId);

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += Number(quantity);
            // Update attribution if provided (last touch attribution)
            if (reelId) cart.items[itemIndex].reel = reelId;
        } else {
            cart.items.push({ menuItem: menuItemId, quantity, price, reel: reelId || null });
        }

        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id })
            .populate('items.menuItem', 'name image');
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addToCart, getCart };
