const { supabase } = require('../config/supabase');
const { unauthorized } = require('../utils/response');

/**
 * Auth middleware — verifies Supabase JWT from Authorization header.
 * Sets req.user with { id, email, role } on success.
 */
async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorized(res, 'Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);


    if (error || !user) {
      return unauthorized(res, 'Invalid or expired token');
    }

    // Fetch profile to get role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, username, display_name, is_banned')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return unauthorized(res, 'User profile not found. Complete registration first.');
    }

    if (profile.is_banned) {
      return unauthorized(res, 'Your account has been suspended. Contact support.');
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email,
      role: profile.role,
      username: profile.username,
      displayName: profile.display_name,
    };

    // Also attach the raw token for downstream Supabase calls
    req.supabaseToken = token;

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return unauthorized(res, 'Authentication failed');
  }
}

module.exports = authMiddleware;
