const express = require('express');
const router = express.Router();
const ngo = require('../controllers/ngo.controller');
const authMiddleware = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

// All NGO routes require auth + ngo role
router.use(authMiddleware, requireRole('ngo'));

router.post('/onboarding', ngo.submitOnboarding);
router.get('/dashboard', ngo.dashboard);
router.get('/applications', ngo.listApplications);
router.get('/stats', ngo.ngoStats);

module.exports = router;
