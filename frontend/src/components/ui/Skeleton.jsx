import React from 'react';
import './Skeleton.css';

const Skeleton = ({ type, variant = 'rect', width, height, className = '' }) => {
    const style = {
        width: width || '100%',
        height: height || '100%',
    };

    const classes = `skeleton ${type} ${variant} ${className}`;

    if (type === 'movie-card') {
        return (
            <div className="skeleton-movie-card">
                <div className="skeleton-image"></div>
                <div className="skeleton-text-content">
                    <div className="skeleton-title"></div>
                    <div className="skeleton-subtitle"></div>
                </div>
            </div>
        );
    }

    if (type === 'hero') {
        return (
            <div className="skeleton-hero">
                <div className="skeleton-hero-content">
                    <div className="skeleton-hero-title"></div>
                    <div className="skeleton-hero-text"></div>
                    <div className="skeleton-hero-btns">
                        <div className="skeleton-btn"></div>
                        <div className="skeleton-btn"></div>
                    </div>
                </div>
            </div>
        )
    }

    return <div className={classes} style={style}></div>;
};

export default Skeleton;
