import axios from 'axios';

// Get API Key from environment variables
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const tmdbApi = axios.create({
    baseURL: BASE_URL,
    timeout: 10000, // 10s timeout
    params: {
        api_key: TMDB_API_KEY,
    },
});

export default tmdbApi;
