const { supabaseAdmin } = require('../config/supabase');
const { success, created, error, notFound, forbidden, serverError } = require('../utils/response');
const { uploadMultipleToStorage } = require('../services/storage.service');

/**
 * POST /api/reports — submit a growth report for an adopted plant
 */
async function createReport(req, res) {
  try {
    const { plant_id, health_status, height_cm, notes } = req.body;

    // Verify the plant is adopted by this user
    const { data: plant } = await supabaseAdmin
      .from('plants')
      .select('id, adopted_by, plant_name')
      .eq('id', plant_id)
      .single();

    if (!plant) return notFound(res, 'Plant not found');
    if (plant.adopted_by !== req.user.id) {
      return forbidden(res, 'You can only report on plants you have adopted');
    }

    let photoUrls = [];
    if (req.files && req.files.length > 0) {
      photoUrls = await uploadMultipleToStorage('report-images', req.files);
    }

    const { data, error: dbError } = await supabaseAdmin
      .from('growth_reports')
      .insert({
        plant_id,
        adopter_id: req.user.id,
        health_status: health_status || 'healthy',
        height_cm: height_cm ? parseFloat(height_cm) : null,
        notes: notes || null,
        photo_urls: photoUrls,
      })
      .select()
      .single();

    if (dbError) return error(res, dbError.message, 400);

    return created(res, data);
  } catch (err) {
    console.error('createReport error:', err);
    return serverError(res);
  }
}

/**
 * GET /api/reports/plant/:plantId — all reports for a plant
 */
async function plantReports(req, res) {
  try {
    const { data, error: dbError } = await supabaseAdmin
      .from('growth_reports')
      .select('*, profiles!inner(username, display_name)')
      .eq('plant_id', req.params.plantId)
      .order('created_at', { ascending: false });

    if (dbError) return error(res, dbError.message, 400);

    return success(res, data);
  } catch (err) {
    console.error('plantReports error:', err);
    return serverError(res);
  }
}

/**
 * GET /api/reports/my — all reports by current user
 */
async function myReports(req, res) {
  try {
    const { data, error: dbError } = await supabaseAdmin
      .from('growth_reports')
      .select('*, plants!inner(plant_name, species)')
      .eq('adopter_id', req.user.id)
      .order('created_at', { ascending: false });

    if (dbError) return error(res, dbError.message, 400);

    return success(res, data);
  } catch (err) {
    console.error('myReports error:', err);
    return serverError(res);
  }
}

module.exports = { createReport, plantReports, myReports };
