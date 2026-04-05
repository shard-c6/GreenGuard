const { forbidden } = require('../utils/response');

/**
 * Role-based access control middleware.
 * Usage: requireRole('ngo'), requireRole('admin'), requireRole('ngo', 'admin')
 * Must be used AFTER authMiddleware.
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return forbidden(res, 'Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      return forbidden(res, `Access denied. Required role: ${roles.join(' or ')}`);
    }

    next();
  };
}

module.exports = requireRole;
