/**
 * Seed script: populates the DB with sample menu items and coupons.
 * Run: node utils/seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const MenuItem = require('../models/MenuItem');
const Coupon = require('../models/Coupon');

const menuItems = [
  { name: 'Chicken Biryani', category: 'Biryani', price: 199, originalPrice: 249, isVeg: false, isBestSeller: true, isFeatured: true, rating: 4.8, preparationTime: 30, tags: ['spicy', 'non-veg'], description: 'Fragrant basmati rice cooked with tender chicken pieces.' },
  { name: 'Paneer Butter Masala', category: 'Main Course', price: 169, isVeg: true, isFeatured: true, rating: 4.6, preparationTime: 20, tags: ['creamy', 'veg'], description: 'Soft paneer cubes in rich buttery tomato gravy.' },
  { name: 'Veg Burger', category: 'Burgers', price: 89, isVeg: true, rating: 4.2, preparationTime: 10, tags: ['crispy', 'veg'] },
  { name: 'Chicken Burger', category: 'Burgers', price: 119, isVeg: false, isBestSeller: true, rating: 4.5, preparationTime: 12 },
  { name: 'Margherita Pizza', category: 'Pizza', price: 249, isVeg: true, isFeatured: true, rating: 4.7, preparationTime: 20 },
  { name: 'Masala Dosa', category: 'South Indian', price: 79, isVeg: true, rating: 4.4, preparationTime: 15, tags: ['crispy', 'veg'] },
  { name: 'Veg Fried Rice', category: 'Chinese', price: 139, isVeg: true, rating: 4.1, preparationTime: 15 },
  { name: 'Chicken Fried Rice', category: 'Chinese', price: 159, isVeg: false, rating: 4.3, preparationTime: 15 },
  { name: 'Gulab Jamun', category: 'Desserts', price: 59, isVeg: true, rating: 4.9, preparationTime: 5, tags: ['sweet', 'veg'] },
  { name: 'Cold Coffee', category: 'Beverages', price: 69, isVeg: true, rating: 4.5, preparationTime: 5 },
  { name: 'Samosa (2 pcs)', category: 'Starters', price: 40, isVeg: true, isBestSeller: true, rating: 4.3, preparationTime: 8 },
  { name: 'Paneer Tikka', category: 'Starters', price: 149, isVeg: true, rating: 4.6, preparationTime: 15, tags: ['grilled', 'spicy'] },
];

const coupons = [
  { code: 'WELCOME50', description: '₹50 off on your first order', discountType: 'flat', discountValue: 50, minOrderAmount: 199, usageLimit: 1000 },
  { code: 'SAVE20', description: '20% off up to ₹100', discountType: 'percent', discountValue: 20, maxDiscount: 100, minOrderAmount: 299 },
  { code: 'FREESHIP', description: 'Free delivery on any order', discountType: 'flat', discountValue: 40, minOrderAmount: 0 },
];

const seed = async () => {
  await connectDB();
  console.log('🔄 Seeding database...');

  await MenuItem.deleteMany({});
  await Coupon.deleteMany({});

  await MenuItem.insertMany(menuItems);
  await Coupon.insertMany(coupons);

  console.log(`✅ Seeded ${menuItems.length} menu items`);
  console.log(`✅ Seeded ${coupons.length} coupons`);
  console.log('🎉 Seeding complete!');

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
