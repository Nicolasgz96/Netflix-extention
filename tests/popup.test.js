// Import Jest globals for testing
import { jest } from '@jest/globals';

// Import the function we want to test
import { connectSocket } from '../extension/popup/popup.js';

// Describe block for popup functionality tests
describe('Popup functionality', () => {
  // Test case: check if connectSocket emits 'join room' event
  test('connectSocket emits join room event', () => {
    // Create a mock socket object with jest mock functions
    const mockSocket = {
      on: jest.fn(),
      emit: jest.fn()
    };

    // Mock the global io function to return our mockSocket
    global.io = jest.fn(() => mockSocket);

    // Call the function we're testing with fake data
    connectSocket('fakeToken', 'fakeRoomCode');

    // Assert that the emit function was called with correct arguments
    expect(mockSocket.emit).toHaveBeenCalledWith('join room', 'fakeRoomCode');
  });
});

// TODO: Add more test cases to cover different scenarios
// For example:
// - Test error handling
// - Test with different input parameters
// - Test socket 'on' event listeners if any