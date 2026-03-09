import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import tmdbApi from '../../services/tmdbApi';

export const searchContent = createAsyncThunk('search/searchContent', async (query, thunkAPI) => {
    try {
        const response = await tmdbApi.get(`/search/multi?query=${encodeURIComponent(query)}`);
        // Filter out people (if you only want movies/tv shows) or keep them based on requirements
        // For this generic search, we'll return all
        return response.data.results;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.status_message || error.message);
    }
});

const initialState = {
    results: [],
    isLoading: false,
    error: null,
    searchTerm: '',
};

const searchSlice = createSlice({
    name: 'search',
    initialState,
    reducers: {
        setSearchTerm: (state, action) => {
            state.searchTerm = action.payload;
        },
        clearSearch: (state) => {
            state.results = [];
            state.searchTerm = '';
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(searchContent.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(searchContent.fulfilled, (state, action) => {
                state.isLoading = false;
                state.results = action.payload;
            })
            .addCase(searchContent.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { setSearchTerm, clearSearch } = searchSlice.actions;
export default searchSlice.reducer;
