// src/routes/loteRoutes.js
const router = require('express').Router();
const ctrl   = require('../controllers/loteController');

router.get('/stock-total/:id_producto', ctrl.getStockTotal); // FUNCIÓN — antes que /:id
router.get('/',        ctrl.getAll);
router.get('/:id',     ctrl.getById);
router.post('/',       ctrl.create);    // PROCEDIMIENTO
router.put('/:id',     ctrl.update);
router.delete('/:id',  ctrl.remove);

module.exports = router;