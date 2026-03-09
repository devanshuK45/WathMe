import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
    fetchTrending,
    fetchPopularMovies,
    fetchTopRatedMovies,
    fetchPopularTV,
    fetchTrendingPeople,
    fetchAnimeMovies,
    fetchHorrorMovies,
    fetchTopRatedTV
} from '../store/slices/movieSlice';
import { fetchAllAdminMovies } from '../store/slices/adminSlice';
import MovieCard from '../components/movies/MovieCard';
import PersonCard from '../components/movies/PersonCard';
import { Play, Info, Camera, Star, Film, Tv, Users } from 'lucide-react';
import Skeleton from '../components/ui/Skeleton';
import { useTheme } from '../context/ThemeContext';
import './Home.css';

// TMDB genre ID to name mapping
const GENRE_MAP = {
    28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
    99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
    27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
    10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
    10759: 'Action & Adventure', 10762: 'Kids', 10763: 'News', 10764: 'Reality',
    10765: 'Sci-Fi & Fantasy', 10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics'
};

// Utility to analyze image brightness
const getImageBrightness = (imgUrl) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            // Sample a smaller version for performance
            canvas.width = 50;
            canvas.height = 30;
            ctx.drawImage(img, 0, 0, 50, 30);
            
            try {
                const imageData = ctx.getImageData(0, 0, 50, 30);
                const data = imageData.data;
                let totalBrightness = 0;
                
                for (let i = 0; i < data.length; i += 4) {
                    // Calculate perceived brightness using luminance formula
                    const brightness = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
                    totalBrightness += brightness;
                }
                
                const avgBrightness = totalBrightness / (data.length / 4);
                resolve(avgBrightness);
            } catch (e) {
                // CORS or other error - assume medium brightness
                resolve(128);
            }
        };
        img.onerror = () => resolve(128); // Default to medium on error
        img.src = imgUrl;
    });
};

