const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const helmet = require('helmet');

const authRoutes     = require('./routes/authRoutes');
const userRoutes     = require('./routes/userRoutes');
const addressRoutes  = require('./routes/addressRoutes');
const orderRoutes    = require('./routes/orderRoutes');
const menuRoutes     = require('./routes/menuRoutes');
const cartRoutes     = require('./routes/cartRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');

const errorHandler = require('./middleware/errorMiddleware');
const { sanitizeInput, requestLogger } = require('./middleware/authMiddleware');

const app = express();

//  Security 
// Uncomment helmet in production for security headers
// app.use(helmet());

//  Core Middleware  
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeInput);   // NoSQL injection guard
app.use(requestLogger);   // Request timing logger

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//  Static uploads folder  
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//  API Routes 
app.use('/api/auth',     authRoutes);
app.use('/api/user',     userRoutes);
app.use('/api/address',  addressRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/menu',     menuRoutes);
app.use('/api/cart',     cartRoutes);
app.use('/api/checkout', checkoutRoutes);

// ─── Health check 
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🍔 HungryHub API is running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});
 
//  404 
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global error handler  
app.use(errorHandler);

module.exports = app;
