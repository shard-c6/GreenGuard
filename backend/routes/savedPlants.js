const express = require('express');
const authMiddleware = require('../src/middleware/auth.middleware');
const { supabaseAdmin } = require('../src/config/supabase');
const { success, created, error, notFound, serverError } = require('../src/utils/response');

const router = express.Router();

router.use(authMiddleware);

/**
 * GET /api/saved-plants
 * Fetch all saved plants for the logged-in user
 */
router.get('/', async (req, res) => {
  try {
    const { data, error: dbError } = await supabaseAdmin
      .from('saved_plants')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (dbError) {
      return error(res, dbError.message, 400);
    }

    return success(res, data);
  } catch (err) {
    console.error('Fetch saved plants error:', err);
    return serverError(res);
  }
});

/**
 * POST /api/saved-plants
 * Save a new plant
 */
router.post('/', async (req, res) => {
  try {
    const { 
      common_name, 
      scientific_name, 
      confidence, 
      image_url, 
      ai_consultation, 
      plant_net_data, 
      notes 
    } = req.body;

    // Check if already saved (optional, but good for UX)
    const { data: existing } = await supabaseAdmin
      .from('saved_plants')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('scientific_name', scientific_name)
      .maybeSingle();

    if (existing) {
      return error(res, 'Already in your garden', 400, 'DUPLICATE_ENTRY');
    }

    const { data, error: dbError } = await supabaseAdmin
      .from('saved_plants')
      .insert({
        user_id: req.user.id,
        common_name,
        scientific_name,
        confidence,
        image_url,
        ai_consultation,
        plant_net_data,
        notes
      })
      .select()
      .single();

    if (dbError) {
      return error(res, dbError.message, 400);
    }

    return created(res, data);
  } catch (err) {
    console.error('Save plant error:', err);
    return serverError(res);
  }
});

/**
 * PATCH /api/saved-plants/:id
 * Update notes for a saved plant
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const { data, error: dbError } = await supabaseAdmin
      .from('saved_plants')
      .update({ notes, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .maybeSingle();

    if (dbError) {
      return error(res, dbError.message, 400);
    }

    if (!data) {
      return notFound(res, 'Saved plant not found');
    }

    return success(res, data);
  } catch (err) {
    console.error('Update saved plant error:', err);
    return serverError(res);
  }
});

/**
 * DELETE /api/saved-plants/:id
 * Delete a saved plant
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error: dbError } = await supabaseAdmin
      .from('saved_plants')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .maybeSingle();

    if (dbError) {
      return error(res, dbError.message, 400);
    }

    if (!data) {
      return notFound(res, 'Saved plant not found');
    }

    return success(res, { message: 'Plant removed from your garden' });
  } catch (err) {
    console.error('Delete saved plant error:', err);
    return serverError(res);
  }
});

module.exports = router;
