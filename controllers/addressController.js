const Address = require('../models/Address');

// @desc    Get all addresses of logged-in user
// @route   GET /api/address
// @access  Private
const getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1 });
    res.json({ success: true, addresses });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new address
// @route   POST /api/address
// @access  Private
const addAddress = async (req, res, next) => {
  try {
    const { label, fullName, phone, addressLine1, addressLine2, city, state, pincode, isDefault } = req.body;

    // If this is default, unset others
    if (isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const address = await Address.create({
      user: req.user._id,
      label, fullName, phone, addressLine1, addressLine2, city, state, pincode, isDefault,
    });

    res.status(201).json({ success: true, message: 'Address added successfully', address });
  } catch (error) {
    next(error);
  }
};

// @desc    Update address
// @route   PUT /api/address/:id
// @access  Private
const updateAddress = async (req, res, next) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!address) return res.status(404).json({ success: false, message: 'Address not found' });

    if (req.body.isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const updated = await Address.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, message: 'Address updated', address: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete address
// @route   DELETE /api/address/:id
// @access  Private
const deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!address) return res.status(404).json({ success: false, message: 'Address not found' });
    res.json({ success: true, message: 'Address deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Set address as default
// @route   PUT /api/address/:id/default
// @access  Private
const setDefaultAddress = async (req, res, next) => {
  try {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isDefault: true },
      { new: true }
    );
    if (!address) return res.status(404).json({ success: false, message: 'Address not found' });
    res.json({ success: true, message: 'Default address updated', address });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress };
