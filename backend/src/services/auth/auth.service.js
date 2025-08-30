const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('apollo-server-express');

const generateTokens = (user) => {
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { token, refreshToken };
};

const verifyToken = (token) => {
  try {
    if (!token) throw new AuthenticationError('Authentication token must be provided');  
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    return decoded;
  } catch (err) {
    console.log(err);
    
    throw new AuthenticationError('Invalid/Expired token');
  }
};

const verifyRefreshToken = (token) => {
  try {
    if (!token) throw new AuthenticationError('Refresh token must be provided');
    
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    return decoded;
  } catch (err) {
    throw new AuthenticationError('Invalid/Expired refresh token');
  }
};

module.exports = {
  generateTokens,
  verifyToken,
  verifyRefreshToken,
};
