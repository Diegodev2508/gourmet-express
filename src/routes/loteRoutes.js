// src/routes/loteRoutes.js
const router = require('express').Router();
const ctrl   = require('../controllers/loteController');

router.get('/proximos-vencer', ctrl.proximosVencer); // antes que /:id
router.get('/',                ctrl.getAll);
router.get('/:id',             ctrl.getById);
router.post('/',               ctrl.create);
router.put('/:id',             ctrl.update);
router.delete('/:id',          ctrl.remove);

module.exports = router;
