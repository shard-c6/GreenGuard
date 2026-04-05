const express = require('express');
const router = express.Router();
const adoption = require('../controllers/adoption.controller');
const authMiddleware = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

router.use(authMiddleware);

// Adopter routes
router.post('/:plantId/apply', requireRole('adopter'), adoption.apply);
router.get('/my', requireRole('adopter'), adoption.myAdoptions);

// Shared routes
router.get('/:id', adoption.getAdoption);

// NGO routes
router.patch('/:id/approve', requireRole('ngo'), adoption.approve);
router.patch('/:id/reject', requireRole('ngo'), adoption.reject);

module.exports = router;
