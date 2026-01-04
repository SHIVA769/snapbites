const User = require('../models/User');
const Reel = require('../models/Reel');
const Order = require('../models/Order');
const UserActivity = require('../models/UserActivity');
const Follow = require('../models/Follow');

// @desc    Get user public profile with stats
// @route   GET /api/users/:id/profile
// @access  Public
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Aggregate stats from their reels
        const reels = await Reel.find({ creator: req.params.id }).sort({ likesCount: -1 });

        const totalViews = reels.reduce((acc, reel) => acc + (reel.views || 0), 0);
        const totalLikes = reels.reduce((acc, reel) => acc + (reel.likesCount || 0), 0);

        // Get Follow counts
        const followersCount = await Follow.countDocuments({ following: req.params.id });
        const followingCount = await Follow.countDocuments({ follower: req.params.id });

        // Check if current user follows
        let isFollowing = false;
        if (req.user) {
            isFollowing = await Follow.exists({ follower: req.user._id, following: req.params.id });
        }

        // Simulating "Orders Generated" based on 10% of likes
        const ordersGenerated = Math.floor(totalLikes * 0.1);

        const topReels = reels.slice(0, 3);

        res.json({
            user,
            stats: {
                totalViews,
                totalLikes,
                ordersGenerated,
                reelsCount: reels.length,
                followersCount,
                followingCount
            },
            isFollowing,
            topReels
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCommissionStats = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find all orders where any item has a commission for this creator
        // We need to unwind items to filter and aggregate
        const stats = await Order.aggregate([
            { $unwind: '$items' },
            { $match: { 'items.commission.creator': userId } },
            {
                $group: {
                    _id: { $month: '$createdAt' }, // Group by Month
                    totalCommission: { $sum: '$items.commission.amount' },
                    salesCount: { $sum: 1 },
                    totalSalesValue: { $sum: '$items.price' }
                }
            },
            { $sort: { '_id': -1 } }
        ]);

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserActivities = async (req, res) => {
    try {
        const activities = await UserActivity.find({ userId: req.user._id })
            .populate({
                path: 'reelId',
                select: 'videoUrl caption creator',
                populate: { path: 'creator', select: 'name avatar' }
            })
            .populate('orderId', 'totalAmount status')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle Follow/Unfollow a user
// @route   POST /api/users/:id/follow
// @access  Private
const toggleFollow = async (req, res) => {
    try {
        if (req.user._id.toString() === req.params.id) {
            return res.status(400).json({ message: 'You cannot follow yourself' });
        }

        const existingFollow = await Follow.findOne({
            follower: req.user._id,
            following: req.params.id
        });

        if (existingFollow) {
            await existingFollow.deleteOne();
            res.json({ following: false, message: 'Unfollowed successfully' });
        } else {
            await Follow.create({
                follower: req.user._id,
                following: req.params.id
            });
            res.json({ following: true, message: 'Followed successfully' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getUserProfile, getCommissionStats, getUserActivities, toggleFollow };
