const { supabaseAdmin } = require('../config/supabase');
const { success, created, error, notFound, forbidden, serverError } = require('../utils/response');
const { parsePagination } = require('../utils/pagination');
const { uploadMultipleToStorage } = require('../services/storage.service');

/**
 * POST /api/plants — create a new plant (NGO only)
 */
async function createPlant(req, res) {
  try {
    const { plant_name, species, description, latitude, longitude, address, planted_date, care_info } = req.body;

    // Upload images to Supabase Storage
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = await uploadMultipleToStorage('plant-images', req.files);
    }

    // Parse care_info if it's a string (from form-data)
    let parsedCareInfo = care_info;
    if (typeof care_info === 'string') {
      try { parsedCareInfo = JSON.parse(care_info); } catch { parsedCareInfo = null; }
    }

    const { data, error: dbError } = await supabaseAdmin
      .from('plants')
      .insert({
        ngo_id: req.user.id,
        plant_name,
        species: species || null,
        description: description || null,
        image_urls: imageUrls,
        location: `POINT(${longitude} ${latitude})`,
        address: address || null,
        planted_date: planted_date || new Date().toISOString().split('T')[0],
        care_info: parsedCareInfo || null,
      })
      .select()
      .single();

    if (dbError) {
      console.error('createPlant error:', dbError);
      return error(res, dbError.message, 400);
    }

    return created(res, data);
  } catch (err) {
    console.error('createPlant error:', err);
    return serverError(res);
  }
}

/**
 * GET /api/plants — list plants (paginated, filterable)
 */
async function listPlants(req, res) {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { status, ngo_id } = req.query;

    let query = supabaseAdmin
      .from('plants')
      .select('*, profiles!plants_ngo_id_fkey(username, display_name)', { count: 'exact' });

    if (status) query = query.eq('adoption_status', status);
    if (ngo_id) query = query.eq('ngo_id', ngo_id);

    const { data, error: dbError, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (dbError) return error(res, dbError.message, 400);

    return success(res, data, { page, limit, total: count });
  } catch (err) {
    console.error('listPlants error:', err);
    return serverError(res);
  }
}

/**
 * GET /api/plants/:id — get single plant details
 */
async function getPlant(req, res) {
  try {
    const { data, error: dbError } = await supabaseAdmin
      .from('plants')
      .select('*, profiles!plants_ngo_id_fkey(username, display_name, avatar_url)')
      .eq('id', req.params.id)
      .single();

    if (dbError || !data) return notFound(res, 'Plant not found');

    return success(res, data);
  } catch (err) {
    console.error('getPlant error:', err);
    return serverError(res);
  }
}

/**
 * PUT /api/plants/:id — update plant (NGO owner only)
 */
async function updatePlant(req, res) {
  try {
    const { plant_name, species, description, address, care_info } = req.body;

    // Verify ownership
    const { data: existing } = await supabaseAdmin
      .from('plants')
      .select('ngo_id')
      .eq('id', req.params.id)
      .single();

    if (!existing) return notFound(res, 'Plant not found');
    if (existing.ngo_id !== req.user.id) return forbidden(res, 'You can only edit your own plants');

    const updates = { updated_at: new Date().toISOString() };
    if (plant_name !== undefined) updates.plant_name = plant_name;
    if (species !== undefined) updates.species = species;
    if (description !== undefined) updates.description = description;
    if (address !== undefined) updates.address = address;
    if (care_info !== undefined) {
      updates.care_info = typeof care_info === 'string' ? JSON.parse(care_info) : care_info;
    }

    const { data, error: dbError } = await supabaseAdmin
      .from('plants')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (dbError) return error(res, dbError.message, 400);

    return success(res, data);
  } catch (err) {
    console.error('updatePlant error:', err);
    return serverError(res);
  }
}

/**
 * DELETE /api/plants/:id — delete plant (NGO owner, only if available)
 */
async function deletePlant(req, res) {
  try {
    const { data: existing } = await supabaseAdmin
      .from('plants')
      .select('ngo_id, adoption_status')
      .eq('id', req.params.id)
      .single();

    if (!existing) return notFound(res, 'Plant not found');
    if (existing.ngo_id !== req.user.id) return forbidden(res, 'You can only delete your own plants');
    if (existing.adoption_status !== 'available') {
      return error(res, 'Cannot delete a plant with pending or completed adoptions', 400);
    }

    await supabaseAdmin.from('plants').delete().eq('id', req.params.id);

    return success(res, { message: 'Plant deleted successfully' });
  } catch (err) {
    console.error('deletePlant error:', err);
    return serverError(res);
  }
}

/**
 * GET /api/plants/nearby — PostGIS radius search
 * Query: ?lat=19.07&lng=72.87&radius=10000 (meters, default 10km)
 */
async function nearbyPlants(req, res) {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = parseInt(req.query.radius, 10) || 10000;

    // Use PostGIS ST_DWithin for efficient radius search
    const { data, error: dbError } = await supabaseAdmin.rpc('nearby_plants', {
      user_lat: lat,
      user_lng: lng,
      radius_meters: radius,
    });

    if (dbError) {
      console.error('nearbyPlants RPC error:', dbError);
      return error(res, dbError.message, 400);
    }

    return success(res, data, { radius_meters: radius, total: data?.length || 0 });
  } catch (err) {
    console.error('nearbyPlants error:', err);
    return serverError(res);
  }
}

/**
 * GET /api/plants/map — all plants with location + status for map rendering
 */
async function mapPlants(req, res) {
  try {
    const { data, error: dbError } = await supabaseAdmin
      .from('plants')
      .select('id, plant_name, species, location, adoption_status, adopted_by, image_urls, ngo_id, profiles!plants_ngo_id_fkey(display_name)');

    if (dbError) return error(res, dbError.message, 400);

    return success(res, data);
  } catch (err) {
    console.error('mapPlants error:', err);
    return serverError(res);
  }
}

module.exports = { createPlant, listPlants, getPlant, updatePlant, deletePlant, nearbyPlants, mapPlants };
