import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../utils';

// Get token from auth state (done inside thunk config or via getState)
const getConfig = (getState) => {
    const token = getState().auth.token;
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const fetchUserProfile = createAsyncThunk('user/fetchProfile', async (_, thunkAPI) => {
    try {
        const config = getConfig(thunkAPI.getState);
        const response = await api.get('/api/auth/profile', config);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const toggleFavorite = createAsyncThunk('user/toggleFavorite', async ({ tmdbId, movieId, mediaType }, thunkAPI) => {
    try {
        const config = getConfig(thunkAPI.getState);
        const response = await api.put('/api/users/favorites', { tmdbId, movieId, mediaType }, config);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const addToHistory = createAsyncThunk('user/addToHistory', async ({ tmdbId, movieId, mediaType }, thunkAPI) => {
    try {
        const config = getConfig(thunkAPI.getState);
        const response = await api.post('/api/users/history', { tmdbId, movieId, mediaType }, config);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const clearHistory = createAsyncThunk('user/clearHistory', async (_, thunkAPI) => {
    try {
        const config = getConfig(thunkAPI.getState);
        const response = await api.delete('/api/users/history', config);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

const initialState = {
    favorites: [],
    favoriteTmdbIds: [],
    watchHistory: [],
    isLoading: false,
    error: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUserProfileData: (state, action) => {
            // Called when user logs in to hydrate their profile data
            state.favorites = action.payload.favorites || [];
            state.favoriteTmdbIds = action.payload.favoriteTmdbIds || [];
            state.watchHistory = action.payload.watchHistory || [];
        },
        clearUserData: (state) => {
            state.favorites = [];
            state.favoriteTmdbIds = [];
            state.watchHistory = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch User Profile
            .addCase(fetchUserProfile.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.favorites = action.payload.favorites || [];
                state.favoriteTmdbIds = action.payload.favoriteTmdbIds || [];
                state.watchHistory = action.payload.watchHistory || [];
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Toggle Favorite
            .addCase(toggleFavorite.fulfilled, (state, action) => {
                state.favorites = action.payload.favorites;
                state.favoriteTmdbIds = action.payload.favoriteTmdbIds;
            })
            // Add to History
            .addCase(addToHistory.fulfilled, (state, action) => {
                state.watchHistory = action.payload;
            })
            // Clear History
            .addCase(clearHistory.fulfilled, (state) => {
                state.watchHistory = [];
            });
    },
});

export const { setUserProfileData, clearUserData } = userSlice.actions;

export default userSlice.reducer;
