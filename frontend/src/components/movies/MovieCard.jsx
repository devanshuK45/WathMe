import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Play, Plus, Check, Heart } from 'lucide-react';
import { toggleFavorite } from '../../store/slices/userSlice';
import './MovieCard.css';

const MovieCard = ({ movie }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector(state => state.auth);
    const { favoriteTmdbIds } = useSelector(state => state.user);

    const isFavorite = favoriteTmdbIds?.some(fav =>
        (typeof fav === 'object' ? fav.tmdbId : fav) === movie.id
    );

    const handleFavorite = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            navigate('/login');
            return;
        }
        dispatch(toggleFavorite({
            tmdbId: movie.id,
            movieId: movie._id,
            mediaType: movie.title ? 'movie' : 'tv'
        }));
    };

    const imageUrl = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : (movie.poster_url?.trim() ? movie.poster_url : 'https://via.placeholder.com/500x750?text=Poster+Not+Available');

    const movieId = movie.id || movie._id;
    const isMovie = movie.title || movie.category === 'Movies' || !movie.name;

    return (
        <div className="movie-card">
            <div className="card-image-wrapper">
                <img src={imageUrl} alt={movie.title || movie.name} loading="lazy" />
                <div className="card-overlay">
                    <div className="card-actions">
                        {/* Use title presence to distinguish movie from tv */}
                        <Link to={isMovie ? `/movie/${movieId}` : `/tv/${movieId}`} className="play-btn">
                            <Play fill="currentColor" size={24} />
                        </Link>
                        <button
                            className={`add-btn ${isFavorite ? 'active' : ''}`}
                            title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                            onClick={handleFavorite}
                        >
                            {isFavorite ? <Check size={24} /> : <Plus size={24} />}
                        </button>
                    </div>
                    <div className="card-info">
                        <h3 className="card-title">{movie.title || movie.name}</h3>
                        <span className="card-rating">⭐ {movie.vote_average?.toFixed(1) || 'N/A'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovieCard;
