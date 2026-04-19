const { supabaseAdmin } = require('../config/supabase');
const { success, notFound, forbidden, error, serverError } = require('../utils/response');

/**
 * GET /api/profiles/:userId — view anyone's profile
 */
async function getProfile(req, res) {
  try {
    const { data: profile, error: dbError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.params.userId)
      .single();

    if (dbError || !profile) return notFound(res, 'User not found');

    let ngoProfile = null;
    if (profile.role === 'ngo') {
      const { data } = await supabaseAdmin
        .from('ngo_profiles')
        .select('org_name, mission, website, status')
        .eq('id', profile.id)
        .single();
      ngoProfile = data;
    }

    // Get counts
    const [followersResult, followingResult, plantsResult, postsResult] = await Promise.all([
      supabaseAdmin.from('follows').select('follower_id', { count: 'exact', head: true }).eq('following_id', profile.id),
      supabaseAdmin.from('follows').select('following_id', { count: 'exact', head: true }).eq('follower_id', profile.id),
      supabaseAdmin.from('plants').select('id', { count: 'exact', head: true }).eq('ngo_id', profile.id),
      supabaseAdmin.from('posts').select('id', { count: 'exact', head: true }).eq('author_id', profile.id),
    ]);

    // Check if current user follows this profile
    const { data: followCheck } = await supabaseAdmin
      .from('follows')
      .select('follower_id')
      .eq('follower_id', req.user.id)
      .eq('following_id', profile.id)
      .single();

    return success(res, {
      ...profile,
      ngo_profile: ngoProfile,
      followers_count: followersResult.count || 0,
      following_count: followingResult.count || 0,
      plants_count: plantsResult.count || 0,
      posts_count: postsResult.count || 0,
      is_following: !!followCheck,
    });
  } catch (err) {
    console.error('getProfile error:', err);
    return serverError(res);
  }
}

/**
 * GET /api/profiles/:userId/posts — posts by user
 */
async function getUserPosts(req, res) {
  try {
    const { data, error: dbError } = await supabaseAdmin
      .from('posts')
      .select('*, profiles!inner(username, display_name, avatar_url)')
      .eq('author_id', req.params.userId)
      .order('created_at', { ascending: false });

    if (dbError) return error(res, dbError.message, 400);

    return success(res, data);
  } catch (err) {
    console.error('getUserPosts error:', err);
    return serverError(res);
  }
}

/**
 * GET /api/profiles/:userId/plants — plants by NGO
 */
async function getUserPlants(req, res) {
  try {
    const { data, error: dbError } = await supabaseAdmin
      .from('plants')
      .select('*')
      .eq('ngo_id', req.params.userId)
      .order('created_at', { ascending: false });

    if (dbError) return error(res, dbError.message, 400);

    return success(res, data);
  } catch (err) {
    console.error('getUserPlants error:', err);
    return serverError(res);
  }
}

/**
 * POST /api/profiles/:userId/follow — follow a user/NGO
 */
async function follow(req, res) {
  try {
    const targetId = req.params.userId;
    if (targetId === req.user.id) return error(res, 'You cannot follow yourself', 400);

    const { error: dbError } = await supabaseAdmin
      .from('follows')
      .insert({ follower_id: req.user.id, following_id: targetId });

    if (dbError) {
      if (dbError.code === '23505') return error(res, 'Already following', 409, 'CONFLICT');
      return error(res, dbError.message, 400);
    }

    return success(res, { following: true });
  } catch (err) {
    console.error('follow error:', err);
    return serverError(res);
  }
}

/**
 * DELETE /api/profiles/:userId/follow — unfollow
 */
async function unfollow(req, res) {
  try {
    await supabaseAdmin
      .from('follows')
      .delete()
      .eq('follower_id', req.user.id)
      .eq('following_id', req.params.userId);

    return success(res, { following: false });
  } catch (err) {
    console.error('unfollow error:', err);
    return serverError(res);
  }
}

/**
 * GET /api/profiles/:userId/followers
 */
async function getFollowers(req, res) {
  try {
    const { data, error: dbError } = await supabaseAdmin
      .from('follows')
      .select('profiles!follows_follower_id_fkey(id, username, display_name, avatar_url, role)')
      .eq('following_id', req.params.userId);

    if (dbError) return error(res, dbError.message, 400);

    const followers = (data || []).map((f) => f.profiles);
    return success(res, followers);
  } catch (err) {
    console.error('getFollowers error:', err);
    return serverError(res);
  }
}

/**
 * GET /api/profiles/:userId/following
 */
async function getFollowing(req, res) {
  try {
    const { data, error: dbError } = await supabaseAdmin
      .from('follows')
      .select('profiles!follows_following_id_fkey(id, username, display_name, avatar_url, role)')
      .eq('follower_id', req.params.userId);

    if (dbError) return error(res, dbError.message, 400);

    const following = (data || []).map((f) => f.profiles);
    return success(res, following);
  } catch (err) {
    console.error('getFollowing error:', err);
    return serverError(res);
  }
}

module.exports = { getProfile, getUserPosts, getUserPlants, follow, unfollow, getFollowers, getFollowing };
