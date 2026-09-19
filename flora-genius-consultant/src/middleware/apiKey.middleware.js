/**
 * API Key Verification Middleware
 * Validates the x-api-key header against the configured
 * FLORA_CONSULTANT_API_KEY environment variable.
 */

const crypto = require('crypto');

const expectedApiKey = process.env.FLORA_CONSULTANT_API_KEY;

// Validate configuration at module load / application boot.
if (!expectedApiKey && process.env.NODE_ENV === 'production') {
  throw new Error(
    'FATAL: FLORA_CONSULTANT_API_KEY is not configured in production'
  );
}

if (!expectedApiKey) {
  console.warn(
    '⚠️ Warning: FLORA_CONSULTANT_API_KEY is not configured. ' +
    'API key validation will reject requests.'
  );
}

function apiKeyMiddleware(req, res, next) {
  const receivedApiKey = req.headers['x-api-key'];

  // Reject when the API key is missing or not configured.
  if (!expectedApiKey || !receivedApiKey) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    console.warn(
      `[API KEY FAILURE] Blocked request from IP ${ip} to ` +
      `${req.method} ${req.path} - Invalid or missing x-api-key`
    );

    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Invalid or missing API Key'
      }
    });
  }

  const receivedBuffer = Buffer.from(receivedApiKey);
  const expectedBuffer = Buffer.from(expectedApiKey);

  // timingSafeEqual requires buffers of the same length.
  const keysMatch =
    receivedBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(receivedBuffer, expectedBuffer);

  if (!keysMatch) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    console.warn(
      `[API KEY FAILURE] Blocked request from IP ${ip} to ` +
      `${req.method} ${req.path} - Invalid x-api-key`
    );

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
