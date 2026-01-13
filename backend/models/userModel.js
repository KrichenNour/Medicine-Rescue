const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

const createUser = async ({ email, password, name }) => {
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    email,
    password: hashed,
    name: name || null
  });
  return {
    id: user._id,
    email: user.email,
    name: user.name
  };
};

const getUserByEmail = async (email) => {
  const user = await User.findOne({ email });
  return user;
};

module.exports = { createUser, getUserByEmail, User };