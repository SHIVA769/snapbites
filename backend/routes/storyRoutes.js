const express = require('express');
const router = express.Router();
const { createStory, getActiveStories } = require('../controllers/storyController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.route('/')
    .get(getActiveStories)
    .post(protect, upload.single('media'), createStory);

module.exports = router;
