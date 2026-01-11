// models/medicineModel.js
const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  quantity: {
    type: Number,
    required: true,
    default: 0
  },
  quantity_unit: {
    type: String
  },
  expiry_date: {
    type: Date
  },
  distance_km: {
    type: Number
  },
  latitude: {
    type: Number
  },
  longitude: {
    type: Number
  },
  image_url: {
    type: String
  },
  category: {
    type: String
  },
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const Medicine = mongoose.model('Medicine', medicineSchema);

const listAll = async () => {
  return await Medicine.find().sort({ name: 1 });
};

const getById = async (id) => {
  return await Medicine.findById(id);
};

const create = async ({ name, description, quantity, quantity_unit, expiry_date, distance_km, latitude, longitude, image_url, category, donor }) => {
  const medicine = await Medicine.create({
    name,
    description,
    quantity,
    quantity_unit,
    expiry_date,
    distance_km,
    latitude,
    longitude,
    image_url,
    category,
    donor
  });
  return medicine;
};

const update = async (id, fields) => {
  if (Object.keys(fields).length === 0) return getById(id);

  const medicine = await Medicine.findByIdAndUpdate(
    id,
    { $set: fields },
    { new: true, runValidators: true }
  );

  return medicine;
};

const remove = async (id) => {
  await Medicine.findByIdAndDelete(id);
  return;
};

const listLowStock = async (threshold = 5) => {
  return await Medicine.find({ quantity: { $lte: threshold } }).sort({ quantity: 1 });
};

module.exports = {
  listAll,
  getById,
  create,
  update,
  remove,
  listLowStock,
  Medicine
};
