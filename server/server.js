// Load environment variables
require('dotenv').config();

// Import required modules
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const auth = require('./middleware/auth');
const mongoose = require('mongoose');

// Initialize Express app and create HTTP server
const app = express();
const server = http.createServer(app);

// Connect to the database
connectDB();

// CORS configuration
app.use(cors({
  origin: "*", // TODO: Specify allowed origins in production
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Middleware
app.use(express.json());

// Socket.IO configuration
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/rooms', auth, require('./routes/rooms'));

// Socket handling
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('join room', (roomCode) => {
    socket.join(roomCode);
    console.log(`User joined room ${roomCode}`);
  });

  socket.on('chat message', (msg) => {
    io.to(msg.roomCode).emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Set port and start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// Basic error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// TODO: Implement more robust error handling
// TODO: Add input validation for socket events
// TODO: Implement authentication for socket connections