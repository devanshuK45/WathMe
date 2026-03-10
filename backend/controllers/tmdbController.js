const axios = require('axios');

const getTmdbData = async (req, res) => {
    try {
        // Handle Express 4 (req.params[0]) vs Express 5 (req.params.splat) wildcard patterns
        let path = '';
        if (req.params.splat) {
            path = Array.isArray(req.params.splat) ? req.params.splat.join('/') : req.params.splat;
        } else {
            path = req.params[0] || '';
        }

        const queryParams = req.query;

        const response = await axios.get(`https://api.themoviedb.org/3/${path}`, {
            params: {
                ...queryParams,
                api_key: process.env.TMDB_API_KEY,
            },
            timeout: 30000,
        });

        res.json(response.data);
    } catch (error) {
        console.error('TMDB Proxy Error:', error.message);
        res.status(error.response?.status || 500).json({
            message: error.message,
            tmdb_error: error.response?.data
        });
    }
};

module.exports = {
    getTmdbData,
};
