const axios = require('axios');

const getTmdbData = async (req, res) => {
    try {
        const path = req.params[0]; // Get the wildcard path
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
