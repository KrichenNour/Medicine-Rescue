// controllers/medicineController.js
const medicineModel = require('../models/medicineModel');
const { Request } = require('../models/requestModel');

// Helper function to calculate pending quantity for a medicine
const getPendingQuantity = async (medicineId) => {
  const pendingRequests = await Request.find({
    medicine_id: medicineId,
    status: { $in: ['Pending', 'Approved'] } // Count both pending and approved (not yet delivered)
  });
  
  return pendingRequests.reduce((sum, req) => sum + (parseInt(req.quantity) || 0), 0);
};

// Helper to add available_quantity to medicine object
const addAvailableQuantity = async (medicine) => {
  const pendingQty = await getPendingQuantity(medicine._id);
  const available = Math.max(0, medicine.quantity - pendingQty);
  return {
    ...medicine.toObject(),
    available_quantity: available,
    pending_quantity: pendingQty
  };
};

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
    
    // Add available quantity info
    const itemWithAvailability = await addAvailableQuantity(item);
    res.json(itemWithAvailability);
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

    console.log('[DEBUG] Creating medicine. User ID:', req.user.id);
    // ✅ attach donor/ownerId automatically (real-life behavior)
    const created = await medicineModel.create({
      ...payload,
      donor: ownerId,
      ownerId: ownerId
    });
    console.log('[DEBUG] Medicine created with donor:', created.donor);
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
    const item = await medicineModel.getById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });

    // Check ownership
    if (item.donor && item.donor.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You are not authorized to delete this supply' });
    }

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
    
    // Add available quantity for each medicine
    const medicinesWithAvailability = await Promise.all(
      medicines.map(async (med) => await addAvailableQuantity(med))
    );
    
    res.json(medicinesWithAvailability);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Export getPendingQuantity for use in requestController
module.exports = {
  getAllMedicines,
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
  getLowStock,
  getPendingQuantity
};
