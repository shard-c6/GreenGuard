const { serverError } = require('../utils/response');

/**
 * Global error handler — catches unhandled errors from controllers.
 * Must be registered LAST in Express middleware chain.
 */
function errorHandler(err, req, res, _next) {
  console.error('🔥 Unhandled error:', err);

  // Multer file size errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      error: { code: 'FILE_TOO_LARGE', message: 'File size exceeds the maximum limit.' },
    });
  }

  // Multer unexpected field errors
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      error: { code: 'UNEXPECTED_FILE', message: 'Unexpected file field in upload.' },
    });
  }

  const message = process.env.NODE_ENV === 'development' ? err.message : 'Internal server error';
  return serverError(res, message);
}

module.exports = errorHandler;
