import React from 'react';
import { Link } from 'react-router-dom';
import './PersonCard.css';

const PersonCard = ({ person }) => {
    const imageUrl = person.profile_path
        ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
        : 'https://via.placeholder.com/500x750?text=No+Photo';

    return (
        <Link to={`/person/${person.id}`} className="person-card">
            <div className="card-image-wrapper">
                <img src={imageUrl} alt={person.name} loading="lazy" />
                <div className="card-overlay">
                    <div className="card-info">
                        <h3 className="card-title">{person.name}</h3>
                        <p className="card-subtitle">{person.known_for_department}</p>
                    </div>
                </div>
            </div>
            <div className="person-known-for">
                {person.known_for?.slice(0, 2).map(item => item.title || item.name).join(', ')}
            </div>
        </Link>
    );
};

export default PersonCard;
