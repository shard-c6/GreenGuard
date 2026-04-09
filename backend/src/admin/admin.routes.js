const express = require('express');
const router = express.Router();
const admin = require('./admin.controller');
const authMiddleware = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

// All admin routes require auth + admin role
router.use(authMiddleware, requireRole('admin'));

router.get('/ngos', admin.listNgos);
router.patch('/ngos/:ngoId/approve', admin.approveNgo);
router.patch('/ngos/:ngoId/reject', admin.rejectNgo);
router.get('/users', admin.listUsers);
router.patch('/users/:userId/ban', admin.banUser);
router.patch('/users/:userId/unban', admin.unbanUser);
router.get('/reports', admin.listReports);
router.patch('/reports/:reportId/resolve', admin.resolveReport);
router.get('/stats', admin.platformStats);
router.get('/dashboard', admin.getDashboard);

module.exports = router;
