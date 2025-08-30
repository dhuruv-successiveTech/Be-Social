const jwt = require('jsonwebtoken');
const User = require('../models/user/user.model');

const authMiddleware = async (req) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new Error('No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    throw new Error('Not authorized');
  }
};

const adminMiddleware = async (req) => {
  const user = await authMiddleware(req);
  
  if (user.role !== 'admin') {
    throw new Error('Not authorized as admin');
  }
  
  return user;
};

module.exports = { authMiddleware, adminMiddleware };
