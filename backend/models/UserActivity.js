const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reel',
        required: false
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: false
    },
    action: {
        type: String,
        enum: ['view', 'like', 'comment', 'order'],
        required: true
    },
    metadata: {
        type: Object,
        default: {}
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes for performance
userActivitySchema.index({ userId: 1, createdAt: -1 });
userActivitySchema.index({ reelId: 1, action: 1 });

module.exports = mongoose.model('UserActivity', userActivitySchema);
