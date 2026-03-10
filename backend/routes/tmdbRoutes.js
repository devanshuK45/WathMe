const express = require('express');
const router = express.Router();
const { getTmdbData } = require('../controllers/tmdbController');

// Proxy all GET requests starting with /api/tmdb/* to TMDB
router.get('/*splat', getTmdbData);

module.exports = router;
