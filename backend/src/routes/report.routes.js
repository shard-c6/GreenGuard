const express = require('express');
const router = express.Router();
const report = require('../controllers/report.controller');
const authMiddleware = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const upload = require('../middleware/upload');

router.use(authMiddleware);

router.post('/', requireRole('adopter'), upload.array('photos', 3), report.createReport);
router.get('/my', requireRole('adopter'), report.myReports);
router.get('/plant/:plantId', report.plantReports);

module.exports = router;
