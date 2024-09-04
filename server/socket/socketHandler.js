// Import Room model
const Room = require('../models/Room');

// Export socket handler function
module.exports = (io) => {
  // Handle new socket connections
  io.on('connection', (socket) => {
    console.log('New client connected');

    // Handle join room event
    socket.on('joinRoom', async ({ roomCode, userId }) => {
      try {
        // Find the room in the database
        const room = await Room.findOne({ code: roomCode });
        if (room) {
          // Join the socket room
          socket.join(roomCode);
          // Notify other users in the room
          socket.to(roomCode).emit('userJoined', { userId });
          console.log(`User ${userId} joined room ${roomCode}`);
        }
        // TODO: Handle case when room is not found
      } catch (error) {
        console.error('Error joining room:', error);
        // TODO: Emit error event to client
      }
    });

    // Handle video state change event
    socket.on('videoStateChange', ({ roomCode, state }) => {
      // Broadcast video state update to all users in the room except sender
      socket.to(roomCode).emit('videoStateUpdate', state);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected');
      // TODO: Implement cleanup actions (e.g., remove user from room)
    });
  });

  // TODO: Implement error handling for socket events
  // TODO: Add authentication for socket connections
  // TODO: Implement rate limiting to prevent abuse
};