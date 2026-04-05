const express = require('express');
const router = express.Router();
const notification = require('../controllers/notification.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/', notification.listNotifications);
router.get('/unread-count', notification.unreadCount);
router.patch('/read-all', notification.markAllRead);
router.patch('/:id/read', notification.markRead);

module.exports = router;
