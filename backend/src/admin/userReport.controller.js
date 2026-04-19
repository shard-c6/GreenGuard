const { supabaseAdmin } = require('../config/supabase');
const { success, created, error, serverError } = require('../utils/response');

/**
 * POST /api/user-reports — submit a report about a user
 */
async function createReport(req, res) {
  try {
    const { reported_user_id, reason, description } = req.body;

    if (!reported_user_id || !reason) {
      return error(res, 'reported_user_id and reason are required', 400);
    }

    if (reported_user_id === req.user.id) {
      return error(res, 'You cannot report yourself', 400);
    }

    // Verify reported user exists
    const { data: reportedUser } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', reported_user_id)
      .single();

    if (!reportedUser) {
      return error(res, 'Reported user not found', 404);
    }

    const { data, error: dbError } = await supabaseAdmin
      .from('user_reports')
      .insert({
        reporter_id: req.user.id,
        reported_user_id,
        reason,
        description: description || null,
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

module.exports = { createReport };
