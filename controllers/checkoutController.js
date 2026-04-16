const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');
const Address = require('../models/Address');
const MenuItem = require('../models/MenuItem');

// @desc    Get checkout summary (price breakdown from cart)
// @route   GET /api/checkout/summary
// @access  Private
const getCheckoutSummary = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      'items.menuItem',
      'name price finalPrice isAvailable'
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    // Check all items are still available
    const unavailable = cart.items.filter(
      (item) => item.menuItem && !item.menuItem.isAvailable
    );
    if (unavailable.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Some items are no longer available: ${unavailable.map((i) => i.name).join(', ')}`,
      });
    }

    const subtotal = cart.subtotal;
    const deliveryCharge = subtotal > 299 ? 0 : 40;
    const gst = +(subtotal * 0.05).toFixed(2); // 5% GST
    const couponDiscount = cart.couponDiscount || 0;
    const totalAmount = +(subtotal + deliveryCharge + gst - couponDiscount).toFixed(2);

    res.json({
      success: true,
      summary: {
        items: cart.items,
        itemCount: cart.items.reduce((sum, i) => sum + i.quantity, 0),
        subtotal,
        deliveryCharge,
        gst,
        couponCode: cart.couponCode || null,
        couponDiscount,
        totalAmount,
        freeDeliveryAbove: 299,
        amountForFreeDelivery: subtotal < 299 ? +(299 - subtotal).toFixed(2) : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Place order from cart
// @route   POST /api/checkout/place-order
// @access  Private
const placeOrderFromCart = async (req, res, next) => {
  try {
    const { addressId, paymentMethod, notes } = req.body;

    // Validate address
    const address = await Address.findOne({ _id: addressId, user: req.user._id });
    if (!address) return res.status(404).json({ success: false, message: 'Delivery address not found' });

    // Load cart
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.menuItem');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    // Re-validate items and prices
    const orderItems = [];
    for (const cartItem of cart.items) {
      const menuItem = await MenuItem.findById(cartItem.menuItem._id);
      if (!menuItem || !menuItem.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `"${cartItem.name}" is no longer available. Please update your cart.`,
        });
      }
      orderItems.push({
        name: menuItem.name,
        quantity: cartItem.quantity,
        price: menuItem.finalPrice || menuItem.price,
        image: menuItem.image,
      });
    }

    const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const deliveryCharge = subtotal > 299 ? 0 : 40;
    const gst = +(subtotal * 0.05).toFixed(2);
    const couponDiscount = cart.couponDiscount || 0;
    const finalAmount = +(subtotal + deliveryCharge + gst - couponDiscount).toFixed(2);
    const estimatedDelivery = new Date(Date.now() + 45 * 60 * 1000);

    // Create order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      deliveryAddress: {
        fullName: address.fullName,
        phone: address.phone,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
      },
      totalPrice: subtotal,
      deliveryCharge,
      discount: couponDiscount,
      finalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Pending',
      estimatedDelivery,
      notes: notes || '',
    });

    // Increment coupon usage
    if (cart.couponCode) {
      await Coupon.findOneAndUpdate({ code: cart.couponCode }, { $inc: { usedCount: 1 } });
    }

    // Clear cart after order placed
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [], couponCode: '', couponDiscount: 0 }
    );

    res.status(201).json({
      success: true,
      message: '🎉 Order placed successfully!',
      order,
      breakdown: {
        subtotal,
        deliveryCharge,
        gst,
        couponDiscount,
        finalAmount,
        estimatedDelivery,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCheckoutSummary, placeOrderFromCart };
