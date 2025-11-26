const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/medicineController');

router.get('/', ctrl.getAllMedicines);        // GET /stock
router.get('/low', ctrl.getLowStock);         // GET /stock/low
router.get('/:id', ctrl.getOne);              // GET /stock/:id
router.post('/', ctrl.createOne);             // POST /stock
router.put('/:id', ctrl.updateOne);           // PUT /stock/:id
router.delete('/:id', ctrl.deleteOne);        // DELETE /stock/:id

module.exports = router;
