// controllers/medicineController.js
const medicineModel = require('../models/medicineModel');

const getAll = async (req, res) => {
  try {
    const rows = await medicineModel.listAll();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stock' });
  }
};

const getOne = async (req, res) => {
  try {
    const item = await medicineModel.getById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
};

const createOne = async (req, res) => {
  try {
    const payload = req.body;

    // ✅ get donor id from JWT middleware (authenticate)
    const ownerId = req.user?.id;
    if (!ownerId) {
      return res.status(401).json({ error: 'Unauthorized: missing user' });
    }

    // validate minimally
    if (!payload.name || payload.quantity === undefined) {
      return res.status(400).json({ error: 'name and quantity are required' });
    }

    // ✅ attach ownerId automatically (real-life behavior)
    const created = await medicineModel.create({
      ownerId,
      name: payload.name,
      description: payload.description,
      quantity: payload.quantity,
      quantity_unit: payload.quantity_unit,
      expiry_date: payload.expiry_date,
      distance_km: payload.distance_km,
      image_url: payload.image_url,
      category: payload.category,
    });

    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    console.log("AUTH HEADER:", req.headers.authorization);
console.log("REQ.USER:", req.user);

    res.status(500).json({ error: 'Failed to create item' });
  }
};

const updateOne = async (req, res) => {
  try {
    const fields = req.body;
    const updated = await medicineModel.update(req.params.id, fields);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update item' });
  }
};

const deleteOne = async (req, res) => {
  try {
    await medicineModel.remove(req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete item' });
  }
};

const getLowStock = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold, 10) || 5;
    const rows = await medicineModel.listLowStock(threshold);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch low stock' });
  }
};

const getAllMedicines = async (req, res) => {
  try {
    const medicines = await medicineModel.listAll();
    res.json(medicines);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getAllMedicines,
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
  getLowStock
};
