const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/token');

async function register({ firstName, lastName, email, password }) {
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    const error = new Error('Email already registered');
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({ firstName, lastName, email, password });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return {
    user: user.toSafeJSON(),
    accessToken,
    refreshToken,
  };
}

async function login({ email, password }) {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return {
    user: user.toSafeJSON(),
    accessToken,
    refreshToken,
  };
}

async function refreshToken(token) {
  const decoded = verifyRefreshToken(token);
  const user = await User.findByPk(decoded.id);

  if (!user || !user.isActive) {
    const error = new Error('User not found');
    error.statusCode = 401;
    throw error;
  }

  const accessToken = generateAccessToken(user);
  return { accessToken };
}

async function getProfile(userId) {
  const user = await User.findByPk(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user.toSafeJSON();
}

module.exports = { register, login, refreshToken, getProfile };
