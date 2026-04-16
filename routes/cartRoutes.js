const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // all cart routes are private

router.get('/', getCart);
router.post('/', addToCart);
router.put('/:itemId', updateCartItem);
router.delete('/coupon', removeCoupon);   // must be before /:itemId
router.delete('/', clearCart);
router.delete('/:itemId', removeFromCart);
router.post('/coupon', applyCoupon);

module.exports = router;
