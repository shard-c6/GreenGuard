const env = require('../config/env');
const { success, error, serverError } = require('../utils/response');

/**
 * POST /api/ai/identify — forward plant image to n8n webhook for AI identification
 * Accepts multipart/form-data with a single image field 'image'
 */
async function identifyPlant(req, res) {
  try {
    if (!env.n8nWebhookUrl) {
      return error(res, 'AI identification service is not configured yet', 503, 'SERVICE_UNAVAILABLE');
    }

    if (!req.file) {
      return error(res, 'Image file is required', 400);
    }

    // Forward image to n8n webhook as form-data
    const formData = new FormData();
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    formData.append('image', blob, req.file.originalname);

    const response = await fetch(env.n8nWebhookUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('n8n webhook error:', text);
      return error(res, 'AI service returned an error', 502, 'BAD_GATEWAY');
    }

    const aiResult = await response.json();

    return success(res, {
      identification: aiResult,
      message: 'Plant identified successfully',
    });
  } catch (err) {
    console.error('identifyPlant error:', err);
    return serverError(res, 'AI identification service failed');
  }
}

/**
 * GET /api/ai/status — check if AI service is available
 */
async function aiStatus(req, res) {
  return success(res, {
    available: !!env.n8nWebhookUrl,
    message: env.n8nWebhookUrl
      ? 'AI identification service is online'
      : 'AI identification service is not configured yet',
  });
}

module.exports = { identifyPlant, aiStatus };
