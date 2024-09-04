const mongoose = require('mongoose');

// Define the Room schema
const RoomSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
    // TODO: Consider adding a custom validator for the room code format
  },
  videoId: {
    type: String,
    required: true
    // TODO: Add validation for Netflix video ID format
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
  // TODO: Consider adding fields for active users, chat history, etc.
});

// Export the Room model
module.exports = mongoose.model('Room', RoomSchema);

// TODO: Add methods for room management (e.g., addUser, removeUser)
// TODO: Implement a method to check if the room is empty
// TODO: Add an index on the 'code' field for faster queries
// TODO: Consider adding a TTL (Time To Live) index for automatic room deletion after inactivity