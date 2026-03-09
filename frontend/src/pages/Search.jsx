import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchContent, setSearchTerm, clearSearch } from '../store/slices/searchSlice';
import { fetchTrending, fetchPopularTV, fetchTrendingPeople } from '../store/slices/movieSlice';
import useDebounce from '../hooks/useDebounce';
import MovieCard from '../components/movies/MovieCard';
import PersonCard from '../components/movies/PersonCard';
import { Search as SearchIcon, X, Film, Tv, Users, TrendingUp } from 'lucide-react';
import './Search.css';

const FILTER_OPTIONS = [
    { key: 'all', label: 'All', icon: null },
    { key: 'movie', label: 'Movies', icon: Film },
    { key: 'tv', label: 'TV Shows', icon: Tv },
    { key: 'person', label: 'People', icon: Users },
];

const Search = () => {
    const dispatch = useDispatch();
    const { results, isLoading, error, searchTerm } = useSelector((state) => state.search);
    const { trending, popularTV, trendingPeople } = useSelector((state) => state.movie);
    const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
    const [activeFilter, setActiveFilter] = useState('all');
    const searchInputRef = useRef(null);

    // Debounce the local search term by 500ms
    const debouncedSearchTerm = useDebounce(localSearchTerm, 500);

    useEffect(() => {
        // Focus input on mount
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
        // Fetch default content for empty state
        if (!trending?.length) dispatch(fetchTrending());
        if (!popularTV?.length) dispatch(fetchPopularTV());
        if (!trendingPeople?.length) dispatch(fetchTrendingPeople());
    }, []);

    useEffect(() => {
        // Sync local state if Redux state changes externally
        if (searchTerm !== localSearchTerm) {
            setLocalSearchTerm(searchTerm);
        }
    }, [searchTerm]);

    useEffect(() => {
        if (debouncedSearchTerm.trim().length > 0) {
            dispatch(setSearchTerm(debouncedSearchTerm));
            dispatch(searchContent(debouncedSearchTerm));
        } else {
            dispatch(clearSearch());
        }
    }, [debouncedSearchTerm, dispatch]);

    const handleClear = () => {
        setLocalSearchTerm('');
        dispatch(clearSearch());
        if (searchInputRef.current) searchInputRef.current.focus();
    };

    // Include movies, tv shows, and people. Filter out those without images for a premium look.
    const allResults = results.filter(
        (item) => (item.poster_path || item.profile_path)
    );

    // Apply filter based on active filter
    const displayResults = activeFilter === 'all' 
        ? allResults 
        : allResults.filter(item => item.media_type === activeFilter);

    // Count results by type for filter badges
    const resultCounts = {
        all: allResults.length,
        movie: allResults.filter(item => item.media_type === 'movie').length,
        tv: allResults.filter(item => item.media_type === 'tv').length,
        person: allResults.filter(item => item.media_type === 'person').length,
    };

    return (
        <div className="search-page container" style={{ paddingTop: '140px' }}>
            <div className="search-header">
                <div className="search-input-wrapper">
                    <SearchIcon className="search-icon" size={24} />
                    <input
                        ref={searchInputRef}
                        type="text"
                        className="search-input"
                        placeholder="Search for movies, TV shows, actors..."
                        value={localSearchTerm}
                        onChange={(e) => setLocalSearchTerm(e.target.value)}
                    />
                    {localSearchTerm && (
                        <button className="clear-search-btn" onClick={handleClear}>
                            <X size={24} />
                        </button>
                    )}
                </div>
            </div>

            {/* Filter Toggles */}
            {allResults.length > 0 && (
                <div className="search-filters">
                    {FILTER_OPTIONS.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            className={`filter-btn ${activeFilter === key ? 'active' : ''}`}
                            onClick={() => setActiveFilter(key)}
                        >
                            {Icon && <Icon size={16} />}
                            <span>{label}</span>
                            {resultCounts[key] > 0 && (
                                <span className="filter-count">{resultCounts[key]}</span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            <div className="search-content">
                {isLoading && (
                    <div className="loading-container">
                        <div className="loader"></div>
                    </div>
                )}

                {error && (
                    <div className="error-container">
                        <h3>Something went wrong with your search</h3>
                        <p>{error}</p>
                    </div>
                )}

                {!isLoading && !error && debouncedSearchTerm.trim() === '' && (
                    <div className="search-discover">
                        {/* Trending Movies */}
                        {trending?.length > 0 && (
                            <div className="search-discover-section">
                                <h3 className="search-discover-title">
                                    <TrendingUp size={20} />
                                    <span>Trending Movies</span>
                                </h3>
                                <div className="search-results-grid">
                                    {trending.filter(m => m.poster_path && (m.media_type === 'movie' || m.title)).slice(0, 12).map((movie) => (
                                        <div key={movie.id} className="search-result-item">
                                            <MovieCard movie={{ ...movie, media_type: movie.media_type || 'movie' }} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Popular TV Shows */}
                        {popularTV?.length > 0 && (
                            <div className="search-discover-section">
                                <h3 className="search-discover-title">
                                    <Tv size={20} />
                                    <span>Popular TV Shows</span>
                                </h3>
                                <div className="search-results-grid">
                                    {popularTV.filter(s => s.poster_path).slice(0, 12).map((show) => (
                                        <div key={show.id} className="search-result-item">
                                            <MovieCard movie={{ ...show, media_type: 'tv' }} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Trending People */}
                        {trendingPeople?.length > 0 && (
                            <div className="search-discover-section">
                                <h3 className="search-discover-title">
                                    <Users size={20} />
                                    <span>Popular People</span>
                                </h3>
                                <div className="search-results-grid">
                                    {trendingPeople.filter(p => p.profile_path).slice(0, 12).map((person) => (
                                        <div key={person.id} className="search-result-item">
                                            <PersonCard person={person} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {!isLoading && !error && debouncedSearchTerm.trim() !== '' && displayResults.length === 0 && (
                    <div className="no-results-container">
                        <h3>
                            {activeFilter !== 'all' 
                                ? `No ${activeFilter === 'movie' ? 'movies' : activeFilter === 'tv' ? 'TV shows' : 'people'} found for "${debouncedSearchTerm}"`
                                : `No results found for "${debouncedSearchTerm}"`
                            }
                        </h3>
                        <p>
                            {activeFilter !== 'all' 
                                ? 'Try selecting "All" to see all results, or search for something else.'
                                : 'Try searching for a different title, actor, or keyword.'
                            }
                        </p>
                    </div>
                )}

                {!isLoading && !error && displayResults.length > 0 && (
                    <div className="search-results-grid">
                        {displayResults.map((item) => (
                            item.media_type === 'person' ? (
                                <div key={item.id} className="search-result-item">
                                    <PersonCard person={item} />
                                </div>
                            ) : (
                                <div key={item.id} className="search-result-item">
                                    <MovieCard movie={item} />
                                </div>
                            )
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
