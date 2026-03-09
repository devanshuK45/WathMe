import axios from 'axios';

// Get API Key from environment variables
const BASE_URL = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/tmdb`
    : '/api/tmdb';

const tmdbApi = axios.create({
    baseURL: BASE_URL,
    timeout: 30000, // Increased timeout for proxy
});

export default tmdbApi;
