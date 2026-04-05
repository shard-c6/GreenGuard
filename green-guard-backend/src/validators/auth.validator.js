const { body } = require('express-validator');

const registerValidator = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('username')
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_$]+$/)
    .withMessage('Username must be 3-30 chars, alphanumeric, underscores, or $'),
  body('display_name').optional().isLength({ max: 100 }),
  body('role').isIn(['ngo', 'adopter']).withMessage('Role must be "ngo" or "adopter"'),
  body('phone').optional().isMobilePhone('any'),
];

const loginValidator = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const updateProfileValidator = [
  body('display_name').optional().isLength({ max: 100 }),
  body('bio').optional().isLength({ max: 500 }),
  body('phone').optional().isMobilePhone('any'),
  body('address').optional().isLength({ max: 255 }),
];

const forgotPasswordValidator = [
  body('email').isEmail().withMessage('Valid email is required'),
];

const resetPasswordValidator = [
  body('new_password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

module.exports = {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
};
