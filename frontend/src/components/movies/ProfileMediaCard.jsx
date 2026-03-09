import React, { useState, useEffect } from 'react';
import tmdbApi from '../../services/tmdbApi';
import { api } from '../../utils';
import MovieCard from './MovieCard';

const ProfileMediaCard = ({ tmdbId, movieId, mediaType }) => {
    const [media, setMedia] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        const fetchDetails = async () => {
            try {
                setLoading(true);
                let response;

                if (tmdbId) {
                    // Fetch from TMDB
                    response = await tmdbApi.get(`/${mediaType || 'movie'}/${tmdbId}`);
                } else if (movieId) {
                    // Fetch from our local backend
                    response = await api.get(`/api/movies/${movieId}`);
                }

                if (isMounted && response) {
                    setMedia(response.data);
                    setLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    console.error('Error fetching media details:', err);
                    setError('Failed to load item');
                    setLoading(false);
                }
            }
        };

        if (tmdbId || movieId) {
            fetchDetails();
        }

        return () => {
            isMounted = false;
        };
    }, [tmdbId, movieId, mediaType]);

    if (loading) return <div className="card-skeleton" style={{ height: '300px', backgroundColor: '#333', borderRadius: '8px' }}></div>;
    if (error || !media) return null;

    return <MovieCard movie={media} />;
};

export default ProfileMediaCard;
