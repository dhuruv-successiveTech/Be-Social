const bcrypt = require('bcryptjs');
const { UserInputError } = require('apollo-server-express');
const User = require('../../models/user/user');
const { generateTokens } = require('../../services/auth/auth');

const authController = {
  async register(username, email, password, name, avatar = null) { // Added avatar parameter
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      throw new UserInputError('Username or email already taken');
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      name,
      avatar, // Save avatar URL
    });

    // Generate tokens
    const { token, refreshToken } = generateTokens(user);

    return {
      user,
      token,
      refreshToken,
    };
  },

  async login(email, password) {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new UserInputError('Invalid credentials');
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      throw new UserInputError('Invalid credentials');
    }

    // Generate tokens
    const { token, refreshToken } = generateTokens(user);

    return {
      user,
      token,
      refreshToken,
    };
  },

  async refreshToken(token) {
    // Verify refresh token and generate new tokens
    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    const tokens = generateTokens(user);

    return {
      user,
      ...tokens,
    };
  },
};

module.exports = authController;