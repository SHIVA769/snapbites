const express = require('express');
const router = express.Router();
const { createReel, getReels, toggleSaveReel, getSavedReels, toggleLike, getCreatorAnalytics } = require('../controllers/reelController');
const { addComment, getCommentsByReel } = require('../controllers/commentController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.route('/')
    .post(protect, authorize('creator', 'owner', 'admin'), upload.single('video'), createReel)
    .get(getReels);

router.route('/analytics')
    .get(protect, authorize('creator', 'owner', 'admin'), getCreatorAnalytics);

router.route('/saved')
    .get(protect, getSavedReels);

router.route('/:reelId/save')
    .post(protect, toggleSaveReel);

router.route('/:reelId/like')
    .post(protect, toggleLike);

router.route('/:reelId/comments')
    .post(protect, addComment)
    .get(getCommentsByReel);

module.exports = router;
