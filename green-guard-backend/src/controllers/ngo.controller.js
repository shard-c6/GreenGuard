const { supabaseAdmin } = require('../config/supabase');
const { success, created, error, notFound, serverError } = require('../utils/response');

/**
 * POST /api/ngo/onboarding
 */
async function submitOnboarding(req, res) {
  try {
    const { org_name, registration_number, website, mission, address, onboarding_answers } = req.body;

    const { data, error: dbError } = await supabaseAdmin
      .from('ngo_profiles')
      .update({
        org_name,
        registration_number: registration_number || null,
        website: website || null,
        mission: mission || null,
        address: address || null,
        onboarding_answers: onboarding_answers || null,
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (dbError) return error(res, dbError.message, 400);

    // Also update display_name on profile
    if (org_name) {
      await supabaseAdmin
        .from('profiles')
        .update({ display_name: org_name })
        .eq('id', req.user.id);
    }

    return success(res, data);
  } catch (err) {
    console.error('submitOnboarding error:', err);
    return serverError(res);
  }
}

/**
 * GET /api/ngo/dashboard
 */
async function dashboard(req, res) {
  try {
    const ngoId = req.user.id;

    const [plantsResult, adoptionsResult, pendingResult] = await Promise.all([
      supabaseAdmin.from('plants').select('id', { count: 'exact', head: true }).eq('ngo_id', ngoId),
      supabaseAdmin.from('adoptions').select('id', { count: 'exact', head: true }).eq('ngo_id', ngoId).eq('status', 'approved'),
      supabaseAdmin.from('adoptions').select('id', { count: 'exact', head: true }).eq('ngo_id', ngoId).eq('status', 'pending'),
    ]);

    return success(res, {
      total_plants: plantsResult.count || 0,
      total_adopted: adoptionsResult.count || 0,
      pending_applications: pendingResult.count || 0,
    });
  } catch (err) {
    console.error('dashboard error:', err);
    return serverError(res);
  }
}

/**
 * GET /api/ngo/applications — list adoption applications for this NGO's plants
 */
async function listApplications(req, res) {
  try {
    const ngoId = req.user.id;
    const statusFilter = req.query.status;

    let query = supabaseAdmin
      .from('adoptions')
      .select(`
        *,
        plants!inner(plant_name, species, image_urls),
        profiles!adoptions_adopter_id_fkey(username, display_name, email, phone)
      `)
      .eq('ngo_id', ngoId);

    if (statusFilter) query = query.eq('status', statusFilter);

    const { data, error: dbError } = await query.order('created_at', { ascending: false });

    if (dbError) return error(res, dbError.message, 400);

    return success(res, data);
  } catch (err) {
    console.error('listApplications error:', err);
    return serverError(res);
  }
}

/**
 * GET /api/ngo/stats — data for planted/adopted graph
 */
async function ngoStats(req, res) {
  try {
    const ngoId = req.user.id;

    // Get all plants with their dates and adoption status
    const { data: plants, error: dbError } = await supabaseAdmin
      .from('plants')
      .select('planted_date, adoption_status, adopted_at')
      .eq('ngo_id', ngoId)
      .order('planted_date', { ascending: true });

    if (dbError) return error(res, dbError.message, 400);

    // Group by month
    const monthly = {};
    for (const plant of plants || []) {
      const month = plant.planted_date ? plant.planted_date.substring(0, 7) : 'unknown'; // YYYY-MM
      if (!monthly[month]) monthly[month] = { planted: 0, adopted: 0 };
      monthly[month].planted++;
      if (plant.adoption_status === 'adopted') monthly[month].adopted++;
    }

    const chartData = Object.entries(monthly).map(([month, counts]) => ({
      month,
      ...counts,
    }));

    return success(res, {
      chart: chartData,
      totals: {
        planted: plants?.length || 0,
        adopted: plants?.filter((p) => p.adoption_status === 'adopted').length || 0,
        available: plants?.filter((p) => p.adoption_status === 'available').length || 0,
      },
    });
  } catch (err) {
    console.error('ngoStats error:', err);
    return serverError(res);
  }
}

module.exports = { submitOnboarding, dashboard, listApplications, ngoStats };
