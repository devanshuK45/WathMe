import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const getConfig = (getState) => {
    const token = getState().auth.token;
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const fetchAllUsers = createAsyncThunk('admin/fetchAllUsers', async (_, thunkAPI) => {
    try {
        const config = getConfig(thunkAPI.getState);
        const response = await axios.get('/api/users', config);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const deleteUser = createAsyncThunk('admin/deleteUser', async (id, thunkAPI) => {
    try {
        const config = getConfig(thunkAPI.getState);
        await axios.delete(`/api/users/${id}`, config);
        return id;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const fetchAllAdminMovies = createAsyncThunk('admin/fetchAllMovies', async (_, thunkAPI) => {
    try {
        const config = getConfig(thunkAPI.getState);
        const response = await axios.get('/api/movies', config);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const createMovie = createAsyncThunk('admin/createMovie', async (movieData, thunkAPI) => {
    try {
        const config = getConfig(thunkAPI.getState);
        const response = await axios.post('/api/movies', movieData, config);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const updateMovie = createAsyncThunk('admin/updateMovie', async ({ id, movieData }, thunkAPI) => {
    try {
        const config = getConfig(thunkAPI.getState);
        const response = await axios.put(`/api/movies/${id}`, movieData, config);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const deleteMovie = createAsyncThunk('admin/deleteMovie', async (id, thunkAPI) => {
    try {
        const config = getConfig(thunkAPI.getState);
        await axios.delete(`/api/movies/${id}`, config);
        return id;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const toggleBanUser = createAsyncThunk('admin/toggleBanUser', async (id, thunkAPI) => {
    try {
        const config = getConfig(thunkAPI.getState);
        const response = await axios.put(`/api/users/${id}/ban`, {}, config);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

const initialState = {
    users: [],
    movies: [],
    isLoading: false,
    error: null,
};

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        clearAdminError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Users
            .addCase(fetchAllUsers.pending, (state) => { state.isLoading = true; })
            .addCase(fetchAllUsers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.users = action.payload;
            })
            .addCase(fetchAllUsers.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Delete User
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.users = state.users.filter(user => user._id !== action.payload);
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.error = action.payload;
            })
            // Fetch Admin Movies
            .addCase(fetchAllAdminMovies.fulfilled, (state, action) => {
                state.movies = action.payload;
            })
            // Create Movie
            .addCase(createMovie.fulfilled, (state, action) => {
                state.movies.push(action.payload);
            })
            // Update Movie
            .addCase(updateMovie.fulfilled, (state, action) => {
                const index = state.movies.findIndex(movie => movie._id === action.payload._id);
                if (index !== -1) {
                    state.movies[index] = action.payload;
                }
            })
            // Delete Movie
            .addCase(deleteMovie.fulfilled, (state, action) => {
                state.movies = state.movies.filter(movie => movie._id !== action.payload);
            })
            .addCase(deleteMovie.rejected, (state, action) => {
                state.error = action.payload;
            })
            // Toggle Ban User
            .addCase(toggleBanUser.fulfilled, (state, action) => {
                const index = state.users.findIndex(user => user._id === action.payload._id);
                if (index !== -1) {
                    state.users[index] = action.payload;
                }
            });
    },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
