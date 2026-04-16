const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getMenuItems,
  getMenuItemById,
  getCategories,
  getFeaturedItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
  getAllMenuItemsAdmin,
} = require('../controllers/menuController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `menu-${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// ─── Public routes ───────────────────────────────────────────────────────────
router.get('/', getMenuItems);
router.get('/categories', getCategories);
router.get('/featured', getFeaturedItems);
router.get('/:id', getMenuItemById);

// ─── Admin routes ─────────────────────────────────────────────────────────────
router.get('/admin/all', protect, adminOnly, getAllMenuItemsAdmin);
router.post('/', protect, adminOnly, upload.single('image'), createMenuItem);
router.put('/:id', protect, adminOnly, upload.single('image'), updateMenuItem);
router.delete('/:id', protect, adminOnly, deleteMenuItem);
router.patch('/:id/toggle', protect, adminOnly, toggleAvailability);

module.exports = router;
