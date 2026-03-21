const express = require('express');
const router = express.Router();
const auth = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require('../validators/auth.validator');

// Public routes (rate-limited)
router.post('/register', authLimiter, registerValidator, validate, auth.register);
router.post('/login', authLimiter, loginValidator, validate, auth.login);
router.post('/forgot-password', authLimiter, forgotPasswordValidator, validate, auth.forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordValidator, validate, auth.resetPassword);

// Protected routes
router.get('/me', authMiddleware, auth.getMe);
router.put('/me', authMiddleware, updateProfileValidator, validate, auth.updateMe);
router.post('/logout', authMiddleware, auth.logout);

module.exports = router;
