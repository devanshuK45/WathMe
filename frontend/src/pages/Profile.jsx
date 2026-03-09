import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchUserProfile, clearHistory } from '../store/slices/userSlice';
import ProfileMediaCard from '../components/movies/ProfileMediaCard';
import { Trash2, Heart, Clock, Calendar, Film, Popcorn } from 'lucide-react';
import './Profile.css';

const Profile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user } = useSelector(state => state.auth);
    const { favoriteTmdbIds, watchHistory, isLoading } = useSelector(state => state.user);

    const fetchedRef = React.useRef(false);

    const handleClearHistory = () => {
        if (window.confirm('Are you sure you want to clear all watch history?')) {
            dispatch(clearHistory());
        }
    };

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else if (!fetchedRef.current) {
            dispatch(fetchUserProfile());
            fetchedRef.current = true;
        }
    }, [user, navigate, dispatch]);

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loader"></div>
            </div>
        );
    }

    return (
        <div className="profile-page container" style={{ paddingTop: '140px' }}>
            <div className="profile-header">
                <div className="profile-avatar">
                    {user?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="profile-info">
                    <h2>{user?.username}</h2>
                    <p>{user?.email}</p>
                    <span className="role-badge">{user?.role}</span>
                </div>
            </div>

            <div className="profile-stats">
                <div className="stat-card">
                    <Heart size={22} className="stat-icon" />
                    <span className="stat-value">{favoriteTmdbIds.length}</span>
                    <span className="stat-label">Favorites</span>
                </div>
                <div className="stat-card">
                    <Clock size={22} className="stat-icon" />
                    <span className="stat-value">{watchHistory.length}</span>
                    <span className="stat-label">Watched</span>
                </div>
                <div className="stat-card">
                    <Calendar size={22} className="stat-icon" />
                    <span className="stat-value">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}</span>
                    <span className="stat-label">Member Since</span>
                </div>
            </div>

            <div className="profile-sections">
                <section className="profile-section">
                    <h3>My Favorites</h3>
                    {(favoriteTmdbIds.length === 0 && favorites.length === 0) ? (
                        <div className="empty-state">
                            <Heart size={40} className="empty-state-icon" />
                            <p className="empty-state-title">No favorites yet</p>
                            <p className="empty-state-subtitle">Movies and shows you love will appear here</p>
                        </div>
                    ) : (
                        <div className="media-grid">
                            {/* TMDB Favorites */}
                            {favoriteTmdbIds.map((item, index) => {
                                const id = typeof item === 'object' ? item.tmdbId : item;
                                const type = typeof item === 'object' ? item.mediaType : 'movie';
                                if (!id) return null;
                                return <ProfileMediaCard key={`fav-tmdb-${id}-${index}`} tmdbId={id} mediaType={type} />;
                            })}

                            {/* Local Favorites */}
                            {favorites.map((movieId, index) => (
                                <ProfileMediaCard key={`fav-local-${movieId}-${index}`} movieId={movieId} mediaType="movie" />
                            ))}
                        </div>
                    )}
                </section>

                <section className="profile-section">
                    <div className="section-header-row">
                        <h3>Watch History</h3>
                        {watchHistory.length > 0 && (
                            <button className="clear-history-btn" onClick={handleClearHistory}>
                                <Trash2 size={16} />
                                Clear All
                            </button>
                        )}
                    </div>
                    {watchHistory.length === 0 ? (
                        <div className="empty-state">
                            <Film size={40} className="empty-state-icon" />
                            <p className="empty-state-title">Nothing watched yet</p>
                            <p className="empty-state-subtitle">Start exploring and your history will show up here</p>
                        </div>
                    ) : (
                        <div className="media-grid">
                            {[...watchHistory].reverse().map((entry, index) => {
                                const tmdbId = entry.tmdbId;
                                const movieId = entry.movieId;
                                const type = entry.mediaType || 'movie';

                                if (!tmdbId && !movieId) return null;

                                return (
                                    <ProfileMediaCard
                                        key={`hist-${tmdbId || movieId}-${index}`}
                                        tmdbId={tmdbId}
                                        movieId={movieId}
                                        mediaType={type}
                                    />
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default Profile;
