const { supabaseServiceRole: supabaseAdmin } = require('../config/supabase');
const { success, error, notFound, serverError } = require('../utils/response');
const { parsePagination } = require('../utils/pagination');

/**
 * GET /api/admin/ngos — list NGOs with optional status filter
 */
async function listNgos(req, res) {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const statusFilter = req.query.status; // 'pending', 'approved', 'rejected', 'suspended'

    let query = supabaseAdmin
      .from('ngo_profiles')
      .select('*, profiles!ngo_profiles_id_fkey(username, display_name, email, phone, is_banned, created_at)', { count: 'exact' });

    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }

    const { data, error: dbError, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (dbError) return error(res, dbError.message, 400);

    return success(res, data, { page, limit, total: count });
  } catch (err) {
    console.error('listNgos error:', err);
    return serverError(res);
  }
}

/**
 * PATCH /api/admin/ngos/:ngoId/approve
 */
async function approveNgo(req, res) {
  try {
    const { ngoId } = req.params;

    const { data, error: dbError } = await supabaseAdmin
      .from('ngo_profiles')
      .update({
        status: 'approved',
        approved_by: req.user.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', ngoId)
      .eq('status', 'pending')
      .select()
      .single();

    if (dbError || !data) return notFound(res, 'NGO not found or not in pending status');

    // Elevate user's profile role to 'ngo' in the profiles table
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ role: 'ngo' })
      .eq('id', ngoId);

    if (profileError) {
      console.error('Failed to update profile role for NGO:', profileError);
      // Attempt rollback of NGO approval status
      await supabaseAdmin
        .from('ngo_profiles')
        .update({ status: 'pending', approved_by: null, approved_at: null })
        .eq('id', ngoId);
      return serverError(res, 'Failed to update user profile role to NGO');
    }

    return success(res, { ngo_id: ngoId, status: 'approved', approved_at: data.approved_at });
  } catch (err) {
    console.error('approveNgo error:', err);
    return serverError(res);
  }
}

/**
 * PATCH /api/admin/ngos/:ngoId/reject
 */
async function rejectNgo(req, res) {
  try {
    const { ngoId } = req.params;
    const { reason } = req.body;

    const { data, error: dbError } = await supabaseAdmin
      .from('ngo_profiles')
      .update({ status: 'rejected' })
      .eq('id', ngoId)
      .eq('status', 'pending')
      .select()
      .single();

    if (dbError || !data) return notFound(res, 'NGO not found or not in pending status');

    return success(res, { ngo_id: ngoId, status: 'rejected', reason });
  } catch (err) {
    console.error('rejectNgo error:', err);
    return serverError(res);
  }
}

/**
 * GET /api/admin/users — list all users
 */
async function listUsers(req, res) {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const roleFilter = req.query.role;

    let query = supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact' });

    if (roleFilter) query = query.eq('role', roleFilter);

    const { data, error: dbError, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (dbError) return error(res, dbError.message, 400);

    return success(res, data, { page, limit, total: count });
  } catch (err) {
    console.error('listUsers error:', err);
    return serverError(res);
  }
}

/**
 * PATCH /api/admin/users/:userId/ban
 */
async function banUser(req, res) {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const { data, error: dbError } = await supabaseAdmin
      .from('profiles')
      .update({ is_banned: true, banned_reason: reason || 'Violation of terms' })
      .eq('id', userId)
      .neq('role', 'admin') // can't ban admins
      .select()
      .single();

    if (dbError || !data) return notFound(res, 'User not found or is an admin');

    // If NGO, also suspend their ngo_profile
    if (data.role === 'ngo') {
      await supabaseAdmin
        .from('ngo_profiles')
        .update({ status: 'suspended' })
        .eq('id', userId);
    }

    return success(res, { user_id: userId, is_banned: true, reason });
  } catch (err) {
    console.error('banUser error:', err);
    return serverError(res);
  }
}

/**
 * PATCH /api/admin/users/:userId/unban
 */
async function unbanUser(req, res) {
  try {
    const { userId } = req.params;

    const { data, error: dbError } = await supabaseAdmin
      .from('profiles')
      .update({ is_banned: false, banned_reason: null })
      .eq('id', userId)
      .select()
      .single();

    if (dbError || !data) return notFound(res, 'User not found');

    // If NGO, restore to approved
    if (data.role === 'ngo') {
      await supabaseAdmin
        .from('ngo_profiles')
        .update({ status: 'approved' })
        .eq('id', userId);
    }

    return success(res, { user_id: userId, is_banned: false });
  } catch (err) {
    console.error('unbanUser error:', err);
    return serverError(res);
  }
}

/**
 * GET /api/admin/dashboard — platform-wide stats for admin dashboard
 */
async function platformStats(req, res) {
  try {
    const [
      adopters,
      ngos,
      plants,
      adoptions,
      posts,
      reports,
      users
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'adopter'),
      supabaseAdmin.from('ngo_profiles').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
      supabaseAdmin.from('plants').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('adoptions').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
      supabaseAdmin.from('posts').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('growth_reports').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }),
    ]);

    return success(res, {
      total_adopters: adopters.count || 0,
      total_approved_ngos: ngos.count || 0,
      total_plants: plants.count || 0,
      total_adoptions: adoptions.count || 0,
      total_posts: posts.count || 0,
      total_reports: reports.count || 0,
      total_users: users.count || 0,
      total_ngos: ngos.count || 0, // Legacy support for different keys
    });
  } catch (err) {
    console.error('platformStats error:', err);
    return serverError(res);
  }
}

module.exports = { listNgos, approveNgo, rejectNgo, listUsers, banUser, unbanUser, platformStats };
