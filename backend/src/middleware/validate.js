const { validationResult } = require('express-validator');
const { error } = require('../utils/response');

/**
 * Runs express-validator checks and returns 400 with error details if invalid.
 * Usage: router.post('/route', [...validators], validate, controller);
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => `${e.path}: ${e.msg}`);
    return error(res, messages.join('; '), 400, 'VALIDATION_ERROR');
  }
  next();
}

module.exports = validate;
