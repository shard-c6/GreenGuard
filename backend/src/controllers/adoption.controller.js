const { supabaseAdmin } = require('../config/supabase');
const { success, created, error, notFound, forbidden, serverError } = require('../utils/response');
const { notifyAdoptionResult, notifyNewApplication } = require('../services/notification.service');

/**
 * POST /api/adoptions/:plantId/apply — submit adoption application
 */
async function apply(req, res) {
  try {
    const { plantId } = req.params;
    const { answers } = req.body;

    // Verify plant exists and is available
    const { data: plant } = await supabaseAdmin
      .from('plants')
      .select('id, ngo_id, plant_name, adoption_status')
      .eq('id', plantId)
      .single();

    if (!plant) return notFound(res, 'Plant not found');
    if (plant.adoption_status !== 'available') {
      return error(res, 'This plant is no longer available for adoption', 400);
    }

    // Can't adopt own plant
    if (plant.ngo_id === req.user.id) {
      return error(res, 'You cannot adopt your own plant', 400);
    }

    // Check for existing application
    const { data: existing } = await supabaseAdmin
      .from('adoptions')
      .select('id')
      .eq('plant_id', plantId)
      .eq('adopter_id', req.user.id)
      .single();

    if (existing) {
      return error(res, 'You have already applied for this plant', 409, 'CONFLICT');
    }

    // Create application
    const { data, error: dbError } = await supabaseAdmin
      .from('adoptions')
      .insert({
        plant_id: plantId,
        adopter_id: req.user.id,
        ngo_id: plant.ngo_id,
        answers: answers || null,
      })
      .select()
      .single();

    if (dbError) return error(res, dbError.message, 400);

    // Update plant status to pending
    await supabaseAdmin
      .from('plants')
      .update({ adoption_status: 'pending' })
      .eq('id', plantId)
      .eq('adoption_status', 'available');

    // Notify NGO
    await notifyNewApplication({
      ngoId: plant.ngo_id,
      adopterName: req.user.displayName || req.user.username,
      plantName: plant.plant_name,
    });

    return created(res, data);
  } catch (err) {
    console.error('apply error:', err);
    return serverError(res);
  }
}

/**
 * GET /api/adoptions/my — adopter's applications
 */
async function myAdoptions(req, res) {
  try {
    const { data, error: dbError } = await supabaseAdmin
      .from('adoptions')
      .select(`
        *,
        plants!inner(plant_name, species, image_urls, location, address),
        profiles!adoptions_ngo_id_fkey(display_name, username)
      `)
      .eq('adopter_id', req.user.id)
      .order('created_at', { ascending: false });

    if (dbError) return error(res, dbError.message, 400);

    return success(res, data);
  } catch (err) {
    console.error('myAdoptions error:', err);
    return serverError(res);
  }
}

/**
 * GET /api/adoptions/:id — single application detail
 */
async function getAdoption(req, res) {
  try {
    const { data, error: dbError } = await supabaseAdmin
      .from('adoptions')
      .select(`
        *,
        plants!inner(plant_name, species, image_urls, location, address),
        profiles!adoptions_adopter_id_fkey(username, display_name, email, phone),
        profiles!adoptions_ngo_id_fkey(display_name, username)
      `)
      .eq('id', req.params.id)
      .single();

    if (dbError || !data) return notFound(res, 'Adoption application not found');

    // Only the adopter or the NGO owner can view
    if (data.adopter_id !== req.user.id && data.ngo_id !== req.user.id && req.user.role !== 'admin') {
      return forbidden(res);
    }

    return success(res, data);
  } catch (err) {
    console.error('getAdoption error:', err);
    return serverError(res);
  }
}

/**
 * PATCH /api/adoptions/:id/approve — NGO approves adoption
 */
async function approve(req, res) {
  try {
    const { data: application } = await supabaseAdmin
      .from('adoptions')
      .select('*, plants!inner(plant_name, ngo_id)')
      .eq('id', req.params.id)
      .eq('status', 'pending')
      .single();

    if (!application) return notFound(res, 'Application not found or not pending');
    if (application.ngo_id !== req.user.id) return forbidden(res, 'Only the plant owner can approve');

    // Approve this application
    await supabaseAdmin
      .from('adoptions')
      .update({ status: 'approved', reviewed_at: new Date().toISOString() })
      .eq('id', req.params.id);

    // Update plant status
    await supabaseAdmin
      .from('plants')
      .update({
        adoption_status: 'adopted',
        adopted_by: application.adopter_id,
        adopted_at: new Date().toISOString(),
      })
      .eq('id', application.plant_id);

    // Auto-reject all other pending applications for this plant
    await supabaseAdmin
      .from('adoptions')
      .update({ status: 'rejected', review_notes: 'Plant was adopted by another user', reviewed_at: new Date().toISOString() })
      .eq('plant_id', application.plant_id)
      .eq('status', 'pending')
      .neq('id', req.params.id);

    // Notify adopter
    await notifyAdoptionResult({
      adopterId: application.adopter_id,
      plantName: application.plants.plant_name,
      ngoName: req.user.displayName || req.user.username,
      status: 'approved',
    });

    return success(res, { id: req.params.id, status: 'approved' });
  } catch (err) {
    console.error('approve error:', err);
    return serverError(res);
  }
}

/**
 * PATCH /api/adoptions/:id/reject — NGO rejects adoption
 */
async function reject(req, res) {
  try {
    const { review_notes } = req.body;

    const { data: application } = await supabaseAdmin
      .from('adoptions')
      .select('*, plants!inner(plant_name, ngo_id)')
      .eq('id', req.params.id)
      .eq('status', 'pending')
      .single();

    if (!application) return notFound(res, 'Application not found or not pending');
    if (application.ngo_id !== req.user.id) return forbidden(res, 'Only the plant owner can reject');

    await supabaseAdmin
      .from('adoptions')
      .update({
        status: 'rejected',
        review_notes: review_notes || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', req.params.id);

    // Check if there are any other pending applications
    const { count } = await supabaseAdmin
      .from('adoptions')
      .select('id', { count: 'exact', head: true })
      .eq('plant_id', application.plant_id)
      .eq('status', 'pending');

    // If no more pending apps, revert plant to available
    if (!count || count === 0) {
      await supabaseAdmin
        .from('plants')
        .update({ adoption_status: 'available' })
        .eq('id', application.plant_id);
    }

    // Notify adopter
    await notifyAdoptionResult({
      adopterId: application.adopter_id,
      plantName: application.plants.plant_name,
      ngoName: req.user.displayName || req.user.username,
      status: 'rejected',
    });

    return success(res, { id: req.params.id, status: 'rejected' });
  } catch (err) {
    console.error('reject error:', err);
    return serverError(res);
  }
}

module.exports = { apply, myAdoptions, getAdoption, approve, reject };
