const { supabaseAdmin } = require('../config/supabase');
const { success, created, error, notFound, forbidden, serverError } = require('../utils/response');
const { parsePagination } = require('../utils/pagination');
const { uploadMultipleToStorage } = require('../services/storage.service');

/**
 * POST /api/posts — create a community post (NGO only)
 */
async function createPost(req, res) {
  try {
    const { content, plant_id, latitude, longitude, address, post_type } = req.body;

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = await uploadMultipleToStorage('post-images', req.files);
    }

    const postData = {
      author_id: req.user.id,
      content: content || null,
      image_urls: imageUrls,
      plant_id: plant_id || null,
      post_type: post_type || 'normal',
    };

    if (latitude && longitude) {
      postData.latitude = parseFloat(latitude);
      postData.longitude = parseFloat(longitude);
      postData.address = address || null;
      postData.location = `POINT(${longitude} ${latitude})`;
    }

    const { data, error: dbError } = await supabaseAdmin
      .from('posts')
      .insert(postData)
      .select()
      .single();

    if (dbError) return error(res, dbError.message, 400);

    return created(res, data);
  } catch (err) {
    console.error('createPost error:', err);
    return serverError(res);
  }
}

/**
 * GET /api/posts — community feed (followed NGOs first, then recent)
 */
async function getFeed(req, res) {
  try {
    const { page, limit, offset } = parsePagination(req.query);

    // Get list of NGOs the user follows
    const { data: follows } = await supabaseAdmin
      .from('follows')
      .select('following_id')
      .eq('follower_id', req.user.id);

    const followedIds = (follows || []).map((f) => f.following_id);

    // Fetch posts sorted: followed NGOs first, then by recency
    let query = supabaseAdmin
      .from('posts')
      .select('*, profiles!posts_author_id_fkey(username, display_name, avatar_url, role)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error: dbError, count } = await query;

    if (dbError) return error(res, dbError.message, 400);

    // Sort: followed posts first, then rest by date
    const sorted = (data || []).sort((a, b) => {
      const aFollowed = followedIds.includes(a.author_id) ? 0 : 1;
      const bFollowed = followedIds.includes(b.author_id) ? 0 : 1;
      if (aFollowed !== bFollowed) return aFollowed - bFollowed;
      return new Date(b.created_at) - new Date(a.created_at);
    });

    // Check if current user has liked/bookmarked each post
    const postIds = sorted.map((p) => p.id);

    const [likesResult, bookmarksResult] = await Promise.all([
      supabaseAdmin.from('likes').select('post_id').eq('user_id', req.user.id).in('post_id', postIds),
      supabaseAdmin.from('bookmarks').select('post_id').eq('user_id', req.user.id).in('post_id', postIds),
    ]);

    const likedSet = new Set((likesResult.data || []).map((l) => l.post_id));
    const bookmarkedSet = new Set((bookmarksResult.data || []).map((b) => b.post_id));

    const enriched = sorted.map((post) => ({
      ...post,
      is_liked: likedSet.has(post.id),
      is_bookmarked: bookmarkedSet.has(post.id),
    }));

    return success(res, enriched, { page, limit, total: count });
  } catch (err) {
    console.error('getFeed error:', err);
    return serverError(res);
  }
}

/**
 * GET /api/posts/:id — single post
 */
async function getPost(req, res) {
  try {
    const { data, error: dbError } = await supabaseAdmin
      .from('posts')
      .select('*, profiles!posts_author_id_fkey(username, display_name, avatar_url)')
      .eq('id', req.params.id)
      .single();

    if (dbError || !data) return notFound(res, 'Post not found');

    // Check user interactions
    const [likeResult, bookmarkResult] = await Promise.all([
      supabaseAdmin.from('likes').select('user_id').eq('post_id', data.id).eq('user_id', req.user.id).single(),
      supabaseAdmin.from('bookmarks').select('user_id').eq('post_id', data.id).eq('user_id', req.user.id).single(),
    ]);

    return success(res, {
      ...data,
      is_liked: !!likeResult.data,
      is_bookmarked: !!bookmarkResult.data,
    });
  } catch (err) {
    console.error('getPost error:', err);
    return serverError(res);
  }
}

/**
 * DELETE /api/posts/:id — delete own post
 */
async function deletePost(req, res) {
  try {
    const { data: post } = await supabaseAdmin.from('posts').select('author_id').eq('id', req.params.id).single();
    if (!post) return notFound(res, 'Post not found');
    if (post.author_id !== req.user.id) return forbidden(res);

    await supabaseAdmin.from('posts').delete().eq('id', req.params.id);
    return success(res, { message: 'Post deleted' });
  } catch (err) {
    console.error('deletePost error:', err);
    return serverError(res);
  }
}

/**
 * POST /api/posts/:id/like — toggle like
 */
async function toggleLike(req, res) {
  try {
    const postId = req.params.id;

    // Check if already liked
    const { data: existing } = await supabaseAdmin
      .from('likes')
      .select('user_id')
      .eq('user_id', req.user.id)
      .eq('post_id', postId)
      .single();

    if (existing) {
      // Unlike
      await supabaseAdmin.from('likes').delete().eq('user_id', req.user.id).eq('post_id', postId);
      await supabaseAdmin.rpc('decrement_likes', { p_post_id: postId });
      return success(res, { liked: false });
    } else {
      // Like
      await supabaseAdmin.from('likes').insert({ user_id: req.user.id, post_id: postId });
      await supabaseAdmin.rpc('increment_likes', { p_post_id: postId });
      return success(res, { liked: true });
    }
  } catch (err) {
    console.error('toggleLike error:', err);
    return serverError(res);
  }
}

/**
 * POST /api/posts/:id/bookmark — toggle bookmark
 */
async function toggleBookmark(req, res) {
  try {
    const postId = req.params.id;

    const { data: existing } = await supabaseAdmin
      .from('bookmarks')
      .select('user_id')
      .eq('user_id', req.user.id)
      .eq('post_id', postId)
      .single();

    if (existing) {
      await supabaseAdmin.from('bookmarks').delete().eq('user_id', req.user.id).eq('post_id', postId);
      await supabaseAdmin.rpc('decrement_bookmarks', { p_post_id: postId });
      return success(res, { bookmarked: false });
    } else {
      await supabaseAdmin.from('bookmarks').insert({ user_id: req.user.id, post_id: postId });
      await supabaseAdmin.rpc('increment_bookmarks', { p_post_id: postId });
      return success(res, { bookmarked: true });
    }
  } catch (err) {
    console.error('toggleBookmark error:', err);
    return serverError(res);
  }
}

/**
 * GET /api/posts/bookmarks — user's bookmarked posts
 */
async function myBookmarks(req, res) {
  try {
    const { data, error: dbError } = await supabaseAdmin
      .from('bookmarks')
      .select('post_id, posts!inner(*, profiles!posts_author_id_fkey(username, display_name, avatar_url))')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (dbError) return error(res, dbError.message, 400);

    const posts = (data || []).map((b) => ({ ...b.posts, is_bookmarked: true }));
    return success(res, posts);
  } catch (err) {
    console.error('myBookmarks error:', err);
    return serverError(res);
  }
}

/**
 * GET /api/posts/map — get all plantation posts for map rendering
 */
async function mapPlantations(req, res) {
  try {
    const { data, error: dbError } = await supabaseAdmin
      .from('posts')
      .select('id, author_id, content, image_urls, location, latitude, longitude, address, post_type, profiles!posts_author_id_fkey(display_name, avatar_url)')
      .eq('post_type', 'plantation');

    if (dbError) return error(res, dbError.message, 400);

    return success(res, data);
  } catch (err) {
    console.error('mapPlantations error:', err);
    return serverError(res);
  }
}

module.exports = { createPost, getFeed, getPost, deletePost, toggleLike, toggleBookmark, myBookmarks, mapPlantations };
