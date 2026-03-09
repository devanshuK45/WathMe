const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    poster_url: {
        type: String,
    },
    description: {
        type: String,
    },
    tmdb_id: {
        type: Number,
    },
    release_date: {
        type: String,
    },
    trailer_url: {
        type: String,
    },
    genre: {
        type: String,
    },
    category: {
        type: String, // e.g., 'Movies', 'TV Shows'
    }
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);
