import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import tmdbApi from '../services/tmdbApi';
import MovieCard from '../components/movies/MovieCard';
import './PersonDetails.css';

const PersonDetails = () => {
    const { id } = useParams();
    const [person, setPerson] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showFullBio, setShowFullBio] = useState(false);

    useEffect(() => {
        const fetchPerson = async () => {
            setIsLoading(true);
            try {
                const res = await tmdbApi.get(`/person/${id}?append_to_response=combined_credits`);
                setPerson(res.data);
            } catch {
                setPerson(null);
            }
            setIsLoading(false);
        };
        fetchPerson();
        window.scrollTo(0, 0);
    }, [id]);

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loader"></div>
            </div>
        );
    }

    if (!person) {
        return (
            <div className="error-container">
                <h2>Person not found</h2>
            </div>
        );
    }

    const profileUrl = person.profile_path
        ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
        : 'https://via.placeholder.com/500x750?text=No+Photo';

    const backdropCredit = person.combined_credits?.cast?.find(c => c.backdrop_path);
    const backdropUrl = backdropCredit
        ? `https://image.tmdb.org/t/p/original${backdropCredit.backdrop_path}`
        : profileUrl;

    const biography = person.biography || '';
    const shortBio = biography.length > 400 ? biography.slice(0, 400) + '...' : biography;

    const credits = person.combined_credits?.cast || [];
    const uniqueCredits = [];
    const seen = new Set();
    for (const c of [...credits].sort((a, b) => (b.popularity || 0) - (a.popularity || 0))) {
        if (!seen.has(c.id) && c.poster_path) {
            seen.add(c.id);
            uniqueCredits.push(c);
        }
    }

    return (
        <div className="person-details-page" style={{ paddingTop: '140px' }}>
            {/* Backdrop */}
            <div className="person-backdrop" style={{ backgroundImage: `url(${backdropUrl})` }}>
                <div className="person-backdrop-gradient"></div>
            </div>

            <div className="container person-content">
                <div className="person-layout">
                    <div className="person-poster">
                        <img src={profileUrl} alt={person.name} />
                    </div>

                    <div className="person-info">
                        <h1 className="person-name">{person.name}</h1>
                        <div className="person-meta">
                            {person.known_for_department && (
                                <span className="person-dept-tag">{person.known_for_department}</span>
                            )}
                            {person.birthday && (
                                <span className="person-meta-item">Born: {person.birthday}</span>
                            )}
                            {person.place_of_birth && (
                                <span className="person-meta-item">{person.place_of_birth}</span>
                            )}
                        </div>
                        {biography && (
                            <div className="person-bio">
                                <p>{showFullBio ? biography : shortBio}</p>
                                {biography.length > 400 && (
                                    <button className="read-more-btn" onClick={() => setShowFullBio(!showFullBio)}>
                                        {showFullBio ? 'Show less' : 'Read more'}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {uniqueCredits.length > 0 && (
                    <section className="person-credits-section">
                        <h2 className="person-section-title">Known For</h2>
                        <div className="person-credits-grid">
                            {uniqueCredits.slice(0, 24).map((credit) => (
                                <div key={credit.id} className="person-credit-item">
                                    <MovieCard movie={{ ...credit, media_type: credit.media_type || (credit.title ? 'movie' : 'tv') }} />
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default PersonDetails;
