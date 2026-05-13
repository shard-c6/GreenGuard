const express = require('express');
const authMiddleware = require('../src/middleware/auth.middleware');
const { supabaseAdmin } = require('../src/config/supabase');
const env = require('../src/config/env');
const { success, error, notFound, serverError } = require('../src/utils/response');

const router = express.Router();

const DAY_MS = 86400000;

/** Start of UTC calendar day for `d` */
function utcDayStartMs(d) {
  const x = new Date(d);
  return Date.UTC(x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate());
}

function daysBetweenUtcLaterAndEarlier(laterMs, earlierMs) {
  return Math.floor((laterMs - earlierMs) / DAY_MS);
}

/**
 * Next due instant: calendar day of last care + interval days (UTC).
 * Overdue when today's UTC day start is strictly after due day's start.
 */
function computeDueDayStartMs(lastCareIso, intervalDays, fallbackIso) {
  const base = lastCareIso || fallbackIso;
  if (!base) return null;
  const lastMs = utcDayStartMs(new Date(base));
  return lastMs + intervalDays * DAY_MS;
}

function defaultWateringInterval(row) {
  const v = row?.plants?.watering_interval_days;
  return typeof v === 'number' && v > 0 ? v : 7;
}

function defaultFertilizingInterval(row) {
  const v = row?.plants?.fertilization_interval_days;
  return typeof v === 'number' && v > 0 ? v : 30;
}

function evaluateCareDue(lastCareIso, intervalDays, fallbackIso, todayStartMs) {
  const dueDayStart = computeDueDayStartMs(lastCareIso, intervalDays, fallbackIso);
  if (dueDayStart === null) return { overdue: false, daysOverdue: 0 };
  if (todayStartMs <= dueDayStart) return { overdue: false, daysOverdue: 0 };
  return {
    overdue: true,
    daysOverdue: daysBetweenUtcLaterAndEarlier(todayStartMs, dueDayStart),
  };
}

/**
 * Same idea as flora-genius-consultant (Gemini Flash), via REST so no extra npm deps.
 * Model: gemini-1.5-flash
 */
async function generateCareTip(plantName, careType, daysOverdue) {
  const label = careType === 'watering' ? 'watering' : 'fertilizing';
  const fallback =
    label === 'watering'
      ? `Give ${plantName} a thorough soak until water drains, then let the top inch dry before watering again.`
      : `Apply a balanced liquid fertilizer at half strength for ${plantName}, then water lightly to distribute nutrients.`;

  const prompt = `You help plant caretakers. Plant: "${plantName}". Care task: ${label}. Days overdue: ${daysOverdue}.
Write exactly 1–2 short sentences with one concrete, safe action the owner can do today. No markdown, no bullet symbols, plain text only.`;

  if (!env.geminiApiKey) {
    return fallback;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(env.geminiApiKey)}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini HTTP error:', response.status, errText);
      throw new Error('Gemini request failed');
    }

    const json = await response.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return text || `Check ${plantName}'s soil and adjust ${label} on a steady schedule.`;
  } catch (e) {
    console.error('Gemini care tip error:', e);
    return label === 'watering'
      ? `Water ${plantName} deeply and ensure drainage; adjust frequency if the soil stays soggy.`
      : `Fertilize ${plantName} lightly on schedule and flush salts occasionally with plain water.`;
  }
}

router.use(authMiddleware);

/**
 * GET /generate — proactive smart alerts for overdue care
 */
router.get('/generate', async (req, res) => {
  try {
    const userId = req.user.id;
    const todayStartMs = utcDayStartMs(new Date());

    const { data: rows, error: dbError } = await supabaseAdmin
      .from('user_plants')
      .select(`
        id,
        plant_id,
        last_watered_at,
        last_fertilized_at,
        created_at,
        plants (
          id,
          plant_name,
          watering_interval_days,
          fertilization_interval_days
        )
      `)
      .eq('user_id', userId);

    if (dbError) {
      console.error('user_plants fetch:', dbError);
      return error(res, dbError.message, 400);
    }

    const overdueTasks = [];

    for (const row of rows || []) {
      const plantName = row.plants?.plant_name || 'Your plant';
      const wi = defaultWateringInterval(row);
      const fi = defaultFertilizingInterval(row);

      const water = evaluateCareDue(row.last_watered_at, wi, row.created_at, todayStartMs);
      if (water.overdue) {
        overdueTasks.push({
          kind: 'watering',
          plantId: row.plant_id,
          userPlantId: row.id,
          plantName,
          daysOverdue: water.daysOverdue,
        });
      }

      const fert = evaluateCareDue(row.last_fertilized_at, fi, row.created_at, todayStartMs);
      if (fert.overdue) {
        overdueTasks.push({
          kind: 'fertilizing',
          plantId: row.plant_id,
          userPlantId: row.id,
          plantName,
          daysOverdue: fert.daysOverdue,
        });
      }
    }

    const alerts = await Promise.all(
      overdueTasks.map(async (t) => {
        const careType = t.kind === 'watering' ? 'watering' : 'fertilizing';
        const urgency = t.daysOverdue >= 7 ? 'high' : 'medium';
        const tip = await generateCareTip(t.plantName, careType, t.daysOverdue);
        return {
          id: `${t.plantId}_${careType}`,
          plantId: t.plantId,
          plantName: t.plantName,
          careType,
          tip,
          urgency,
          daysOverdue: t.daysOverdue,
        };
      }),
    );

    return success(res, { alerts });
  } catch (err) {
    console.error('generate notifications error:', err);
    return serverError(res);
  }
});

/**
 * PATCH /dismiss/:plantId — mark watering or fertilizing done (updates timestamps)
 */
router.patch('/dismiss/:plantId', async (req, res) => {
  try {
    const { plantId } = req.params;
    const careType = req.body?.careType;
    if (careType !== 'watering' && careType !== 'fertilizing') {
      return error(res, 'careType must be "watering" or "fertilizing"', 400);
    }

    const nowIso = new Date().toISOString();
    const patch =
      careType === 'watering'
        ? { last_watered_at: nowIso, updated_at: nowIso }
        : { last_fertilized_at: nowIso, updated_at: nowIso };

    const { data, error: upError } = await supabaseAdmin
      .from('user_plants')
      .update(patch)
      .eq('user_id', req.user.id)
      .eq('plant_id', plantId)
      .select('id')
      .maybeSingle();

    if (upError) {
      console.error('user_plants dismiss:', upError);
      return error(res, upError.message, 400);
    }

    if (!data) {
      return notFound(res, 'Plant not found in your garden');
    }

    return success(res, { plant_id: plantId, careType, updated_at: nowIso });
  } catch (err) {
    console.error('dismiss notification error:', err);
    return serverError(res);
  }
});

module.exports = router;
