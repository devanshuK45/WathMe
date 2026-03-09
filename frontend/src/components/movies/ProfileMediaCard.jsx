import React, { useState, useEffect } from 'react';
import tmdbApi from '../../services/tmdbApi';
import MovieCard from './MovieCard';

const ProfileMediaCard = ({ tmdbId, mediaType }) => {
    const [media, setMedia] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const response = await tmdbApi.get(`/${mediaType}/${tmdbId}`);
                if (isMounted) {
                    setMedia(response.data);
                    setLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    setError('Failed to load item');
                    setLoading(false);
                }
            }
        };

        if (tmdbId && mediaType) {
            fetchDetails();
        }

        return () => {
            isMounted = false;
        };
    }, [tmdbId, mediaType]);

    if (loading) return <div className="card-skeleton"></div>;
    if (error || !media) return null;

    return <MovieCard movie={media} />;
};

export default ProfileMediaCard;
