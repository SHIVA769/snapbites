const mongoose = require('mongoose');

const savedReelSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reel: { type: mongoose.Schema.Types.ObjectId, ref: 'Reel', required: true },
    createdAt: { type: Date, default: Date.now }
});

// Compound index to ensure a user can only save a reel once
savedReelSchema.index({ user: 1, reel: 1 }, { unique: true });

module.exports = mongoose.model('SavedReel', savedReelSchema);
