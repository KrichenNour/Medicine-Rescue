// models/medicineModel.js
const pool = require('../db');

const listAll = async () => {
  const res = await pool.query('SELECT * FROM medicine ORDER BY name');
  return res.rows;
};

const getById = async (id) => {
  const res = await pool.query('SELECT * FROM medicine WHERE id = $1', [id]);
  return res.rows[0];
};

const create = async ({ name, description, quantity, quantity_unit, expiry_date, distance_km, image_url, category }) => {
  const res = await pool.query(
    `INSERT INTO medicine
     (name, description, quantity, quantity_unit, expiry_date, distance_km, image_url, category)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [name, description, quantity, quantity_unit, expiry_date, distance_km, image_url, category]
  );
  return res.rows[0];
};

const update = async (id, fields) => {
  // Build dynamic update
  const keys = Object.keys(fields);
  if (keys.length === 0) return getById(id);

  const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
  const values = [id, ...keys.map(k => fields[k])];

  const res = await pool.query(
    `UPDATE medicine SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    values
  );

  return res.rows[0];
};

const remove = async (id) => {
  await pool.query('DELETE FROM medicine WHERE id = $1', [id]);
  return;
};

const listLowStock = async (threshold = 5) => {
  const res = await pool.query('SELECT * FROM medicine WHERE quantity <= $1 ORDER BY quantity ASC', [threshold]);
  return res.rows;
};

module.exports = {
  listAll,
  getById,
  create,
  update,
  remove,
  listLowStock
};
