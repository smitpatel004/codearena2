# ⚔️ CodeArena

CodeArena is a Competitive Programming Analytics and Battle Platform that allows users to connect their LeetCode, Codeforces, and CodeChef profiles, view unified coding statistics, compare profiles with friends, analyze strengths and weaknesses, and receive AI-generated improvement suggestions.

## Features

- **Unified Dashboard:** See LeetCode, Codeforces, and CodeChef stats in one place.
- **Battle Arena:** Compare any two coding profiles head-to-head and see who comes out on top based on an algorithmic skill score (0-100).
- **Analytics:** View charts of your difficulty distribution, platform contribution, and skill breakdown.
- **AI Coach:** Gemini AI analyzes your profile to give strengths, weaknesses, and personalized recommendations.
- **Leaderboard:** See how you rank globally against other CodeArena users.
- **Friends Network:** Add friends, compare stats, and instantly challenge them to a battle.
- **Modern UI:** Built with Tailwind CSS featuring a sleek dark mode and glassmorphism.

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Chart.js (react-chartjs-2)
- React Hot Toast

### Backend
- Node.js
- Express
- MongoDB (Mongoose)
- JWT Authentication
- Google Gemini AI API
- Axios & Cheerio (for platform data fetching)

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
```

Copy the environment template:
```bash
cp .env.example .env
```
Update `.env` with your MongoDB URI, JWT Secret, and Gemini API Key.

Start the backend server:
```bash
npm run dev
```
The server will start on `http://localhost:5000`.

### 2. Frontend Setup

Open a new terminal.

```bash
cd frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```
The application will open at `http://localhost:5173`.

## Environment Variables

### Backend (`/backend/.env`)
- `PORT=5000`
- `MONGODB_URI=your_mongo_uri`
- `JWT_SECRET=your_jwt_secret`
- `GEMINI_API_KEY=your_gemini_key`
- `FRONTEND_URL=http://localhost:5173`

### Frontend (`/frontend/.env` - optional if using default proxy)
- `VITE_API_URL=http://localhost:5000/api`

## Architecture

```
codearena/
├── frontend/             # React application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── context/      # React context (Auth)
│   │   ├── pages/        # Page components
│   │   ├── utils/        # Axios API instance
│   │   ├── App.jsx       # App router
│   │   └── index.css     # Tailwind configuration and global styles
│   └── vite.config.js    # Vite configuration
│
└── backend/              # Express API
    ├── config/           # Database configuration
    ├── controllers/      # Route controllers
    ├── middleware/       # Auth and error handling
    ├── models/           # Mongoose schemas
    ├── routes/           # API routes
    ├── services/         # External APIs (LeetCode, CF, Gemini)
    ├── utils/            # Helper functions (Skill score calculator)
    └── server.js         # Entry point
```

## API Documentation

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate a user
- `GET /api/profile` - Get user's connected platforms
- `PUT /api/profile` - Update platform usernames
- `GET /api/dashboard` - Fetch live stats from all connected platforms
- `POST /api/battle` - Run a head-to-head comparison
- `GET /api/analytics` - Get chart data and stats summary
- `POST /api/ai/analyze` - Request Gemini AI profile analysis
- `GET /api/leaderboard` - Get top users ranked by skill score
- `GET /api/friends` - List user's friends
