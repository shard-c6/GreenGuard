const sanitizeHtml = require('sanitize-html');

/**
 * Recursively sanitizes string fields in an input object/array/value.
 * Plain objects, arrays, and string elements are processed, other values are left as-is.
 */
function sanitizeValue(val) {
  if (typeof val === 'string') {
    return sanitizeHtml(val, {
      allowedTags: [], // Strip all HTML tags to prevent XSS
      allowedAttributes: {},
    });
  }
  if (Array.isArray(val)) {
    return val.map(sanitizeValue);
  }
  if (typeof val === 'object' && val !== null) {
    if (Object.prototype.toString.call(val) === '[object Object]') {
      const cleaned = {};
      for (const key of Object.keys(val)) {
        cleaned[key] = sanitizeValue(val[key]);
      }
      return cleaned;
    }
  }
  return val;
}

function xssMiddleware(req, res, next) {
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  next();
}

module.exports = xssMiddleware;
