const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
    },
    name: { type: String, required: true },
    image: { type: String, default: '' },
    price: { type: Number, required: true },     // snapshot at time of add
    quantity: { type: Number, required: true, min: 1, default: 1 },
    addOns: [
      {
        name: String,
        price: Number,
      },
    ],
    specialInstructions: { type: String, default: '' },
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
    couponCode: { type: String, default: '' },
    couponDiscount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Virtual: subtotal
cartSchema.virtual('subtotal').get(function () {
  return +this.items
    .reduce((sum, item) => {
      const addOnTotal = item.addOns.reduce((a, ao) => a + ao.price, 0);
      return sum + (item.price + addOnTotal) * item.quantity;
    }, 0)
    .toFixed(2);
});

cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Cart', cartSchema);
