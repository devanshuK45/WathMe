import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import tmdbApi from '../../services/tmdbApi';

// Helper to handle axios errors
const handleAxiosError = (error, thunkAPI) => {
    console.error('API Error:', error);
    const message = error.code === 'ECONNABORTED'
        ? 'Connection timed out. Check your VPN/Network.'
        : (error.response?.data?.status_message || error.message);
    return thunkAPI.rejectWithValue(message);
};

// Async Thunks
// Async Thunks
export const fetchTrending = createAsyncThunk('movie/fetchTrending', async (_, thunkAPI) => {
    try {
        const response = await tmdbApi.get('/trending/all/day');
        return response.data.results;
    } catch (error) {
        return handleAxiosError(error, thunkAPI);
    }
});

export const fetchPopularMovies = createAsyncThunk('movie/fetchPopularMovies', async (_, thunkAPI) => {
    try {
        const response = await tmdbApi.get('/movie/popular');
        return response.data.results;
    } catch (error) {
        return handleAxiosError(error, thunkAPI);
    }
});

export const fetchTopRatedMovies = createAsyncThunk('movie/fetchTopRated', async (_, thunkAPI) => {
    try {
        const response = await tmdbApi.get('/movie/top_rated');
        return response.data.results;
    } catch (error) {
        return handleAxiosError(error, thunkAPI);
    }
});

export const fetchDiscoverMovies = createAsyncThunk('movie/fetchDiscover', async ({ page = 1, type = 'movie', genreId = '' }, thunkAPI) => {
    try {
        const endpoint = type === 'tv' ? '/discover/tv' : '/discover/movie';
        const genreParam = genreId ? `&with_genres=${genreId}` : '';
        const response = await tmdbApi.get(`${endpoint}?page=${page}${genreParam}`);
        return response.data; // Need total_pages for infinite scroll
    } catch (error) {
        return handleAxiosError(error, thunkAPI);
    }
});

export const fetchMovieDetails = createAsyncThunk('movie/fetchDetails', async (args, thunkAPI) => {
    try {
        const id = typeof args === 'object' ? args.id : args;
        const type = typeof args === 'object' ? (args.type || 'movie') : 'movie';

        // If ID is a MongoDB ObjectId (24 characters), fetch from our backend
        if (id?.length === 24) {
            const response = await axios.get(`/api/movies/${id}`);
            return response.data;
        }

        // Otherwise fetch from TMDB
        const response = await tmdbApi.get(`/${type}/${id}?append_to_response=videos,credits,similar`);
        return response.data;
    } catch (error) {
        // Fallback: If TMDB fails, maybe it exists in our backend? 
        // Or if it's a numeric ID that also exists in our local DB
        try {
            const id = typeof args === 'object' ? args.id : args;
            const response = await axios.get(`/api/movies/${id}`);
            return response.data;
        } catch (localError) {
            return handleAxiosError(error, thunkAPI);
        }
    }
});

export const fetchPopularTV = createAsyncThunk('movie/fetchPopularTV', async (_, thunkAPI) => {
    try {
        const response = await tmdbApi.get('/tv/popular');
        return response.data.results;
    } catch (error) {
        return handleAxiosError(error, thunkAPI);
    }
});

export const fetchTrendingPeople = createAsyncThunk('movie/fetchTrendingPeople', async (_, thunkAPI) => {
    try {
        const response = await tmdbApi.get('/trending/person/week');
        return response.data.results;
    } catch (error) {
        return handleAxiosError(error, thunkAPI);
    }
});

// Anime Movies (Genre ID: 16 = Animation)
export const fetchAnimeMovies = createAsyncThunk('movie/fetchAnimeMovies', async (_, thunkAPI) => {
    try {
        const response = await tmdbApi.get('/discover/movie?with_genres=16&sort_by=popularity.desc');
        return response.data.results;
    } catch (error) {
        return handleAxiosError(error, thunkAPI);
    }
});

// Top Rated TV Shows
export const fetchTopRatedTV = createAsyncThunk('movie/fetchTopRatedTV', async (_, thunkAPI) => {
    try {
        const response = await tmdbApi.get('/tv/top_rated');
        return response.data.results;
    } catch (error) {
        return handleAxiosError(error, thunkAPI);
    }
});

// Horror Movies (Genre ID: 27 = Horror)
export const fetchHorrorMovies = createAsyncThunk('movie/fetchHorrorMovies', async (_, thunkAPI) => {
    try {
        const response = await tmdbApi.get('/discover/movie?with_genres=27&sort_by=popularity.desc');
        return response.data.results;
    } catch (error) {
        return handleAxiosError(error, thunkAPI);
    }
});

const initialState = {
    trending: [],
    popular: [],
    topRated: [],
    popularTV: [],
    trendingPeople: [],
    topRatedTV: [],
    animeMovies: [],
    horrorMovies: [],
    discover: {
        results: [],
        page: 1,
        totalPages: 0,
    },
    currentMovie: null,
    isMovieLoading: false,
    isLoading: false,
    error: null,
};

const movieSlice = createSlice({
    name: 'movie',
    initialState,
    reducers: {
        clearDiscover: (state) => {
            state.discover = { results: [], page: 1, totalPages: 0 };
        },
        clearMovieDetails: (state) => {
            state.currentMovie = null;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Trending
            .addCase(fetchTrending.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchTrending.fulfilled, (state, action) => {
                state.isLoading = false;
                state.trending = action.payload;
            })
            .addCase(fetchTrending.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Popular
            .addCase(fetchPopularMovies.fulfilled, (state, action) => {
                state.popular = action.payload;
            })
            // Top Rated
            .addCase(fetchTopRatedMovies.fulfilled, (state, action) => {
                state.topRated = action.payload;
            })
            // Popular TV
            .addCase(fetchPopularTV.fulfilled, (state, action) => {
                state.popularTV = action.payload;
            })
            // Trending People
            .addCase(fetchTrendingPeople.fulfilled, (state, action) => {
                state.trendingPeople = action.payload;
            })
            // Top Rated TV
            .addCase(fetchTopRatedTV.fulfilled, (state, action) => {
                state.topRatedTV = action.payload;
            })
            // Anime Movies
            .addCase(fetchAnimeMovies.fulfilled, (state, action) => {
                state.animeMovies = action.payload;
            })
            // Horror Movies
            .addCase(fetchHorrorMovies.fulfilled, (state, action) => {
                state.horrorMovies = action.payload;
            })
            // Discover (Infinite Scroll handling)
            .addCase(fetchDiscoverMovies.fulfilled, (state, action) => {
                if (action.payload.page === 1) {
                    state.discover.results = action.payload.results;
                } else {
                    state.discover.results = [...state.discover.results, ...action.payload.results];
                }
                state.discover.page = action.payload.page;
                state.discover.totalPages = action.payload.total_pages;
            })
            // Movie Details
            .addCase(fetchMovieDetails.pending, (state) => {
                state.isMovieLoading = true;
                state.error = null;
            })
            .addCase(fetchMovieDetails.fulfilled, (state, action) => {
                state.isMovieLoading = false;
                state.currentMovie = action.payload;
            })
            .addCase(fetchMovieDetails.rejected, (state, action) => {
                state.isMovieLoading = false;
                state.error = action.payload;
            });
    },
});

export const { clearDiscover, clearMovieDetails } = movieSlice.actions;

export default movieSlice.reducer;
