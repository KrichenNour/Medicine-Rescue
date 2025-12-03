const requestModel = require('../models/requestModel');

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
    const { medicine_name, quantity } = req.body;
    if (!medicine_name || !quantity) return res.status(400).json({ error: 'Missing fields' });

    const request = await requestModel.createRequest({
      user_id: req.user.id,
      medicine_name,
      quantity
    });

    res.status(201).json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create request' });
  }
};

const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    const updated = await requestModel.updateRequestStatus(id, status);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update request' });
  }
};

module.exports = { getMyRequests, createRequest, updateRequestStatus };
