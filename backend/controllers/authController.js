const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createUser, getUserByEmail } = require('../models/userModel');

const signup = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) return res.status(400).json({ error: 'All fields required' });

    const existing = await getUserByEmail(email);
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const user = await createUser({ email, password, role });

    const token = jwt.sign({ id: user.id, email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ token, user: { id: user.id, email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'All fields required' });

    const user = await getUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const userId = user._id || user.id;
    const token = jwt.sign({ id: userId, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: userId, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { signup, login };
