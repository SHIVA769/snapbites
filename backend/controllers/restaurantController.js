const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

const getRestaurantById = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

        const menuItems = await MenuItem.find({ restaurant: req.params.id });
        res.json({ restaurant, menuItems });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createRestaurant = async (req, res) => {
    try {
        const { name, cuisine, description, address, location } = req.body;

        const restaurant = await Restaurant.create({
            owner: req.user._id,
            name,
            cuisine,
            description,
            address,
            location: location ? JSON.parse(location) : { lat: 0, lng: 0 },
            image: req.file ? `/uploads/${req.file.filename}` : ''
        });

        res.status(201).json(restaurant);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.find({});
        res.json(restaurants);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createRestaurant, getRestaurants, getRestaurantById };
