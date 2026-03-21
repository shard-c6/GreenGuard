const { supabaseAdmin } = require('../config/supabase');
const { success, error, serverError } = require('../utils/response');
const { parsePagination } = require('../utils/pagination');

/**
 * GET /api/notifications — list user's notifications (paginated)
 */
async function listNotifications(req, res) {
  try {
    const { page, limit, offset } = parsePagination(req.query);

    const { data, error: dbError, count } = await supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (dbError) return error(res, dbError.message, 400);

    return success(res, data, { page, limit, total: count });
  } catch (err) {
    console.error('listNotifications error:', err);
    return serverError(res);
  }
}

/**
 * PATCH /api/notifications/:id/read
 */
async function markRead(req, res) {
  try {
    const { data, error: dbError } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (dbError || !data) return error(res, 'Notification not found', 404);

    return success(res, data);
  } catch (err) {
    console.error('markRead error:', err);
    return serverError(res);
  }
}

/**
 * PATCH /api/notifications/read-all — mark all as read
 */
async function markAllRead(req, res) {
  try {
    await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', req.user.id)
      .eq('is_read', false);

    return success(res, { message: 'All notifications marked as read' });
  } catch (err) {
    console.error('markAllRead error:', err);
    return serverError(res);
  }
}

/**
 * GET /api/notifications/unread-count
 */
async function unreadCount(req, res) {
  try {
    const { count, error: dbError } = await supabaseAdmin
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', req.user.id)
      .eq('is_read', false);

    if (dbError) return error(res, dbError.message, 400);

    return success(res, { unread_count: count || 0 });
  } catch (err) {
    console.error('unreadCount error:', err);
    return serverError(res);
  }
}

module.exports = { listNotifications, markRead, markAllRead, unreadCount };
