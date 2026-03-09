import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useTheme } from '../../context/ThemeContext';
import { SlideTabs } from '../ui/slide-tabs';
import { Search, User, LogOut, ChevronDown, LayoutDashboard, Heart, History } from 'lucide-react';
import SkyToggle from '../ui/sky-toggle';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const { user } = useSelector((state) => state.auth);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const [isScrolled, setIsScrolled] = useState(false);
    
    // Check if we're on a movie/tv details page - disable scroll transition there
    const isDetailsPage = location.pathname.startsWith('/movie/') || location.pathname.startsWith('/tv/');
    const isHomePage = location.pathname === '/';
    
    // Pages with hero/backdrop images need white nav text, others need black
    const needsLightNavText = isDetailsPage || isHomePage;
    
    // Use refs for scroll optimization
    const scrolledRef = useRef(false);
    const rafRef = useRef(null);

    useEffect(() => {
        // Don't add scroll listener on details pages
        if (isDetailsPage) {
            setIsScrolled(false);
            scrolledRef.current = false;
            return;
        }
        
        const handleScroll = () => {
            // Cancel any pending animation frame
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
            
            // Use requestAnimationFrame for smooth updates
            rafRef.current = requestAnimationFrame(() => {
                const shouldBeScrolled = window.scrollY > 20;
                
                // Only update state if the value actually changed
                if (scrolledRef.current !== shouldBeScrolled) {
                    scrolledRef.current = shouldBeScrolled;
                    setIsScrolled(shouldBeScrolled);
                }
            });
        };
        
        // Use passive listener for better scroll performance
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, [isDetailsPage]);

    const handleLogout = useCallback(() => {
        dispatch(logout());
        navigate('/login');
    }, [dispatch, navigate]);

    const handleTabSelect = useCallback((tabName) => {
        if (tabName === 'Home') navigate('/');
        else if (tabName === 'Movies') navigate('/browse?type=movie');
        else if (tabName === 'TV Shows') navigate('/browse?type=tv');
        else if (tabName === 'Search') navigate('/search');
    }, [navigate]);

    const getCurrentTab = useCallback(() => {
        const path = location.pathname;
        const search = location.search;
        if (path === '/') return 0; // Home
        if (search.includes('type=movie')) return 1; // Movies
        if (search.includes('type=tv')) return 2; // TV Shows
        if (path === '/search') return 3; // Search
        return 0;
    }, [location.pathname, location.search]);

    return (
        <header className={`navbar-wrapper ${isScrolled ? 'scrolled' : ''} ${!needsLightNavText ? 'dark-nav-text' : ''}`}>
            <div className={`navbar-inner ${isScrolled ? 'glass-pill' : ''}`}>
                <div className="nav-left">
                    <Link to="/" className="brand flex items-center gap-2">
                        <span className="logo-text">
                            Watch<span style={{ color: '#f43f5e' }}>Me</span>
                        </span>
                    </Link>
                </div>

                <nav className="nav-middle">
                    <SlideTabs scrolled={isScrolled} onTabSelect={handleTabSelect} currentTab={getCurrentTab()} />
                </nav>

                <div className="nav-right">
                    <div className="theme-toggle-wrapper">
                        <SkyToggle isDarkMode={theme === 'dark'} toggleTheme={toggleTheme} />
                    </div>

                    {user ? (
                        <div className="user-profile-nav">
                            <button
                                className="profile-trigger"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                <div className="avatar-sm">
                                    {user.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <ChevronDown size={16} />
                            </button>

                            {isDropdownOpen && (
                                <div className="user-dropdown" onMouseLeave={() => setIsDropdownOpen(false)}>
                                    <div className="dropdown-info">
                                        <p className="user-name">{user.name}</p>
                                        <p className="user-email">{user.email}</p>
                                    </div>
                                    <div className="dropdown-divider"></div>
                                    {user.role === 'admin' && (
                                        <Link to="/admin" className="dropdown-item">
                                            <LayoutDashboard size={18} />
                                            Admin Dashboard
                                        </Link>
                                    )}
                                    <Link to="/profile" className="dropdown-item">
                                        <Heart size={18} />
                                        My Favorites
                                    </Link>
                                    <Link to="/profile" className="dropdown-item">
                                        <History size={18} />
                                        Watch History
                                    </Link>
                                    <div className="dropdown-divider"></div>
                                    <button onClick={handleLogout} className="dropdown-item logout">
                                        <LogOut size={18} />
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="login-btn-pill">
                            <div className="user-icon-circle">
                                <User size={14} />
                            </div>
                            <span>Sign In</span>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
