const express = require('express');
const router = express.Router();
const userReport = require('./userReport.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Any authenticated user can submit a report
router.use(authMiddleware);

router.post('/', userReport.createReport);

module.exports = router;
