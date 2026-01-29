// server/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const connectDB = require('./config/db');
require('dotenv').config();

const apiRoutes = require('./routes/api');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Connect to Database
connectDB();
console.log('Attempting to connect to MongoDB...');

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Security Headers for Firebase Auth (Google Sign In)
app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    next();
});

app.use(express.static(path.join(__dirname, '../client/public'))); // Serve widget.js

// Rate Limiter
const rateLimit = require('express-rate-limit');
const chatLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later.' }
});

// Apply limiter to chat endpoint only
app.use('/api/chat', chatLimiter);

// API Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
app.use('/api/documents', require('./routes/documents'));
app.use('/api', apiRoutes);

// WebSocket logic
wss.on('connection', (ws) => {
    console.log('New WebSocket connection');
    ws.on('message', (message) => {
        // Echo or broadcast if needed
        console.log('received: %s', message);
    });
    ws.send(JSON.stringify({ type: 'WELCOME', message: 'Connected to ContextBot Realtime' }));
});

// Broadcast helper (attached to global/app locally for now or exported if needed)
// For simplicity in this mono-file setup, we can't easily export wss to routes without circular deps 
// or dependency injection. 
// A simple hack: Poll from frontend or just use this for "New Lead" events if we trigger them here.
// Ideally, we'd pass wss to the route handler.

// Start Server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
