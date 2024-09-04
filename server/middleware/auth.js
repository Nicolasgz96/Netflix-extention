const jwt = require('jsonwebtoken');

// Authentication middleware
module.exports = function(req, res, next) {
  // Extract the token from the Authorization header
  const token = req.header('Authorization')?.split(' ')[1];

  // Check if token exists
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add the user from the payload to the request object
    req.user = decoded.user;
    next();
  } catch (err) {
    // If token is not valid, return error
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// TODO: Implement token refresh mechanism
// TODO: Add logging for authentication attempts
// TODO: Consider implementing role-based access control
// TODO: Handle expired tokens more gracefully
// TODO: Implement rate limiting for failed authentication attempts