const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }
  next();
};

const validatePlaceOrder = [
  body('items').isArray({ min: 1 }).withMessage('Order must have at least one item'),
  body('items.*.name').notEmpty().withMessage('Item name is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Item quantity must be at least 1'),
  body('items.*.price').isFloat({ min: 0 }).withMessage('Item price must be valid'),
  body('deliveryAddress.fullName').notEmpty().withMessage('Delivery name is required'),
  body('deliveryAddress.phone').notEmpty().withMessage('Delivery phone is required'),
  body('deliveryAddress.addressLine1').notEmpty().withMessage('Address is required'),
  body('deliveryAddress.city').notEmpty().withMessage('City is required'),
  body('deliveryAddress.pincode').notEmpty().withMessage('Pincode is required'),
  body('paymentMethod').isIn(['COD', 'Online']).withMessage('Invalid payment method'),
  handleValidationErrors,
];

module.exports = { validatePlaceOrder };
