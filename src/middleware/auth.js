const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const authenticate = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(403).json({ message: 'Token required' });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = decoded; 
    const requestedRole = req.headers['role']; // Role sent in the request header
      if (requestedRole && decoded.role !== requestedRole) {
        return res.status(403).json({ message: 'Role mismatch' });
      }
    next();
  });
};

const authorize = (...roles) => {
  return (req, res, next) => {
    const roleFromHeader = req.headers['role']; 
    if (!roles.includes(roleFromHeader)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
