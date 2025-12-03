const pool = require('../db');
const bcrypt = require('bcryptjs');

const createUser = async ({ email, password, role }) => {
  const hashed = await bcrypt.hash(password, 10);
  const res = await pool.query(
    'INSERT INTO users (email, password, role) VALUES ($1,$2,$3) RETURNING id,email,role',
    [email, hashed, role]
  );
  return res.rows[0];
};

const getUserByEmail = async (email) => {
  const res = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
  return res.rows[0];
};

module.exports = { createUser, getUserByEmail };
