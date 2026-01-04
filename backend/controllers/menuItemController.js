const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

// @desc    Get all menu items for a restaurant
// @route   GET /api/menu-items/restaurant/:restaurantId
// @access  Public
const getRestaurantMenuItems = async (req, res) => {
    try {
        const menuItems = await MenuItem.find({ restaurant: req.params.restaurantId });
        res.json(menuItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a menu item
// @route   POST /api/menu-items
// @access  Private/Owner
const createMenuItem = async (req, res) => {
    try {
        const { restaurantId, name, description, price, category } = req.body;

        // Check if restaurant exists and belongs to user
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        if (restaurant.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to add items to this restaurant' });
        }

        const menuItem = await MenuItem.create({
            restaurant: restaurantId,
            name,
            description,
            price,
            category
        });

        res.status(201).json(menuItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a menu item
// @route   PATCH /api/menu-items/:id
// @access  Private/Owner
const updateMenuItem = async (req, res) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id);
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        // Check ownership via restaurant
        const restaurant = await Restaurant.findById(menuItem.restaurant);
        if (restaurant.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this item' });
        }

        const updatedItem = await MenuItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json(updatedItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a menu item
// @route   DELETE /api/menu-items/:id
// @access  Private/Owner
const deleteMenuItem = async (req, res) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id);
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        // Check ownership
        const restaurant = await Restaurant.findById(menuItem.restaurant);
        if (restaurant.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this item' });
        }

        await menuItem.deleteOne();
        res.json({ message: 'Menu item removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getRestaurantMenuItems,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem
};
