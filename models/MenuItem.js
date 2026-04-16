const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Starters',
        'Main Course',
        'Burgers',
        'Pizza',
        'Biryani',
        'Chinese',
        'South Indian',
        'Desserts',
        'Beverages',
        'Snacks',
        'Salads',
        'Soups',
        'Combos',
        'Breads',
        'Other',
      ],
    },
    image: {
      type: String,
      default: '',
    },
    isVeg: {
      type: Boolean,
      default: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    preparationTime: {
      type: Number, // in minutes
      default: 20,
    },
    tags: [String], // e.g. ["spicy", "gluten-free"]
    addOns: [
      {
        name: { type: String },
        price: { type: Number },
      },
    ],
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

// Virtual: final discounted price
menuItemSchema.virtual('finalPrice').get(function () {
  if (this.discountPercent > 0) {
    return +(this.price - (this.price * this.discountPercent) / 100).toFixed(2);
  }
  return this.price;
});

menuItemSchema.set('toJSON', { virtuals: true });
menuItemSchema.set('toObject', { virtuals: true });

// Text index for search
menuItemSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('MenuItem', menuItemSchema);
