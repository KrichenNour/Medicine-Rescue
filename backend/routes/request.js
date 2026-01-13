const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/requestController');
const authenticate = require('../middleware/auth');

router.use(authenticate); // all routes need auth

router.get('/', ctrl.getMyRequests);       // GET /requests
router.get('/incoming', ctrl.getIncomingRequests); // GET /requests/incoming
router.post('/', ctrl.createRequest);     // POST /requests
router.put('/:id', ctrl.updateRequestStatus); // PUT /requests/:id

module.exports = router;
