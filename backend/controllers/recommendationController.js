const MenuItem = require('../models/MenuItem');
const UserActivity = require('../models/UserActivity');
const Order = require('../models/Order');

const getRecommendations = async (req, res) => {
    try {
        const { lat, lng } = req.query;
        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);

        // 1. Fetch pool of available items
        const menuItems = await MenuItem.find({ isAvailable: true })
            .populate('restaurant', 'name location cuisine');

        if (!req.user) {
            // Unauthenticated: Just return items, maybe random or popular
            return res.json(menuItems.slice(0, 10));
        }

        // 2. Fetch User Context
        const [recentActivity, recentOrders] = await Promise.all([
            UserActivity.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50),
            Order.find({ user: req.user._id }).populate('restaurant').sort({ createdAt: -1 }).limit(20)
        ]);

        const preferredCuisines = new Set(recentOrders.map(o => o.restaurant?.cuisine).filter(Boolean));
        const engagedRestaurants = new Set(recentActivity.map(a => a.metadata?.restaurantId || (a.reelId?.restaurant?.toString())).filter(Boolean));

        // 3. Determine Time of Day
        const hour = new Date().getHours();
        let currentCategory = 'Lunch';
        if (hour >= 6 && hour < 11) currentCategory = 'Breakfast';
        else if (hour >= 11 && hour < 16) currentCategory = 'Lunch';
        else if (hour >= 16 && hour < 22) currentCategory = 'Dinner';
        else if (hour >= 22 || hour < 6) currentCategory = 'Snacks';

        // 4. Scoring Algorithm
        const scoredItems = menuItems.map(item => {
            let score = 0;

            // Factor 1: Order History (Favorite Cuisines)
            if (item.restaurant && preferredCuisines.has(item.restaurant.cuisine)) {
                score += 10;
            }

            // Factor 2: Reel Interactions (Interested Restaurants)
            if (engagedRestaurants.has(item.restaurant?._id.toString())) {
                score += 8;
            }

            // Factor 3: Time of Day
            if (item.category === currentCategory) {
                score += 7;
            }

            // Factor 4: Location proximity
            if (!isNaN(userLat) && !isNaN(userLng) && item.restaurant?.location) {
                const distLat = item.restaurant.location.lat - userLat;
                const distLng = item.restaurant.location.lng - userLng;
                const distanceSq = (distLat * distLat) + (distLng * distLng);
                const proximityBoost = 10 / (distanceSq * 1000 + 1);
                score += proximityBoost;
            }

            return { ...item.toJSON(), score };
        });

        // Sort by score and take top 10
        const recommendations = scoredItems
            .sort((a, b) => b.score - a.score)
            .slice(0, 15);

        res.json(recommendations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getRecommendations };
