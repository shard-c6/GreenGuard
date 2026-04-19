const { supabaseAdmin } = require('../config/supabase');
const { success, created, error, notFound, forbidden, serverError } = require('../utils/response');
const { parsePagination } = require('../utils/pagination');

/**
 * POST /api/posts/:postId/comments — add a comment to a post
 */
async function addComment(req, res) {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return error(res, 'Comment content is required', 400);
    }

    if (content.length > 1000) {
      return error(res, 'Comment must be under 1000 characters', 400);
    }

    // Verify post exists
    const { data: post } = await supabaseAdmin
      .from('posts')
      .select('id')
      .eq('id', postId)
      .single();

    if (!post) return notFound(res, 'Post not found');

    const { data, error: dbError } = await supabaseAdmin
      .from('comments')
      .insert({
        post_id: postId,
        user_id: req.user.id,
        content: content.trim(),
      })
      .select('*, profiles!inner(username, display_name, avatar_url)')
      .single();

    if (dbError) return error(res, dbError.message, 400);

    // Increment comment count
    await supabaseAdmin.rpc('increment_comments', { p_post_id: postId });

    return created(res, data);
  } catch (err) {
    console.error('addComment error:', err);
    return serverError(res);
  }
}

/**
 * GET /api/posts/:postId/comments — list comments for a post (paginated)
 */
async function listComments(req, res) {
  try {
    const { postId } = req.params;
    const { page, limit, offset } = parsePagination(req.query);

    const { data, error: dbError, count } = await supabaseAdmin
      .from('comments')
      .select('*, profiles!inner(username, display_name, avatar_url)', { count: 'exact' })
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (dbError) return error(res, dbError.message, 400);

    return success(res, data, { page, limit, total: count });
  } catch (err) {
    console.error('listComments error:', err);
    return serverError(res);
  }
}

/**
 * DELETE /api/posts/:postId/comments/:commentId — delete own comment
 */
async function deleteComment(req, res) {
  try {
    const { postId, commentId } = req.params;

    const { data: comment } = await supabaseAdmin
      .from('comments')
      .select('user_id')
      .eq('id', commentId)
      .eq('post_id', postId)
      .single();

    if (!comment) return notFound(res, 'Comment not found');
    if (comment.user_id !== req.user.id) return forbidden(res, 'You can only delete your own comments');

    await supabaseAdmin.from('comments').delete().eq('id', commentId);
    await supabaseAdmin.rpc('decrement_comments', { p_post_id: postId });

    return success(res, { message: 'Comment deleted' });
  } catch (err) {
    console.error('deleteComment error:', err);
    return serverError(res);
  }
}

module.exports = { addComment, listComments, deleteComment };
