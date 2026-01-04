const mongoose = require('mongoose');

const reelSchema = new mongoose.Schema({
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    videoUrl: { type: String, required: true }, // Path to local file
    caption: { type: String },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }, // Optional link
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }, // Optional link
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    ordersCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    isBoosted: { type: Boolean, default: false },
    activePromotion: { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reel', reelSchema);
