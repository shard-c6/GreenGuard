const env = require('../config/env');
const { supabaseAdmin } = require('../config/supabase');
const { uploadToStorage } = require('../services/storage.service');
const { success, error, serverError } = require('../utils/response');

const AI_SCAN_BUCKET = 'flora-scans';

async function ensureAiScanBucket() {
  const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();
  if (bucketsError) {
    throw new Error(`Failed to inspect storage buckets: ${bucketsError.message}`);
  }

  if (buckets.some((bucket) => bucket.id === AI_SCAN_BUCKET)) {
    return;
  }

  const { error: createError } = await supabaseAdmin.storage.createBucket(AI_SCAN_BUCKET, {
    public: true,
    fileSizeLimit: env.maxFileSizeMb * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  });

  if (createError) {
    throw new Error(`Failed to create ${AI_SCAN_BUCKET} bucket: ${createError.message}`);
  }
}

/**
 * POST /api/ai/identify — upload an image to storage and forward the public URL
 * (or a text query) to the shared n8n plant-detect workflow.
 */
async function identifyPlant(req, res) {
  try {
    if (!env.n8nWebhookUrl) {
      return error(res, 'AI identification service is not configured yet', 503, 'SERVICE_UNAVAILABLE');
    }

    const type = req.body?.type === 'text' ? 'text' : 'image';
    let payload;

    if (type === 'image') {
      if (!req.file) {
        return error(res, 'Image file is required', 400);
      }

      await ensureAiScanBucket();

      const imageUrl = await uploadToStorage(
        AI_SCAN_BUCKET,
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
      );

      payload = {
        type: 'image',
        input: imageUrl,
      };
    } else {
      const input = typeof req.body?.input === 'string' ? req.body.input.trim() : '';
      if (input.length < 2) {
        return error(res, 'Plant name is required', 400);
      }

      payload = {
        type: 'text',
        input,
      };
    }

    const response = await fetch(env.n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
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
