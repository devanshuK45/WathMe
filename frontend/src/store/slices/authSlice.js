import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { handleSuccess, handleError } from '../../utils';

// Async Thunks
export const login = createAsyncThunk('auth/login', async (userData, thunkAPI) => {
    try {
        const response = await axios.post('/api/auth/login', userData);
        localStorage.setItem('watchme_token', response.data.token);
        handleSuccess(response.data.message || 'Login successful');
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        handleError(message);
        return thunkAPI.rejectWithValue(message);
    }
});

export const register = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
    try {
        const response = await axios.post('/api/auth/register', userData);
        localStorage.setItem('watchme_token', response.data.token);
        handleSuccess(response.data.message || 'Registration successful');
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        handleError(message);
        return thunkAPI.rejectWithValue(message);
    }
});

const initialState = {
    user: null,
    token: localStorage.getItem('watchme_token') || null,
    isLoading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            localStorage.removeItem('watchme_token');
            state.user = null;
            state.token = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
                state.token = action.payload.token;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Register
            .addCase(register.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
                state.token = action.payload.token;
            })
            .addCase(register.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Listen to User Profile fetch to hydrate auth user state
            .addMatcher(
                (action) => action.type === 'user/fetchProfile/fulfilled',
                (state, action) => {
                    state.user = action.payload;
                }
            );
    },
});

export const { logout, clearError } = authSlice.actions;

export default authSlice.reducer;
