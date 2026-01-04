const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const reelRoutes = require('./routes/reelRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const promotionRoutes = require('./routes/promotionRoutes');
const menuItemRoutes = require('./routes/menuItemRoutes');
const storyRoutes = require('./routes/storyRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const aiRoutes = require('./routes/aiRoutes');

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reels', reelRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/menu-items', menuItemRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/ai', aiRoutes);

app.get('/', (req, res) => res.send('API is running...'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
