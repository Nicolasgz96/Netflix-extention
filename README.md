# Netflix-extention

# Netflix Juntos

Netflix Juntos is a browser extension that allows users to watch Netflix content together in synchronized rooms.

## Features

- User authentication
- Create and join watch rooms
- Synchronized video playback
- Real-time chat (TODO)

## Prerequisites

Before you begin, ensure you have met the following requirements:
* You have installed Node.js and npm
* You have a MongoDB instance running
* You have a modern web browser (Chrome, Firefox, etc.)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com//Nicolasgz96/Netflix-extention.git
   ```
2. Navigate to the project directory:
   ```
   cd netflix-juntos
   ```
3. Install the dependencies:
   ```
   npm install
   ```
4. Create a `.env` file in the server directory and add the following:
   ```
   PORT=3000
   MONGODB_URI=mongodb://127.0.0.1:27017/netflix-juntos
   JWT_SECRET=your_very_long_and_secure_secret
   ```

## Usage

1. Start the server:
   ```
   npm run server
   ```
2. Load the extension in your browser (instructions for loading unpacked extensions vary by browser)

## Project Structure

netflix-juntos/
├── extension/
│ ├── background/
│ ├── content/
│ ├── popup/
│ └── manifest.json
├── server/
│ ├── config/
│ ├── middleware/
│ ├── models/
│ ├── routes/
│ ├── socket/
│ └── server.js
└── README.md


## TODO

The following items are needed to complete the functionality:

1. Implement the browser extension UI (popup.html, popup.js)
2. Create content scripts for Netflix integration
3. Implement real-time chat functionality
4. Add user profile management
5. Implement proper error handling and user feedback
6. Add comprehensive testing suite
7. Set up CI/CD pipeline
8. Create detailed API documentation
9. Implement security best practices (input validation, rate limiting, etc.)
10. Add logging and monitoring

## Contributing

Contributions to Netflix Juntos are welcome. Please adhere to this project's `code of conduct` during your participation.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
