const express = require('express');
const router = express.Router();
const ai = require('../controllers/ai.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { aiLimiter } = require('../middleware/rateLimiter');
const upload = require('../middleware/upload');

router.use(authMiddleware);

router.post('/identify', aiLimiter, upload.single('image'), ai.identifyPlant);
router.get('/status', ai.aiStatus);

module.exports = router;
