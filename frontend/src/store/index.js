import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import movieReducer from './slices/movieSlice';
import searchReducer from './slices/searchSlice';
import userReducer from './slices/userSlice';
import adminReducer from './slices/adminSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        movie: movieReducer,
        search: searchReducer,
        user: userReducer,
        admin: adminReducer,
    },
});

export default store;
