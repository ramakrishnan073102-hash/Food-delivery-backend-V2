const express = require('express');
const router = express.Router();
const { getCheckoutSummary, placeOrderFromCart } = require('../controllers/checkoutController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // all checkout routes private

router.get('/summary', getCheckoutSummary);
router.post('/place-order', placeOrderFromCart);

module.exports = router;
