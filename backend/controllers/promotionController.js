const Promotion = require('../models/Promotion');
const Reel = require('../models/Reel');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

// @desc    Create a new promotion request
// @route   POST /api/promotions
// @access  Private (owner, admin)
const createPromotion = async (req, res) => {
    try {
        const { restaurantId, type, targetReelId, targetMenuItemId, endDate } = req.body;

        // Verify restaurant exists and user owns it (unless admin)
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        if (req.user.role !== 'admin' && restaurant.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to create promotions for this restaurant' });
        }

        // Verify target exists based on type
        if (type === 'boost_reel') {
            const reel = await Reel.findById(targetReelId);
            if (!reel) {
                return res.status(404).json({ message: 'Reel not found' });
            }
            if (reel.restaurant && reel.restaurant.toString() !== restaurantId.toString()) {
                console.log(`Validation failed: Reel restaurant (${reel.restaurant}) !== Body restaurantId (${restaurantId})`);
                return res.status(400).json({ message: 'Reel does not belong to this restaurant' });
            }
        } else if (type === 'highlight_menu_item') {
            const menuItem = await MenuItem.findById(targetMenuItemId);
            if (!menuItem) {
                return res.status(404).json({ message: 'Menu item not found' });
            }
            if (menuItem.restaurant.toString() !== restaurantId) {
                return res.status(400).json({ message: 'Menu item does not belong to this restaurant' });
            }
        }

        const promotion = await Promotion.create({
            restaurant: restaurantId,
            type,
            targetReel: type === 'boost_reel' ? targetReelId : undefined,
            targetMenuItem: type === 'highlight_menu_item' ? targetMenuItemId : undefined,
            requestedBy: req.user._id,
            endDate: endDate || undefined
        });

        res.status(201).json(promotion);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get promotions (filtered by role)
// @route   GET /api/promotions
// @access  Private
const getPromotions = async (req, res) => {
    try {
        let query = {};

        // If not admin, only show promotions for user's restaurants
        if (req.user.role !== 'admin') {
            const restaurants = await Restaurant.find({ owner: req.user._id });
            const restaurantIds = restaurants.map(r => r._id);
            query.restaurant = { $in: restaurantIds };
        }

        // Filter by status if provided
        if (req.query.status) {
            query.status = req.query.status;
        }

        const promotions = await Promotion.find(query)
            .populate('restaurant', 'name')
            .populate('targetReel', 'caption videoUrl')
            .populate('targetMenuItem', 'name price')
            .populate('requestedBy', 'name email')
            .populate('approvedBy', 'name')
            .populate('rejectedBy', 'name')
            .sort({ createdAt: -1 });

        res.json(promotions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single promotion by ID
// @route   GET /api/promotions/:id
// @access  Private
const getPromotionById = async (req, res) => {
    try {
        const promotion = await Promotion.findById(req.params.id)
            .populate('restaurant', 'name address')
            .populate('targetReel', 'caption videoUrl')
            .populate('targetMenuItem', 'name price image')
            .populate('requestedBy', 'name email')
            .populate('approvedBy', 'name')
            .populate('rejectedBy', 'name');

        if (!promotion) {
            return res.status(404).json({ message: 'Promotion not found' });
        }

        // Check authorization
        if (req.user.role !== 'admin') {
            const restaurant = await Restaurant.findById(promotion.restaurant._id);
            if (restaurant.owner.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to view this promotion' });
            }
        }

        res.json(promotion);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve a promotion
// @route   PATCH /api/promotions/:id/approve
// @access  Private (admin only)
const approvePromotion = async (req, res) => {
    try {
        const promotion = await Promotion.findById(req.params.id);

        if (!promotion) {
            return res.status(404).json({ message: 'Promotion not found' });
        }

        if (promotion.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending promotions can be approved' });
        }

        // Update promotion status
        promotion.status = 'active';
        promotion.approvedBy = req.user._id;
        promotion.startDate = new Date();
        await promotion.save();

        // Update target (reel or menu item)
        if (promotion.type === 'boost_reel') {
            await Reel.findByIdAndUpdate(promotion.targetReel, {
                isBoosted: true,
                activePromotion: promotion._id
            });
        } else if (promotion.type === 'highlight_menu_item') {
            await MenuItem.findByIdAndUpdate(promotion.targetMenuItem, {
                isHighlighted: true,
                activePromotion: promotion._id
            });
        }

        res.json(promotion);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reject a promotion
// @route   PATCH /api/promotions/:id/reject
// @access  Private (admin only)
const rejectPromotion = async (req, res) => {
    try {
        const { reason } = req.body;
        const promotion = await Promotion.findById(req.params.id);

        if (!promotion) {
            return res.status(404).json({ message: 'Promotion not found' });
        }

        if (promotion.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending promotions can be rejected' });
        }

        promotion.status = 'rejected';
        promotion.rejectedBy = req.user._id;
        promotion.rejectionReason = reason || 'No reason provided';
        await promotion.save();

        res.json(promotion);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cancel a promotion
// @route   DELETE /api/promotions/:id
// @access  Private (owner, admin)
const cancelPromotion = async (req, res) => {
    try {
        const promotion = await Promotion.findById(req.params.id);

        if (!promotion) {
            return res.status(404).json({ message: 'Promotion not found' });
        }

        // Check authorization
        if (req.user.role !== 'admin') {
            const restaurant = await Restaurant.findById(promotion.restaurant);
            if (restaurant.owner.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to cancel this promotion' });
            }
        }

        // Only pending or active promotions can be cancelled
        if (!['pending', 'active'].includes(promotion.status)) {
            return res.status(400).json({ message: 'Only pending or active promotions can be cancelled' });
        }

        // If active, remove boost/highlight from target
        if (promotion.status === 'active') {
            if (promotion.type === 'boost_reel') {
                await Reel.findByIdAndUpdate(promotion.targetReel, {
                    isBoosted: false,
                    activePromotion: null
                });
            } else if (promotion.type === 'highlight_menu_item') {
                await MenuItem.findByIdAndUpdate(promotion.targetMenuItem, {
                    isHighlighted: false,
                    activePromotion: null
                });
            }
        }

        await Promotion.findByIdAndDelete(req.params.id);

        res.json({ message: 'Promotion cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all active promotions
// @route   GET /api/promotions/active
// @access  Public
const getActivePromotions = async (req, res) => {
    try {
        const promotions = await Promotion.find({ status: 'active' })
            .populate('restaurant', 'name')
            .populate('targetReel', 'caption videoUrl')
            .populate('targetMenuItem', 'name price image');

        res.json(promotions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createPromotion,
    getPromotions,
    getPromotionById,
    approvePromotion,
    rejectPromotion,
    cancelPromotion,
    getActivePromotions
};
