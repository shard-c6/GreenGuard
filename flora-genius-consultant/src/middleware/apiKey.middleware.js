/**
 * API Key Verification Middleware
 * Validates the x-api-key header against the configured FLORA_CONSULTANT_API_KEY env variable.
 * Fallback to warning log if env variable is not set (developer convenience).
 */
function apiKeyMiddleware(req, res, next) {
  const expectedApiKey = process.env.FLORA_CONSULTANT_API_KEY;

  // If the secret is not configured in the environment, log a warning but bypass validation
  if (!expectedApiKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️ Warning: FLORA_CONSULTANT_API_KEY is not defined in the environment. Bypassing API key validation.');
    }
    return next();
  }

  const receivedApiKey = req.headers['x-api-key'];

  if (!receivedApiKey || receivedApiKey !== expectedApiKey) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.warn(`[API KEY FAILURE] Blocked request from IP ${ip} to ${req.method} ${req.path} - Invalid or missing x-api-key`);
    
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Invalid or missing API Key'
      }
    });
  }

  next();
}

module.exports = apiKeyMiddleware;
