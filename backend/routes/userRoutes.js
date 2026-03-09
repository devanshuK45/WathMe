const express = require('express');
const router = express.Router();
const {
    updateFavorites,
    addToHistory,
    clearHistory,
    getUsers,
    deleteUser,
    toggleBanUser
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, admin, getUsers);

router.route('/:id')
    .delete(protect, admin, deleteUser);

router.route('/:id/ban')
    .put(protect, admin, toggleBanUser);

router.route('/favorites')
    .put(protect, updateFavorites);

router.route('/history')
    .post(protect, addToHistory)
    .delete(protect, clearHistory);

module.exports = router;
