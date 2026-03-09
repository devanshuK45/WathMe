import React, { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { fetchDiscoverMovies, clearDiscover } from '../store/slices/movieSlice';
import MovieCard from '../components/movies/MovieCard';
import Skeleton from '../components/ui/Skeleton';
import './Browse.css';

const Browse = () => {
    const [searchParams] = useSearchParams();
    const mediaType = searchParams.get('type') || 'movie';
    const dispatch = useDispatch();
    const [selectedGenre, setSelectedGenre] = React.useState('');

    const genres = mediaType === 'movie' ? [
        { id: '', name: 'All' },
        { id: '28', name: 'Action' },
        { id: '35', name: 'Comedy' },
        { id: '18', name: 'Drama' },
        { id: '27', name: 'Horror' },
        { id: '878', name: 'Sci-Fi' },
        { id: '53', name: 'Thriller' }
    ] : [
        { id: '', name: 'All' },
        { id: '10759', name: 'Action & Adventure' },
        { id: '35', name: 'Comedy' },
        { id: '18', name: 'Drama' },
        { id: '9648', name: 'Mystery' },
        { id: '10765', name: 'Sci-Fi & Fantasy' }
    ];

    const { discover, isLoading, error } = useSelector((state) => state.movie);
    const observer = useRef();

    // Reset results when component mounts or mediaType changes
    useEffect(() => {
        dispatch(clearDiscover());
        dispatch(fetchDiscoverMovies({ page: 1, type: mediaType, genreId: selectedGenre }));

        return () => {
            dispatch(clearDiscover());
        };
    }, [dispatch, mediaType, selectedGenre]);

    // Infinite Scroll Intersection Observer Callback
    const lastElementRef = useCallback(node => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && discover.page < discover.totalPages) {
                dispatch(fetchDiscoverMovies({ page: discover.page + 1, type: mediaType, genreId: selectedGenre }));
            }
        });

        if (node) observer.current.observe(node);
    }, [isLoading, discover.page, discover.totalPages, dispatch]);

    return (
        <div className="browse-page container" style={{ paddingTop: '140px' }}>
            <div className="browse-header">
                <h2>{mediaType === 'movie' ? 'Movies' : 'TV Shows'}</h2>
                <div className="filters-container">
                    <span className="filters-label">Categories</span>
                    <div className="genre-filters">
                        {genres.map(genre => (
                            <button
                                key={genre.id}
                                className={`genre-chip ${selectedGenre === genre.id ? 'active' : ''}`}
                                onClick={() => setSelectedGenre(genre.id)}
                            >
                                {genre.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {error && (
                <div className="error-container">
                    <h3>Oops! Something went wrong</h3>
                    <p>{error}</p>
                </div>
            )}

            <div className="results-grid">
                {isLoading && discover.results.length === 0 ? (
                    [...Array(10)].map((_, i) => <Skeleton key={i} type="movie-card" />)
                ) : (
                    discover.results.map((item, index) => {
                        if (discover.results.length === index + 1) {
                            return (
                                <div ref={lastElementRef} key={`${item.id}-${index}`}>
                                    <MovieCard movie={item} />
                                </div>
                            );
                        } else {
                            return <MovieCard key={`${item.id}-${index}`} movie={item} />;
                        }
                    })
                )}
            </div>

            {isLoading && (
                <div className="infinite-scroll-loader">
                    <div className="loader"></div>
                </div>
            )}
        </div>
    );
};

export default Browse;
