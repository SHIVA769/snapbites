const Comment = require('../models/Comment');
const Reel = require('../models/Reel');
const { trackActivity } = require('../utils/activity.service');

const addComment = async (req, res) => {
    try {
        const { reelId } = req.params;
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ message: 'Comment text is required' });
        }

        const reel = await Reel.findById(reelId);
        if (!reel) {
            return res.status(404).json({ message: 'Reel not found' });
        }

        const comment = await Comment.create({
            user: req.user._id,
            reel: reelId,
            text
        });

        // Populate user details for immediate display
        await comment.populate('user', 'name avatar');

        // Track "comment" activity
        trackActivity({
            userId: req.user._id,
            action: 'comment',
            reelId
        });

        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCommentsByReel = async (req, res) => {
    try {
        const { reelId } = req.params;
        const comments = await Comment.find({ reel: reelId })
            .populate('user', 'name avatar')
            .sort({ createdAt: -1 });

        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addComment, getCommentsByReel };
