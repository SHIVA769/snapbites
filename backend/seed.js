const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Restaurant = require('./models/Restaurant');
const MenuItem = require('./models/MenuItem');

dotenv.config();

const seedByt = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Clear existing
        await User.deleteMany({});
        await Restaurant.deleteMany({});
        await MenuItem.deleteMany({});

        // Create Owner
        const owner = await User.create({
            name: 'John Owner',
            email: 'owner@example.com',
            password: 'password123',
            role: 'owner'
        });

        // Create Creator
        const creator = await User.create({
            name: 'Jane Creator',
            email: 'creator@example.com',
            password: 'password123',
            role: 'creator'
        });

        // Create Customer
        const customer = await User.create({
            name: 'Bob Customer',
            email: 'customer@example.com',
            password: 'password123',
            role: 'user'
        });

        // Create Restaurant
        const restaurant = await Restaurant.create({
            owner: owner._id,
            name: 'Pizza Palace',
            description: 'Best pizza in town',
            address: '123 Food St',
            isApproved: true
        });

        // Create Menu Items
        await MenuItem.create([
            {
                restaurant: restaurant._id,
                name: 'Margherita Pizza',
                description: 'Classic cheese and tomato',
                price: 12
            },
            {
                restaurant: restaurant._id,
                name: 'Pepperoni Pizza',
                description: 'Spicy pepperoni',
                price: 15
            }
        ]);

        console.log('Data Imported!');
        console.log({
            owner: 'owner@example.com',
            creator: 'creator@example.com',
            customer: 'customer@example.com',
            password: 'password123'
        });

        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

seedByt();
