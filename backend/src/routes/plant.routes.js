const express = require('express');
const router = express.Router();
const plant = require('../controllers/plant.controller');
const authMiddleware = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const { createPlantValidator, updatePlantValidator, nearbyQueryValidator } = require('../validators/plant.validator');

// All plant routes require auth
router.use(authMiddleware);

// Geo routes (must come before /:id to avoid route conflicts)
router.get('/nearby', nearbyQueryValidator, validate, plant.nearbyPlants);
router.get('/map', plant.mapPlants);

// CRUD
router.post('/', requireRole('ngo'), upload.array('images', 3), createPlantValidator, validate, plant.createPlant);
router.get('/', plant.listPlants);
router.get('/:id', plant.getPlant);
router.put('/:id', requireRole('ngo'), updatePlantValidator, validate, plant.updatePlant);
router.delete('/:id', requireRole('ngo'), plant.deletePlant);

module.exports = router;
