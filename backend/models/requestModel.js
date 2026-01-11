const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medicine_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true
  },
  medicine_name: {
    type: String,
    required: true
  },
  quantity: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'Pending',
    enum: ['Pending', 'Approved', 'Delivered', 'Cancelled']
  }
}, {
  timestamps: true
});

const Request = mongoose.model('Request', requestSchema);

const listAllByUser = async (userId) => {
  return await Request.find({ user_id: userId }).sort({ createdAt: -1 });
};

const createRequest = async ({ user_id, medicine_id, medicine_name, quantity }) => {
  const request = await Request.create({
    user_id,
    medicine_id,
    medicine_name,
    quantity
  });
  return request;
};

const updateRequestStatus = async (id, status) => {
  const request = await Request.findByIdAndUpdate(
    id,
    { $set: { status } },
    { new: true }
  );
  return request;
};

module.exports = { listAllByUser, createRequest, updateRequestStatus, Request };
