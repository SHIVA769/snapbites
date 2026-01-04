const Reel = require('../models/Reel');
const SavedReel = require('../models/SavedReel');
const Like = require('../models/Like');
const { trackActivity, bulkTrackView } = require('../utils/activity.service');
const UserActivity = require('../models/UserActivity');
const Order = require('../models/Order');
const Follow = require('../models/Follow');

const createReel = async (req, res) => {
    try {
        const { caption, restaurantId, menuItemId } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'Video file is required' });
        }

        const reel = await Reel.create({
            creator: req.user._id,
            videoUrl: `/uploads/${req.file.filename}`,
            caption,
            restaurant: restaurantId || null,
            menuItem: menuItemId || null
        });

        res.status(201).json(reel);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getReels = async (req, res) => {
    try {
        const { filter, restaurant, menuItem, search } = req.query;
        let query = {};
        let sortOption = { createdAt: -1 };

        if (restaurant) {
            query.restaurant = restaurant;
        }

        if (menuItem) {
            query.menuItem = menuItem;
        }

        if (search) {
            query.$or = [
                { caption: { $regex: search, $options: 'i' } },
                { 'restaurant.name': { $regex: search, $options: 'i' } } // Note: Need population if we search by name, or use separate logic
            ];
        }

        if (filter === 'trending') {
            sortOption = { likesCount: -1, commentsCount: -1 };
        }

        if (filter === 'following' && req.user) {
            const followingUsers = await Follow.find({ follower: req.user._id }).distinct('following');
            query.creator = { $in: followingUsers };
        }

        let reels = await Reel.find(query)
            .populate('creator', 'name avatar')
            .populate('restaurant', 'name location')
            .populate('menuItem', 'name price')
            .sort(sortOption);

        if (filter === 'smart') {
            const userLat = parseFloat(req.query.lat);
            const userLng = parseFloat(req.query.lng);
            let preferredCreators = new Map(); // creatorId -> weight
            let preferredCuisines = new Map(); // cuisine name -> weight

            if (req.user) {
                // Analyze last 50 activities for creator affinity
                const history = await UserActivity.find({ userId: req.user._id })
                    .populate({ path: 'reelId', select: 'creator' })
                    .sort({ createdAt: -1 })
                    .limit(50);

                history.forEach(act => {
                    if (act.reelId && act.reelId.creator) {
                        const creatorId = act.reelId.creator.toString();
                        const weight = act.action === 'like' ? 3 : (act.action === 'view' ? 1 : 0);
                        preferredCreators.set(creatorId, (preferredCreators.get(creatorId) || 0) + weight);
                    }
                });

                // Analyze last 20 orders for cuisine preferences
                const orders = await Order.find({ user: req.user._id })
                    .populate('restaurant', 'cuisine')
                    .sort({ createdAt: -1 })
                    .limit(20);

                orders.forEach(order => {
                    if (order.restaurant && order.restaurant.cuisine) {
                        const cuisine = order.restaurant.cuisine;
                        preferredCuisines.set(cuisine, (preferredCuisines.get(cuisine) || 0) + 5);
                    }
                });
            }

            reels = reels.map(reel => {
                const reelJSON = reel.toJSON();
                let locationBoost = 0;
                let personalizationBoost = 0;

                if (!isNaN(userLat) && !isNaN(userLng) && reel.restaurant && reel.restaurant.location) {
                    const distLat = reel.restaurant.location.lat - userLat;
                    const distLng = reel.restaurant.location.lng - userLng;
                    const distanceSq = (distLat * distLat) + (distLng * distLng);
                    locationBoost = 10 / (distanceSq * 1000 + 1);
                }

                if (req.user) {
                    // Creator Affinity boost (max +5)
                    const creatorId = reel.creator._id.toString();
                    if (preferredCreators.has(creatorId)) {
                        personalizationBoost += Math.min(5, preferredCreators.get(creatorId));
                    }

                    // Cuisine Preference boost (max +4)
                    if (reel.restaurant && reel.restaurant.cuisine && preferredCuisines.has(reel.restaurant.cuisine)) {
                        personalizationBoost += 4;
                    }
                }

                const score = (reel.likesCount * 2) +
                    (reel.commentsCount * 3) +
                    (reel.ordersCount * 5) +
                    locationBoost +
                    personalizationBoost;

                return { ...reelJSON, score };
            }).sort((a, b) => b.score - a.score);
        }

        // Track views for all reels fetched if user is authenticated
        if (req.user) {
            const reelIds = reels.map(reel => reel._id);
            bulkTrackView(reelIds, req.user._id);
        }

        res.json(reels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const toggleSaveReel = async (req, res) => {
    try {
        const { reelId } = req.params;
        const userId = req.user._id;

        const existingSave = await SavedReel.findOne({ user: userId, reel: reelId });

        if (existingSave) {
            await SavedReel.findOneAndDelete({ user: userId, reel: reelId });
            return res.json({ message: 'Reel unsaved', saved: false });
        } else {
            await SavedReel.create({ user: userId, reel: reelId });
            return res.json({ message: 'Reel saved', saved: true });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSavedReels = async (req, res) => {
    try {
        const saved = await SavedReel.find({ user: req.user._id })
            .populate({
                path: 'reel',
                populate: [
                    { path: 'creator', select: 'name avatar' },
                    { path: 'restaurant', select: 'name' },
                    { path: 'menuItem', select: 'name price' }
                ]
            })
            .sort({ createdAt: -1 });

        // Extract just the reel objects for consistent frontend consumption
        const reels = saved.map(item => item.reel).filter(reel => reel !== null); // filter null in case reel was deleted
        res.json(reels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const toggleLike = async (req, res) => {
    try {
        const { reelId } = req.params;
        const userId = req.user._id;

        const reel = await Reel.findById(reelId);
        if (!reel) {
            return res.status(404).json({ message: 'Reel not found' });
        }

        const existingLike = await Like.findOne({ user: userId, reel: reelId });

        if (existingLike) {
            await Like.findOneAndDelete({ user: userId, reel: reelId });
            reel.likesCount = Math.max(0, reel.likesCount - 1);
            await reel.save();

            return res.json({ message: 'Reel unliked', liked: false, likesCount: reel.likesCount });
        } else {
            await Like.create({ user: userId, reel: reelId });
            reel.likesCount += 1;
            await reel.save();

            // Track "like" activity
            trackActivity({
                userId,
                action: 'like',
                reelId
            });

            return res.json({ message: 'Reel liked', liked: true, likesCount: reel.likesCount });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCreatorAnalytics = async (req, res) => {
    try {
        const reels = await Reel.find({ creator: req.user._id });

        const stats = reels.reduce((acc, reel) => {
            acc.totalViews += (reel.views || 0);
            acc.totalLikes += (reel.likesCount || 0);
            acc.totalComments += (reel.commentsCount || 0);
            acc.totalOrders += (reel.ordersCount || 0);
            return acc;
        }, { totalViews: 0, totalLikes: 0, totalComments: 0, totalOrders: 0 });

        const conversionRate = stats.totalViews > 0
            ? ((stats.totalOrders / stats.totalViews) * 100).toFixed(2)
            : 0;

        res.json({
            ...stats,
            conversionRate,
            reelCount: reels.length,
            reels: reels.map(r => ({
                id: r._id,
                caption: r.caption,
                views: r.views || 0,
                likes: r.likesCount || 0,
                orders: r.ordersCount || 0
            }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createReel,
    getReels,
    toggleSaveReel,
    getSavedReels,
    toggleLike,
    getCreatorAnalytics
};
