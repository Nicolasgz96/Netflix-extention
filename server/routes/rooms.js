const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Room = require('../models/Room'); // Ensure this model exists

// Route to create a new room
router.post('/create', auth, async (req, res) => {
  try {
    const { videoId } = req.body;
    
    // Generate a unique code for the room
    // TODO: Implement a more robust unique code generation method
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Create a new room instance
    const room = new Room({
      code,
      videoId,
      creator: req.user.id
    });

    // Save the room to the database
    await room.save();

    console.log('Room created:', room); // For debugging

    // Send the room code back to the client
    res.json({ code: room.code });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ msg: 'Server error while creating room' });
  }
});

// TODO: Add more routes for room management
// - Get room details
// - Join existing room
// - Leave room
// - Delete room

module.exports = router;