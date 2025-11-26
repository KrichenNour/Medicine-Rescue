const pool = require('../db');

const listAllByUser = async (userId) => {
  const res = await pool.query('SELECT * FROM requests WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
  return res.rows;
};

const createRequest = async ({ user_id, medicine_name, quantity }) => {
  const res = await pool.query(
    `INSERT INTO requests (user_id, medicine_name, quantity) VALUES ($1,$2,$3) RETURNING *`,
    [user_id, medicine_name, quantity]
  );
  return res.rows[0];
};

const updateRequestStatus = async (id, status) => {
  const res = await pool.query(
    `UPDATE requests SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, status]
  );
  return res.rows[0];
};

module.exports = { listAllByUser, createRequest, updateRequestStatus };
