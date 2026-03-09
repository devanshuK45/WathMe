import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers, deleteUser, toggleBanUser, fetchAllAdminMovies, deleteMovie, createMovie, updateMovie, clearAdminError } from '../store/slices/adminSlice';
import { Users, Film, Plus, Trash2, Edit, ShieldAlert, ShieldCheck, X } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const { users, movies, isLoading, error } = useSelector(state => state.admin);
    const { user: currentUser } = useSelector(state => state.auth);

    const [activeTab, setActiveTab] = useState('users');
    const [showModal, setShowModal] = useState(false);
    const [editingMovie, setEditingMovie] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        poster_url: '',
        description: '',
        tmdb_id: '',
        release_date: '',
        trailer_url: '',
        genre: '',
        category: 'Movies'
    });

    useEffect(() => {
        dispatch(fetchAllUsers());
        dispatch(fetchAllAdminMovies());

        return () => {
            dispatch(clearAdminError());
        };
    }, [dispatch]);

    console.log('Admin State:', { users, movies, isLoading, error });

    const handleDeleteUser = (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            dispatch(deleteUser(id));
        }
    };

    const handleToggleBan = (id) => {
        dispatch(toggleBanUser(id));
    };

    const handleDeleteMovie = (id) => {
        if (window.confirm('Are you sure you want to delete this movie?')) {
            dispatch(deleteMovie(id));
        }
    };

    const handleOpenAddModal = () => {
        setEditingMovie(null);
        setFormData({
            title: '',
            poster_url: '',
            description: '',
            tmdb_id: '',
            release_date: '',
            trailer_url: '',
            genre: '',
            category: 'Movies'
        });
        setShowModal(true);
    };

    const handleOpenEditModal = (movie) => {
        setEditingMovie(movie);
        setFormData({
            title: movie.title || '',
            poster_url: movie.poster_url || '',
            description: movie.description || '',
            tmdb_id: movie.tmdb_id || '',
            release_date: movie.release_date || '',
            trailer_url: movie.trailer_url || '',
            genre: movie.genre || '',
            category: movie.category || 'Movies'
        });
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingMovie) {
            dispatch(updateMovie({ id: editingMovie._id, movieData: formData }));
        } else {
            dispatch(createMovie(formData));
        }
        setShowModal(false);
    };

    return (
        <div className="admin-page container" style={{ paddingTop: '140px' }}>
            <div className="admin-header">
                <div>
                    <h1>Admin Dashboard</h1>
                    <p className="admin-welcome">Welcome back, {currentUser?.username}</p>
                </div>
                <div className="admin-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <Users size={18} />
                        <span>Users</span>
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'movies' ? 'active' : ''}`}
                        onClick={() => setActiveTab('movies')}
                    >
                        <Film size={18} />
                        <span>Movies</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="error-banner glass toast-animation">
                    <ShieldAlert size={18} />
                    <span>{error}</span>
                    <button className="close-error" onClick={() => dispatch(clearAdminError())}>
                        <X size={16} />
                    </button>
                </div>
            )}

            <div className="admin-content">
                {isLoading ? (
                    <div className="admin-loading">
                        <div className="spinner"></div>
                        <p>Fetching dashboard data...</p>
                    </div>
                ) : activeTab === 'users' ? (
                    <div className="admin-section">
                        <div className="section-header">
                            <h2>User Management</h2>
                            <span className="count-badge">{users?.length || 0} Users</span>
                        </div>

                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Email</th>
                                        <th>Status</th>
                                        <th>Role</th>
                                        <th>Joined</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(users) && users.map(u => (
                                        <tr key={u._id} className={u.isBanned ? 'row-banned' : ''}>
                                            <td>{u.username}</td>
                                            <td>{u.email}</td>
                                            <td>
                                                {u.isBanned ? (
                                                    <span className="status-tag banned">Banned</span>
                                                ) : (
                                                    <span className="status-tag active">Active</span>
                                                )}
                                            </td>
                                            <td><span className={`role-tag ${u.role}`}>{u.role}</span></td>
                                            <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <div className="table-actions">
                                                    <button
                                                        className={`action-btn ${u.isBanned ? 'unban' : 'ban'}`}
                                                        onClick={() => handleToggleBan(u._id)}
                                                        title={u.isBanned ? 'Unban User' : 'Ban User'}
                                                        disabled={u.role === 'admin'}
                                                    >
                                                        {u.isBanned ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
                                                    </button>
                                                    <button
                                                        className="action-btn delete"
                                                        onClick={() => handleDeleteUser(u._id)}
                                                        disabled={u.role === 'admin'}
                                                        title="Delete User"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="admin-section">
                        <div className="section-header">
                            <h2>Movie Management</h2>
                            <button className="btn btn-primary btn-sm" onClick={handleOpenAddModal}>
                                <Plus size={18} />
                                <span>Add Movie</span>
                            </button>
                        </div>

                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Category</th>
                                        <th>Genre</th>
                                        <th>Added On</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(movies) && movies.map(m => (
                                        <tr key={m._id}>
                                            <td>{m.title}</td>
                                            <td>{m.category}</td>
                                            <td>{m.genre}</td>
                                            <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <div className="table-actions">
                                                    <button className="action-btn edit" onClick={() => handleOpenEditModal(m)} title="Edit Movie">
                                                        <Edit size={18} />
                                                    </button>
                                                    <button className="action-btn delete" onClick={() => handleDeleteMovie(m._id)} title="Delete Movie">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {movies.length === 0 && <p className="empty-msg">No movies added to the system yet.</p>}
                        </div>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-header-text">
                                <h2>{editingMovie ? 'Edit Movie' : 'Add New Movie'}</h2>
                                <p className="modal-subtitle">{editingMovie ? 'Update the movie details below' : 'Fill in the details to add a new movie'}</p>
                            </div>
                            <button className="close-btn" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="admin-form">
                            {/* Poster Preview */}
                            {formData.poster_url && (
                                <div className="poster-preview">
                                    <img src={formData.poster_url} alt="Poster preview" onError={e => e.target.style.display = 'none'} />
                                </div>
                            )}

                            <div className="form-section">
                                <h3 className="form-section-title">Basic Info</h3>
                                <div className="form-grid">
                                    <div className="form-group span-2">
                                        <label>Movie Title</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="e.g. Inception"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Category</label>
                                        <select
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            required
                                        >
                                            <option value="Movies">Movie</option>
                                            <option value="TV Shows">TV Show</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Genre</label>
                                        <input
                                            type="text"
                                            value={formData.genre}
                                            onChange={e => setFormData({ ...formData, genre: e.target.value })}
                                            placeholder="Action, Sci-Fi"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Release Date</label>
                                        <input
                                            type="date"
                                            value={formData.release_date}
                                            onChange={e => setFormData({ ...formData, release_date: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>TMDB ID <span className="optional-tag">Optional</span></label>
                                        <input
                                            type="number"
                                            value={formData.tmdb_id}
                                            onChange={e => setFormData({ ...formData, tmdb_id: e.target.value })}
                                            placeholder="e.g. 27205"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3 className="form-section-title">Media</h3>
                                <div className="form-grid">
                                    <div className="form-group span-2">
                                        <label>Poster Image URL</label>
                                        <input
                                            type="text"
                                            value={formData.poster_url}
                                            onChange={e => setFormData({ ...formData, poster_url: e.target.value })}
                                            placeholder="https://image-url.com/poster.jpg"
                                            required
                                        />
                                    </div>
                                    <div className="form-group span-2">
                                        <label>YouTube Trailer Link</label>
                                        <input
                                            type="text"
                                            value={formData.trailer_url}
                                            onChange={e => setFormData({ ...formData, trailer_url: e.target.value })}
                                            placeholder="https://youtube.com/watch?v=..."
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3 className="form-section-title">Description</h3>
                                <div className="form-group">
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Write a brief plot summary..."
                                        rows={4}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-submit">
                                    <Film size={18} />
                                    {editingMovie ? 'Save Changes' : 'Add Movie'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
