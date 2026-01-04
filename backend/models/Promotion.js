const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    type: {
        type: String,
        enum: ['boost_reel', 'highlight_menu_item'],
        required: true
    },
    targetReel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reel'
    },
    targetMenuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem'
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'active', 'expired'],
        default: 'pending'
    },
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    rejectionReason: {
        type: String
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
promotionSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Validation: ensure targetReel is provided for boost_reel type
promotionSchema.pre('save', function (next) {
    if (this.type === 'boost_reel' && !this.targetReel) {
        next(new Error('targetReel is required for boost_reel promotion type'));
    } else if (this.type === 'highlight_menu_item' && !this.targetMenuItem) {
        next(new Error('targetMenuItem is required for highlight_menu_item promotion type'));
    } else {
        next();
    }
});

module.exports = mongoose.model('Promotion', promotionSchema);
