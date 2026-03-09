# WatchMe

A full-stack movie and TV show discovery app. Browse trending content, search for movies, TV shows, and actors, manage your favorites, track watch history, and explore detailed information — all powered by the TMDB API.

---

## What It Does

- **Home page** with a hero slider, trending movies, popular content, and Top Charts (Top 10 Movies, TV Shows, and People)
- **Browse** movies and TV shows by genre with infinite scroll
- **Search** for movies, TV shows, and people with debounced input and filter tabs
- **Movie & TV details** with backdrop, trailer playback, cast list, and "More Like This" recommendations
- **Person details** page with biography, filmography, and known-for credits
- **User authentication** (register, login, JWT-based sessions)
- **Profile page** with favorites, watch history, and a clear history option
- **Admin dashboard** to manage users and add custom movies
- **Dark / Light theme** toggle that remembers your preference
- **Fully responsive** — works on desktop, tablet, and mobile

---

## Tech Stack

### Frontend
- **React 19** with Vite
- **Redux Toolkit** for state management
- **React Router v7** for client-side routing
- **Axios** for API requests
- **Lucide React** for icons
- **Framer Motion** for animations
- **CSS** with custom properties (no Tailwind — pure CSS theming)

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcryptjs** for password hashing

### External API
- **TMDB (The Movie Database)** — movie/TV/person data, images, trailers

---

## Project Structure

```
WatchMe/
├── backend/
│   ├── controllers/       # Auth, movie, user logic
│   ├── middleware/         # JWT auth middleware
│   ├── models/            # Mongoose schemas (User, Movie)
│   ├── routes/            # Express routes
│   ├── server.js          # Entry point
│   └── .env               # Backend environment variables
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # Theme context
│   │   ├── hooks/         # Custom hooks (useDebounce)
│   │   ├── pages/         # All page components
│   │   ├── services/      # TMDB API config
│   │   ├── store/         # Redux store and slices
│   │   └── main.jsx       # App entry
│   └── .env               # Frontend environment variables
└── package.json           # Root scripts (runs both)
```

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **MongoDB** (local install or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)
- **TMDB API key** — get one free at [themoviedb.org](https://www.themoviedb.org/settings/api)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/WatchMe.git
cd WatchMe
```

### 2. Set up environment variables

**Backend** — create `backend/.env`:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=any_secret_string_you_want
```

**Frontend** — create `frontend/.env`:

```
VITE_TMDB_API_KEY=your_tmdb_api_key
```

### 3. Install dependencies

```bash
# Install root dependencies (concurrently)
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 4. Run the app

From the root folder:

```bash
npm run dev
```

This starts both the backend (port 5000) and frontend (port 5173) together.

Or run them separately:

```bash
# Terminal 1 — backend
cd backend && npm start

# Terminal 2 — frontend
cd frontend && npm run dev
```

Then open **http://localhost:5173** in your browser.

---

## Features in Detail

### Authentication
- Register with username, email, and password
- Login with JWT token stored in localStorage
- Protected routes redirect to login if not authenticated
- Admin role with dashboard access

### Home Page
- Auto-rotating hero with trending movie backdrops, ratings, and genre tags
- Horizontal scroll rows: Trending Now (with rank numbers), Popular, TV Shows, Critically Acclaimed, Anime, Horror
- Top Charts section with ranked lists for movies, TV shows, and people

### Search
- Debounced search (500ms) to avoid excessive API calls
- Filter tabs: All, Movies, TV Shows, People
- Default discover content (trending movies, popular TV, popular people) when search is empty

### Movie / TV Details
- Full backdrop with gradient overlay
- Poster, title, rating, runtime, genres, overview
- YouTube trailer playback in a modal
- Add to favorites button
- Scrollable cast section (clickable — links to person page)
- "More Like This" grid of similar titles

### Person Details
- Profile photo with blurred backdrop
- Name, department, birthday, birthplace, biography (expandable)
- "Known For" grid of their most popular credits

### Theme
- Dark and light mode toggle
- Theme persists in localStorage
- No flash on page refresh (theme applied before first paint)
- Smooth transitions between themes

### Admin Dashboard
- View and manage all registered users
- Ban/unban users
- Add, edit, and delete custom movies

---

## Environment Variables

| Variable | Location | Description |
|---|---|---|
| `PORT` | `backend/.env` | Backend server port (default: 5000) |
| `MONGO_URI` | `backend/.env` | MongoDB connection string |
| `JWT_SECRET` | `backend/.env` | Secret key for signing JWT tokens |
| `VITE_TMDB_API_KEY` | `frontend/.env` | Your TMDB API key |

---

## API Routes

### Auth
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login and receive JWT

### Users
- `GET /api/users/profile` — Get current user profile
- `PUT /api/users/favorites` — Add/remove favorites
- `PUT /api/users/history` — Update watch history
- `DELETE /api/users/history` — Clear watch history

### Movies (Admin)
- `GET /api/movies` — Get all custom movies
- `POST /api/movies` — Add a movie (admin only)
- `PUT /api/movies/:id` — Update a movie (admin only)
- `DELETE /api/movies/:id` — Delete a movie (admin only)

---

## License

MIT
