import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Instagram, Linkedin, Github, Play } from 'lucide-react';
import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        Browse: [
            { name: 'Movies', path: '/browse?type=movie' },
            { name: 'TV Shows', path: '/browse?type=tv' },
            { name: 'Trending', path: '/' },
            { name: 'Top Rated', path: '/' },
        ],
        Genres: [
            { name: 'Action', path: '/browse?type=movie&genre=28' },
            { name: 'Comedy', path: '/browse?type=movie&genre=35' },
            { name: 'Drama', path: '/browse?type=movie&genre=18' },
            { name: 'Horror', path: '/browse?type=movie&genre=27' },
        ],
        Account: [
            { name: 'Profile', path: '/profile' },
            { name: 'Favorites', path: '/profile' },
            { name: 'Watch History', path: '/profile' },
            { name: 'Settings', path: '/profile' },
        ],
    };

    const socialLinks = [
        { icon: Twitter, href: '#', label: 'Twitter' },
        { icon: Instagram, href: '#', label: 'Instagram' },
        { icon: Linkedin, href: '#', label: 'LinkedIn' },
        { icon: Github, href: '#', label: 'GitHub' },
    ];

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-main">
                    {/* Left Section - Logo & Description */}
                    <div className="footer-brand">
                        <Link to="/" className="footer-logo">
                            <div className="footer-logo-icon">
                                <Play size={14} fill="white" />
                            </div>
                            <span className="footer-logo-text">
                                Watch<span className="accent">Me</span>
                            </span>
                        </Link>
                        <p className="footer-description">
                            WatchMe brings you the best movies and TV shows from around the world. 
                            Discover, track, and enjoy your favorite content — all in one place.
                        </p>
                        <div className="footer-social">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    className="social-link"
                                    aria-label={social.label}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <social.icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Right Section - Link Columns */}
                    <div className="footer-links">
                        {Object.entries(footerLinks).map(([category, links]) => (
                            <div key={category} className="footer-column">
                                <h4 className="footer-column-title">{category}</h4>
                                <ul className="footer-column-list">
                                    {links.map((link) => (
                                        <li key={link.name}>
                                            <Link to={link.path} className="footer-link">
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="footer-bottom">
                    <p className="footer-copyright">
                        © {currentYear} WatchMe. All rights reserved.
                    </p>
                    <div className="footer-legal">
                        <Link to="#" className="footer-legal-link">Privacy Policy</Link>
                        <Link to="#" className="footer-legal-link">Terms of Service</Link>
                        <Link to="#" className="footer-legal-link">Cookie Settings</Link>
                    </div>
                </div>
            </div>

            {/* Watermark Logo */}
            <div className="footer-watermark">
                <span className="watermark-text">WatchMe</span>
            </div>
        </footer>
    );
};

export default Footer;
