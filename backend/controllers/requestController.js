const requestModel = require('../models/requestModel');
const medicineModel = require('../models/medicineModel');

// Helper function to calculate pending quantity for a medicine
const getPendingQuantity = async (medicineId) => {
  const pendingRequests = await requestModel.Request.find({
    medicine_id: medicineId,
    status: { $in: ['Pending', 'Approved'] }
  });
  
  return pendingRequests.reduce((sum, req) => sum + (parseInt(req.quantity) || 0), 0);
};

const getMyRequests = async (req, res) => {
  try {
    const requests = await requestModel.listAllByUser(req.user.id);
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
};

const createRequest = async (req, res) => {
  try {
    const { medicine_id, medicine_name, quantity } = req.body;
    console.log('[DEBUG] Create request:', { medicine_id, medicine_name, requester_id: req.user.id });

    if (!medicine_id || !medicine_name || !quantity) return res.status(400).json({ error: 'Missing fields' });

    const requestedQty = parseInt(quantity) || 0;
    if (requestedQty <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than 0' });
    }

    // Check if user is the donor
    const medicine = await medicineModel.getById(medicine_id);
    if (!medicine) {
      console.log('[DEBUG] Medicine not found:', medicine_id);
      return res.status(404).json({ error: 'Medicine not found' });
    }

    console.log('[DEBUG] Medicine donor:', medicine.donor, 'Requester:', req.user.id);

    if (medicine.donor && medicine.donor.toString() === req.user.id) {
      console.log('[DEBUG] Blocked: Donor is requester');
      return res.status(403).json({ error: 'You cannot request your own medicine' });
    }

    // Check available quantity (total - pending requests)
    const pendingQty = await getPendingQuantity(medicine_id);
    const availableQty = medicine.quantity - pendingQty;

    console.log('[DEBUG] Stock check:', { 
      totalQty: medicine.quantity, 
      pendingQty, 
      availableQty, 
      requestedQty 
    });

    if (requestedQty > availableQty) {
      console.log('[DEBUG] Blocked: Insufficient stock');
      return res.status(400).json({ 
        error: `Insufficient stock. Only ${availableQty} ${medicine.quantity_unit || 'units'} available.`,
        available_quantity: availableQty
      });
    }

    const request = await requestModel.createRequest({
      user_id: req.user.id,
      medicine_id,
      medicine_name,
      quantity
    });

    console.log('[DEBUG] Request created successfully');
    res.status(201).json(request);
  } catch (err) {
    console.error('[DEBUG] Create request error:', err);
    res.status(500).json({ error: 'Failed to create request' });
  }
};

const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    // Get the request first
    const request = await requestModel.Request.findById(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Get the medicine to verify ownership
    const medicine = await medicineModel.getById(request.medicine_id);
    if (!medicine) {
      return res.status(404).json({ error: 'Medicine not found' });
    }

    // Check if user is the donor (only donor can approve/reject) or the requester (can cancel their own)
    const isDonor = medicine.donor && medicine.donor.toString() === req.user.id;
    const isRequester = request.user_id.toString() === req.user.id;

    if (!isDonor && !isRequester) {
      return res.status(403).json({ error: 'You are not authorized to update this request' });
    }

    // Requester can only cancel their own pending requests
    if (isRequester && !isDonor) {
      if (status !== 'Cancelled' || request.status !== 'Pending') {
        return res.status(403).json({ error: 'You can only cancel your own pending requests' });
      }
    }

    // If marking as Delivered, deduct from actual stock
    if (status === 'Delivered' && request.status === 'Approved') {
      const requestedQty = parseInt(request.quantity) || 0;
      const newQuantity = Math.max(0, medicine.quantity - requestedQty);
      
      await medicineModel.update(medicine._id, { quantity: newQuantity });
      console.log('[DEBUG] Stock deducted:', { 
        medicine: medicine.name, 
        previousQty: medicine.quantity, 
        deducted: requestedQty, 
        newQty: newQuantity 
      });
    }

    const updated = await requestModel.updateRequestStatus(id, status);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update request' });
  }
};

const getIncomingRequests = async (req, res) => {
  try {
    // Get all medicines where the logged-in user is the donor
    const myMedicines = await medicineModel.Medicine.find({ donor: req.user.id }).select('_id');
    const medicineIds = myMedicines.map(m => m._id);

    // Find all requests for these medicines
    const requests = await requestModel.Request.find({ medicine_id: { $in: medicineIds } })
      .populate('user_id', 'email')
      .populate('medicine_id', 'name image_url')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch incoming requests' });
  }
};

module.exports = { getMyRequests, createRequest, updateRequestStatus, getIncomingRequests };