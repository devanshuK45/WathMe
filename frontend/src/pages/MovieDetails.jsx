import React, { useEffect, useState, useCallback, memo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMovieDetails, clearMovieDetails } from '../store/slices/movieSlice';
import { toggleFavorite, addToHistory } from '../store/slices/userSlice';
import MovieCard from '../components/movies/MovieCard';
import { Play, Plus, X, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import './MovieDetails.css';

const TrailerModal = memo(({ videoId, onClose }) => {
    if (!videoId) return null;

    return (
        <div className="trailer-modal-overlay" onClick={onClose}>
            <div className="trailer-modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-modal-btn" onClick={onClose}>
                    <X size={24} />
                </button>
                <div className="video-responsive">
                    <iframe
                        width="853"
                        height="480"
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Embedded youtube"
                    />
                </div>
            </div>
        </div>
    );
});

const MovieDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user } = useSelector(state => state.auth);
    const { currentMovie: movie, isMovieLoading: isLoading, error } = useSelector(state => state.movie);
    const { favoriteTmdbIds, favorites } = useSelector(state => state.user);

    const [showTrailer, setShowTrailer] = useState(false);
    const isTv = window.location.pathname.startsWith('/tv');

    const tmdbCheckId = movie?.tmdb_id || (typeof movie?.id === 'number' ? movie.id : undefined);

    const isFavorite = favoriteTmdbIds?.some(fav =>
        (typeof fav === 'object' ? String(fav.tmdbId) : String(fav)) === String(tmdbCheckId)
    ) || favorites?.some(favId =>
        String(favId) === String(movie?._id)
    );

    useEffect(() => {
        dispatch(fetchMovieDetails({ id, type: isTv ? 'tv' : 'movie' }));
        return () => {
            dispatch(clearMovieDetails());
        };
    }, [dispatch, id, isTv]);

    const handleFavorite = useCallback(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        dispatch(toggleFavorite({
            tmdbId: tmdbCheckId,
            movieId: movie?._id,
            mediaType: isTv ? 'tv' : 'movie'
        })).unwrap()
            .then(() => {
                if (isFavorite) {
                    toast.info(`Removed ${movie?.title || movie?.name || 'item'} from favorites`, { icon: "💔" });
                } else {
                    toast.success(`Added ${movie?.title || movie?.name || 'item'} to favorites`, { icon: "❤️" });
                }
            })
            .catch(err => toast.error(err || 'Failed to update favorites'));
    }, [user, navigate, dispatch, tmdbCheckId, movie?._id, isTv, isFavorite, movie]);

    const handleWatchTrailer = useCallback(() => {
        setShowTrailer(true);
        if (user && movie) {
            dispatch(addToHistory({
                tmdbId: movie.id,
                movieId: movie._id,
                mediaType: isTv ? 'tv' : 'movie'
            }));
        }
    }, [user, movie, dispatch, isTv]);

    const closeTrailer = useCallback(() => {
        setShowTrailer(false);
    }, []);

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loader"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <h2>Oops! Something went wrong</h2>
                <p>{error}</p>
                <button className="btn btn-primary" onClick={() => navigate(-1)}>Go Back</button>
            </div>
        );
    }

    if (!movie) return null;

    const trailerVideo = movie.videos?.results?.find(vid => vid.type === 'Trailer' && vid.site === 'YouTube');
    // For custom movies, trailer_url might be a full YouTube link
    const getYouTubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : url;
    };

    const customTrailerId = movie.trailer_url ? getYouTubeId(movie.trailer_url) : null;
    const finalTrailerId = trailerVideo?.key || customTrailerId;

    const imageUrl = movie.backdrop_path
        ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
        : (movie.poster_url || ''); // Fallback for custom movies

    const posterUrl = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : (movie.poster_url?.trim() ? movie.poster_url : 'https://via.placeholder.com/500x750?text=Poster+Not+Available');

    const displayTitle = movie.title || movie.name;
    const displayOverview = movie.overview || movie.description || "Description not available.";
    const displayDate = (movie.release_date || movie.first_air_date)?.split('-')[0];
    const displayRating = movie.vote_average ? `⭐ ${movie.vote_average.toFixed(1)}` : '';

    return (
        <div className="movie-details-page" style={{ paddingTop: '140px' }}>
            <div className="details-backdrop" style={{ backgroundImage: `url(${imageUrl})` }}>
                <div className="backdrop-gradient"></div>
            </div>

            <div className="container details-content">
                <div className="details-layout">
                    <div className="details-poster">
                        <img src={posterUrl} alt={displayTitle} />
                    </div>

                    <div className="details-info">
                        <h1 className="details-title">{displayTitle}</h1>
                        <div className="details-meta">
                            {displayRating && <span className="rating">{displayRating}</span>}
                            {displayDate && <span className="release-date">{displayDate}</span>}
                            <span className="duration">
                                {movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : ''}
                            </span>
                        </div>

                        <div className="genres">
                            {movie.genres ? (
                                movie.genres.map(g => (
                                    <span key={g.id} className="genre-tag">{g.name}</span>
                                ))
                            ) : (
                                movie.genre?.split(',').map((g, i) => (
                                    <span key={i} className="genre-tag">{g.trim()}</span>
                                ))
                            )}
                        </div>

                        <p className="details-overview">{displayOverview}</p>

                        <div className="details-actions">
                            {finalTrailerId ? (
                                <button className="btn btn-primary" onClick={handleWatchTrailer}>
                                    <Play fill="currentColor" size={20} />
                                    <span>Watch Trailer</span>
                                </button>
                            ) : (
                                <button className="btn btn-secondary" disabled>
                                    <span>Trailer not available</span>
                                </button>
                            )}

                            <button
                                className={`btn btn-secondary glass ${isFavorite ? 'active' : ''}`}
                                onClick={handleFavorite}
                            >
                                {isFavorite ? <Check size={20} /> : <Plus size={20} />}
                                <span>{isFavorite ? 'In Favorites' : 'Add to Favorites'}</span>
                            </button>
                        </div>

                        {/* Cast Section */}
                        {movie.credits?.cast?.length > 0 && (
                            <div className="cast-section">
                                <h3 className="cast-title">Main Cast</h3>
                                <div className="cast-list">
                                    {movie.credits.cast.slice(0, 7).map((actor) => (
                                        <Link to={`/person/${actor.id}`} key={actor.id} className="cast-item">
                                            <div className="cast-image">
                                                <img
                                                    src={actor.profile_path
                                                        ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                                                        : 'https://via.placeholder.com/185x185?text=No+Photo'}
                                                    alt={actor.name}
                                                />
                                            </div>
                                            <div className="cast-info">
                                                <span className="actor-name">{actor.name}</span>
                                                <span className="character-name">{actor.character}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Similar Movies */}
                {movie.similar?.results?.length > 0 && (
                    <div className="similar-section">
                        <h3 className="similar-title">More Like This</h3>
                        <div className="similar-grid">
                            {movie.similar.results.slice(0, 12).map((item) => (
                                <div key={item.id} className="similar-item">
                                    <MovieCard movie={{ ...item, media_type: isTv ? 'tv' : 'movie' }} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {showTrailer && finalTrailerId && (
                <TrailerModal videoId={finalTrailerId} onClose={closeTrailer} />
            )}
        </div>
    );
};

export default MovieDetails;
