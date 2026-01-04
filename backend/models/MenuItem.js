const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    name: { type: String, required: true },
    category: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snacks'], default: 'Lunch' },
    description: { type: String },
    price: { type: Number, required: true },
    image: { type: String },
    isAvailable: { type: Boolean, default: true },
    isHighlighted: { type: Boolean, default: false },
    activePromotion: { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
