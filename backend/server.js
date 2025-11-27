require('dotenv').config(); // Load environment variables at the very top

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const restaurantRoutes = require('./routes/restaurants'); // <-- add this
const locationRoutes = require('./routes/location');
const resetPasswordRoutes = require('./routes/resetPassword');
const cartRoutes = require("./routes/Cart");
const orderRoutes = require("./routes/orders");

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN, // e.g., http://localhost:3000
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes); // <-- add this
app.use('/api/location', locationRoutes);
app.use('/api/reset-password', resetPasswordRoutes);
app.use('/api/cart', cartRoutes);
app.use("/api/orders", orderRoutes);

// Start server after DB connection
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('Failed to connect to MongoDB', err));
