const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    items: [{
        menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
        quantity: { type: Number, default: 1 },
        price: { type: Number, required: true }, // Snapshot of price
        reel: { type: mongoose.Schema.Types.ObjectId, ref: 'Reel' } // Optional Attribution
    }],
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Cart', cartSchema);
