const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    cuisine: { type: String }, // e.g., 'Pizza', 'Indian', 'Burgers'
    description: { type: String },
    address: { type: String, required: true },
    location: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 }
    },
    image: { type: String }, // URL or path
    isApproved: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
