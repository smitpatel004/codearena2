/**
 * CodeArena Backend - Main Server Entry Point
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const dashboardRoutes = require('./routes/dashboard');
const battleRoutes = require('./routes/battle');
const analyticsRoutes = require('./routes/analytics');
const leaderboardRoutes = require('./routes/leaderboard');
const friendRoutes = require('./routes/friends');
const aiRoutes = require('./routes/ai');
const challengeRoutes = require('./routes/challenge');

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// ─── Socket.IO Setup ─────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
});

// Store io instance in app for controller access
app.set('io', io);

// Track online users: userId -> Set of socket IDs
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log(`[WS] Client connected: ${socket.id}`);

  // Authenticate and join user's personal room
  socket.on('auth', (userId) => {
    if (!userId) return;

    // Join personal room for direct notifications
    socket.join(`user:${userId}`);

    // Track online status
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Store userId on socket for disconnect handling
    socket.userId = userId;

    console.log(`[WS] User ${userId} authenticated on socket ${socket.id}`);
  });

  // Join a challenge room (for both participants)
  socket.on('challenge:join', (challengeId) => {
    socket.join(`challenge:${challengeId}`);
    console.log(`[WS] Socket ${socket.id} joined challenge:${challengeId}`);
  });

  // Leave a challenge room
  socket.on('challenge:leave', (challengeId) => {
    socket.leave(`challenge:${challengeId}`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    if (socket.userId && onlineUsers.has(socket.userId)) {
      onlineUsers.get(socket.userId).delete(socket.id);
      if (onlineUsers.get(socket.userId).size === 0) {
        onlineUsers.delete(socket.userId);
      }
    }
    console.log(`[WS] Client disconnected: ${socket.id}`);
  });
});

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// ─── Core Middleware ──────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/battle', battleRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/challenges', challengeRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'CodeArena API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 CodeArena API running on port ${PORT} [${process.env.NODE_ENV}]`);
  console.log(`🔌 WebSocket server ready\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

module.exports = { app, server, io };
