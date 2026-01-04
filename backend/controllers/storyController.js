const Story = require('../models/Story');

// @desc    Create a new story
// @route   POST /api/stories
// @access  Private
const createStory = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Media file is required' });
        }

        const mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';

        const story = await Story.create({
            user: req.user._id,
            mediaUrl: `/uploads/${req.file.filename}`,
            mediaType,
            caption: req.body.caption || ''
        });

        res.status(201).json(story);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all active stories grouped by user
// @route   GET /api/stories
// @access  Public
const getActiveStories = async (req, res) => {
    try {
        // Find all stories from the last 24 hours
        // (MongoDB TTL index handles deletion, but we can double check)
        const stories = await Story.find()
            .populate('user', 'name avatar')
            .sort({ createdAt: -1 });

        // Group stories by user for the Instagram-like UI
        const groupedStories = stories.reduce((acc, story) => {
            const userId = story.user._id.toString();
            if (!acc[userId]) {
                acc[userId] = {
                    user: story.user,
                    stories: []
                };
            }
            acc[userId].stories.push(story);
            return acc;
        }, {});

        res.json(Object.values(groupedStories));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createStory,
    getActiveStories
};
