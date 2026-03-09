const Movie = require('../models/Movie');

// @desc    Get all admin-added movies
// @route   GET /api/movies
// @access  Public
const getMovies = async (req, res) => {
    try {
        const movies = await Movie.find({}).sort({ createdAt: -1 });
        res.json(movies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single admin-added movie
// @route   GET /api/movies/:id
// @access  Public
const getMovieById = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (movie) {
            res.json(movie);
        } else {
            res.status(404).json({ message: 'Movie not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a movie
// @route   POST /api/movies
// @access  Private/Admin
const createMovie = async (req, res) => {
    const {
        title,
        poster_url,
        description,
        tmdb_id,
        release_date,
        trailer_url,
        genre,
        category
    } = req.body;

    try {
        const movie = new Movie({
            title,
            poster_url,
            description,
            tmdb_id,
            release_date,
            trailer_url,
            genre,
            category
        });

        const createdMovie = await movie.save();
        res.status(201).json(createdMovie);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a movie
// @route   PUT /api/movies/:id
// @access  Private/Admin
const updateMovie = async (req, res) => {
    const {
        title,
        poster_url,
        description,
        tmdb_id,
        release_date,
        trailer_url,
        genre,
        category
    } = req.body;

    try {
        const movie = await Movie.findById(req.params.id);

        if (movie) {
            movie.title = title !== undefined ? title : movie.title;
            movie.poster_url = poster_url !== undefined ? poster_url : movie.poster_url;
            movie.description = description !== undefined ? description : movie.description;
            movie.tmdb_id = tmdb_id !== undefined ? tmdb_id : movie.tmdb_id;
            movie.release_date = release_date !== undefined ? release_date : movie.release_date;
            movie.trailer_url = trailer_url !== undefined ? trailer_url : movie.trailer_url;
            movie.genre = genre !== undefined ? genre : movie.genre;
            movie.category = category !== undefined ? category : movie.category;

            const updatedMovie = await movie.save();
            res.json(updatedMovie);
        } else {
            res.status(404).json({ message: 'Movie not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a movie
// @route   DELETE /api/movies/:id
// @access  Private/Admin
const deleteMovie = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);

        if (movie) {
            await movie.deleteOne();
            res.json({ message: 'Movie removed' });
        } else {
            res.status(404).json({ message: 'Movie not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getMovies,
    getMovieById,
    createMovie,
    updateMovie,
    deleteMovie,
};
