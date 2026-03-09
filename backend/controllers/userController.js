const User = require('../models/User');

// @desc    Update user favorites
// @route   PUT /api/users/favorites
// @access  Private
const updateFavorites = async (req, res) => {
    const { tmdbId, movieId, mediaType } = req.body;

    try {
        const user = await User.findById(req.user._id);

        if (user) {
            // Toggle logic for TMDB ID (external API movies)
            if (tmdbId !== undefined && tmdbId !== null) {
                const numericTmdbId = Number(tmdbId);
                const existingIndex = user.favoriteTmdbIds.findIndex(fav => fav.tmdbId === numericTmdbId);

                if (existingIndex > -1) {
                    user.favoriteTmdbIds.splice(existingIndex, 1);
                } else {
                    user.favoriteTmdbIds.push({ tmdbId: numericTmdbId, mediaType: mediaType || 'movie' });
                }
            }

            // Toggle logic for internal Movie ID (custom platform movies)
            if (movieId) {
                const existingIndex = user.favorites.findIndex(id => id.toString() === movieId.toString());
                if (existingIndex > -1) {
                    user.favorites.splice(existingIndex, 1);
                } else {
                    user.favorites.push(movieId);
                }
            }

            const updatedUser = await user.save();
            res.json({
                favorites: updatedUser.favorites,
                favoriteTmdbIds: updatedUser.favoriteTmdbIds
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add to watch history
// @route   POST /api/users/history
// @access  Private
const addToHistory = async (req, res) => {
    const { tmdbId, movieId, mediaType } = req.body;

    try {
        const user = await User.findById(req.user._id);

        if (user) {
            // Remove movie if it exists in history so we can put it at the end (most recent)
            const existingIndex = user.watchHistory.findIndex(entry =>
                (tmdbId && entry.tmdbId === tmdbId) || (movieId && entry.movieId?.toString() === movieId.toString())
            );

            if (existingIndex > -1) {
                user.watchHistory.splice(existingIndex, 1);
            }

            // Add to history
            user.watchHistory.push({
                tmdbId,
                movieId,
                mediaType: mediaType || 'movie',
                watchedAt: Date.now()
            });

            // Keep only last 50 items
            if (user.watchHistory.length > 50) {
                user.watchHistory = user.watchHistory.slice(-50);
            }

            const updatedUser = await user.save();
            res.json(updatedUser.watchHistory);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users (admin)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        console.log('Fetching all users (Admin request)');
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user (admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        console.log(`Attempting to delete user ID: ${req.params.id}`);
        const user = await User.findById(req.params.id);

        if (user) {
            if (user.role === 'admin') {
                console.warn(`Attempted to delete an admin account: ${user.email}`);
                return res.status(403).json({ message: 'Cannot delete an admin account' });
            }
            await user.deleteOne();
            console.log(`User ${user.email} removed successfully`);
            res.json({ message: 'User removed' });
        } else {
            console.log(`User ID ${req.params.id} not found for deletion`);
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(`Error deleting user ${req.params.id}:`, error.message);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle Ban user (admin)
// @route   PUT /api/users/:id/ban
// @access  Private/Admin
const toggleBanUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.isBanned = !user.isBanned;
            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Clear all watch history
// @route   DELETE /api/users/history
// @access  Private
const clearHistory = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.watchHistory = [];
            await user.save();
            res.json([]);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    updateFavorites,
    addToHistory,
    clearHistory,
    getUsers,
    deleteUser,
    toggleBanUser
};
