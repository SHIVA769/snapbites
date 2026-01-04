const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    items: [{
        menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
        name: { type: String }, // Snapshot
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        reel: { type: mongoose.Schema.Types.ObjectId, ref: 'Reel' },
        commission: {
            creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            amount: { type: Number, default: 0 }
        }
    }],
    totalAmount: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