const Home = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
    const [lightModeMovies, setLightModeMovies] = useState([]);
    const [isAnalyzingBrightness, setIsAnalyzingBrightness] = useState(false);

    const {
        trending,
        popular,
        topRated,
        popularTV,
        topRatedTV,
        trendingPeople,
        animeMovies,
        horrorMovies,
        isLoading,
        error
    } = useSelector((state) => state.movie);
    const { movies: adminMovies } = useSelector((state) => state.admin);

    useEffect(() => {
        dispatch(fetchTrending());
        dispatch(fetchPopularMovies());
        dispatch(fetchTopRatedMovies());
        dispatch(fetchPopularTV());
        dispatch(fetchAnimeMovies());
        dispatch(fetchHorrorMovies());
        dispatch(fetchTopRatedTV());
        dispatch(fetchTrendingPeople());
        dispatch(fetchAllAdminMovies());
    }, [dispatch]);

    // Analyze brightness and filter movies for light mode
    useEffect(() => {
        const filterBrightMovies = async () => {
            if (!trending || trending.length === 0) return;
            
            setIsAnalyzingBrightness(true);
            const brightnessPromises = trending.slice(0, 10).map(async (movie) => {
                const imgUrl = `https://image.tmdb.org/t/p/w300${movie.backdrop_path || movie.poster_path}`;
                const brightness = await getImageBrightness(imgUrl);
                return { movie, brightness };
            });

            const results = await Promise.all(brightnessPromises);
            // Filter for bright/light backgrounds (brightness > 140 on 0-255 scale)
            // Exclude movies whose backdrops don't work well with light mode UI
            const lightModeExclude = ['Cold Storage'];
            const brightMovies = results
                .filter(({ brightness, movie }) => brightness > 140 && !lightModeExclude.includes(movie.title || movie.name))
                .map(({ movie }) => movie);
            
            // If not enough bright movies, also include medium-bright ones
            if (brightMovies.length < 3) {
                const mediumBrightMovies = results
                    .filter(({ brightness, movie }) => brightness > 100 && !lightModeExclude.includes(movie.title || movie.name))
                    .slice(0, 5)
                    .map(({ movie }) => movie);
                setLightModeMovies(mediumBrightMovies.length > 0 ? mediumBrightMovies : trending.slice(0, 5));
            } else {
                setLightModeMovies(brightMovies.slice(0, 5));
            }
            setIsAnalyzingBrightness(false);
        };

        filterBrightMovies();
    }, [trending]);

    // Get the appropriate hero movies based on theme
    // In light mode, wait for brightness analysis before showing hero
    const lightModeReady = lightModeMovies.length > 0;
    const heroMovies = theme === 'light'
        ? (lightModeReady ? lightModeMovies : [])
        : trending.slice(0, 5);

    // Hero Auto-Rotator (Every 6 Seconds)
    useEffect(() => {
        if (!heroMovies || heroMovies.length === 0) return;

        const timer = setInterval(() => {
            setCurrentHeroIndex((prev) => (prev + 1) % heroMovies.length);
        }, 6000);

        return () => clearInterval(timer);
    }, [heroMovies]);

    // Reset hero index when theme changes
    useEffect(() => {
        setCurrentHeroIndex(0);
    }, [theme]);

    const heroMovie = heroMovies.length > 0 ? heroMovies[currentHeroIndex] : null;

    if (isLoading && !heroMovie) {
        return (
            <div className="home-container">
                <Skeleton type="hero" />
                <div className="container content-sections">
                    <section className="movie-row-section">
                        <div className="skeleton-title-row">
                            <Skeleton type="rect" width="200px" height="2rem" />
                        </div>
                        <div className="movie-carousel-skeleton">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="movie-row-item">
                                    <Skeleton type="movie-card" />
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <h2>Oops! Something went wrong</h2>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="home-container">
            {/* Hero Section */}
            {heroMovie && (
                <section className="hero-section">
                    <div className="hero-backdrop">
                        <img
                            src={`https://image.tmdb.org/t/p/original${heroMovie.backdrop_path || heroMovie.poster_path}`}
                            alt={heroMovie.title || heroMovie.name}
                        />
                        <div className="hero-gradient"></div>
                    </div>
                    <div className="container hero-content">
                        <div className="hero-meta">
                            {heroMovie.vote_average > 0 && (
                                <span className="hero-rating">
                                    <Star size={14} fill="currentColor" />
                                    {heroMovie.vote_average.toFixed(1)}
                                </span>
                            )}
                            {heroMovie.genre_ids?.slice(0, 3).map(id => (
                                GENRE_MAP[id] && <span key={id} className="hero-genre-tag">{GENRE_MAP[id]}</span>
                            ))}
                        </div>
                        <h1 className="hero-title">
                            {(() => {
                                const title = heroMovie.title || heroMovie.name;
                                const words = title.split(' ');
                                if (words.length > 4) {
                                    const mid = Math.ceil(words.length / 2);
                                    return (
                                        <>
                                            <span className="hero-title-line">{words.slice(0, mid).join(' ')}</span>
                                            <span className="hero-title-line">{words.slice(mid).join(' ')}</span>
                                        </>
                                    );
                                }
                                return title;
                            })()}
                        </h1>
                        <p className="hero-overview">{heroMovie.overview}</p>
                        <div className="hero-actions">
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate(`/${heroMovie.media_type || 'movie'}/${heroMovie.id}`)}
                            >
                                <Play fill="currentColor" size={20} />
                                <span>Watch Trailer</span>
                            </button>
                            <button
                                className="btn btn-secondary glass"
                                onClick={() => navigate(`/${heroMovie.media_type || 'movie'}/${heroMovie.id}`)}
                            >
                                <Info size={20} />
                                <span>More Info</span>
                            </button>
                        </div>
                        {/* Slider Nav Dots */}
                        <div className="hero-slider-dots">
                            {[...Array(heroMovies.length)].map((_, i) => (
                                <button
                                    key={i}
                                    className={`slider-dot ${i === currentHeroIndex ? 'active' : ''}`}
                                    onClick={() => setCurrentHeroIndex(i)}
                                    aria-label={`Go to slide ${i + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Content Sections */}
            <div className="container content-sections">
                {/* Recently Added (Backend Movies) */}
                {adminMovies && adminMovies.length > 0 && (
                    <section className="movie-row-section">
                        <h2 className="section-title">Recently Added</h2>
                        <div className="movie-row">
                            {adminMovies.map((movie) => (
                                <div key={movie._id} className="movie-row-item">
                                    <MovieCard movie={movie} />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Trending Now */}
                <section className="movie-row-section">
                    <h2 className="section-title">Trending Now</h2>
                    <div className="movie-row trending-row">
                        {trending.slice(1).map((movie, index) => (
                            <div key={movie.id} className="movie-row-item trending-item">
                                <span className="trending-rank">{index + 1}</span>
                                <MovieCard movie={movie} />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Popular on WatchMe */}
                <section className="movie-row-section">
                    <h2 className="section-title">Popular on WatchMe</h2>
                    <div className="movie-row">
                        {popular.map((movie) => (
                            <div key={movie.id} className="movie-row-item">
                                <MovieCard movie={movie} />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Top Charts */}
                <section className="top-charts-section">
                    <h2 className="section-title">Top Charts</h2>
                    <div className="charts-grid">
                        {/* Top 10 Movies */}
                        <div className="chart-column">
                            <h3 className="chart-column-title"><Film size={18} /> Top 10 Movies</h3>
                            <div className="chart-list">
                                {topRated.slice(0, 10).map((movie, index) => (
                                    <Link to={`/movie/${movie.id}`} key={movie.id} className="chart-item">
                                        <span className="chart-rank">{index + 1}</span>
                                        <img
                                            className="chart-poster"
                                            src={movie.poster_path ? `https://image.tmdb.org/t/p/w185${movie.poster_path}` : 'https://via.placeholder.com/46x69?text=N/A'}
                                            alt={movie.title}
                                            loading="lazy"
                                        />
                                        <div className="chart-info">
                                            <span className="chart-title">{movie.title}</span>
                                            <span className="chart-year">{movie.release_date?.split('-')[0]}</span>
                                            <span className="chart-rating">⭐ {movie.vote_average?.toFixed(1)}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Top 10 TV Shows */}
                        <div className="chart-column">
                            <h3 className="chart-column-title"><Tv size={18} /> Top 10 TV Shows</h3>
                            <div className="chart-list">
                                {(topRatedTV.length > 0 ? topRatedTV : popularTV).slice(0, 10).map((show, index) => (
                                    <Link to={`/tv/${show.id}`} key={show.id} className="chart-item">
                                        <span className="chart-rank">{index + 1}</span>
                                        <img
                                            className="chart-poster"
                                            src={show.poster_path ? `https://image.tmdb.org/t/p/w185${show.poster_path}` : 'https://via.placeholder.com/46x69?text=N/A'}
                                            alt={show.name}
                                            loading="lazy"
                                        />
                                        <div className="chart-info">
                                            <span className="chart-title">{show.name}</span>
                                            <span className="chart-year">{show.first_air_date?.split('-')[0]}</span>
                                            <span className="chart-rating">⭐ {show.vote_average?.toFixed(1)}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Top 10 People */}
                        <div className="chart-column">
                            <h3 className="chart-column-title"><Users size={18} /> Top 10 People</h3>
                            <div className="chart-list">
                                {trendingPeople.filter(p => p.profile_path).slice(0, 10).map((person, index) => (
                                    <Link to={`/person/${person.id}`} key={person.id} className="chart-item">
                                        <span className="chart-rank">{index + 1}</span>
                                        <img
                                            className="chart-poster chart-poster-person"
                                            src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                                            alt={person.name}
                                            loading="lazy"
                                        />
                                        <div className="chart-info">
                                            <span className="chart-title">{person.name}</span>
                                            {person.known_for_department && (
                                                <span className="chart-year">{person.known_for_department}</span>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Popular TV Shows */}
                <section className="movie-row-section">
                    <h2 className="section-title">Popular TV Shows</h2>
                    <div className="movie-row">
                        {popularTV.map((show) => (
                            <div key={show.id} className="movie-row-item">
                                <MovieCard movie={show} />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Top Rated */}
                <section className="movie-row-section">
                    <h2 className="section-title">Critically Acclaimed</h2>
                    <div className="movie-row">
                        {topRated.map((movie) => (
                            <div key={movie.id} className="movie-row-item">
                                <MovieCard movie={movie} />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Anime Movies */}
                {animeMovies && animeMovies.length > 0 && (
                    <section className="movie-row-section">
                        <h2 className="section-title">Anime Movies</h2>
                        <div className="movie-row">
                            {animeMovies.map((movie) => (
                                <div key={movie.id} className="movie-row-item">
                                    <MovieCard movie={movie} />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Horror Movies */}
                {horrorMovies && horrorMovies.length > 0 && (
                    <section className="movie-row-section">
                        <h2 className="section-title">Horror Movies</h2>
                        <div className="movie-row">
                            {horrorMovies.map((movie) => (
                                <div key={movie.id} className="movie-row-item">
                                    <MovieCard movie={movie} />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

            </div>
        </div>
    );
};

export default Home;
