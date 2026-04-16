const MenuItem = require('../models/MenuItem');

// ─── PUBLIC ──────────────────────────────────────────────────────────────────

// @desc    Get all menu items (with filters, search, pagination)
// @route   GET /api/menu
// @access  Public
const getMenuItems = async (req, res, next) => {
  try {
    const {
      category,
      isVeg,
      isFeatured,
      isBestSeller,
      search,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 20,
    } = req.query;

    const filter = { isAvailable: true };

    if (category) filter.category = category;
    if (isVeg !== undefined) filter.isVeg = isVeg === 'true';
    if (isFeatured === 'true') filter.isFeatured = true;
    if (isBestSeller === 'true') filter.isBestSeller = true;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      MenuItem.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(Number(limit)),
      MenuItem.countDocuments(filter),
    ]);

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      items,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single menu item
// @route   GET /api/menu/:id
// @access  Public
const getMenuItemById = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, item });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all categories
// @route   GET /api/menu/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await MenuItem.distinct('category', { isAvailable: true });
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured items
// @route   GET /api/menu/featured
// @access  Public
const getFeaturedItems = async (req, res, next) => {
  try {
    const items = await MenuItem.find({ isFeatured: true, isAvailable: true }).limit(10);
    res.json({ success: true, items });
  } catch (error) {
    next(error);
  }
};

// ─── ADMIN ───────────────────────────────────────────────────────────────────

// @desc    Create menu item
// @route   POST /api/menu
// @access  Admin
const createMenuItem = async (req, res, next) => {
  try {
    const data = req.body;
    if (req.file) data.image = req.file.path;

    const item = await MenuItem.create(data);
    res.status(201).json({ success: true, message: 'Menu item created', item });
  } catch (error) {
    next(error);
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Admin
const updateMenuItem = async (req, res, next) => {
  try {
    const data = req.body;
    if (req.file) data.image = req.file.path;

    const item = await MenuItem.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    res.json({ success: true, message: 'Menu item updated', item });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Admin
const deleteMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Menu item deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle availability
// @route   PATCH /api/menu/:id/toggle
// @access  Admin
const toggleAvailability = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    item.isAvailable = !item.isAvailable;
    await item.save();

    res.json({
      success: true,
      message: `Item marked as ${item.isAvailable ? 'available' : 'unavailable'}`,
      isAvailable: item.isAvailable,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all items (admin — includes unavailable)
// @route   GET /api/menu/admin/all
// @access  Admin
const getAllMenuItemsAdmin = async (req, res, next) => {
  try {
    const items = await MenuItem.find().sort({ createdAt: -1 });
    res.json({ success: true, total: items.length, items });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMenuItems,
  getMenuItemById,
  getCategories,
  getFeaturedItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
  getAllMenuItemsAdmin,
};
