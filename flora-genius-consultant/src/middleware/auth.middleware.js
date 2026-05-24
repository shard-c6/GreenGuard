const { createClient } = require('@supabase/supabase-js');

// Create a Supabase client using environment variables
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * Auth middleware — verifies Supabase JWT from Authorization header.
 * Sets req.user on success and req.supabaseToken.
 */
async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Missing or invalid Authorization header' }
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' }
      });
    }

    // Fetch profile to verify role and check ban status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, username, display_name, is_banned')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User profile not found. Complete registration first.' }
      });
    }

    if (profile.is_banned) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Your account has been suspended. Contact support.' }
      });
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email,
      role: profile.role,
      username: profile.username,
      displayName: profile.display_name,
    };

    req.supabaseToken = token;

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication failed' }
    });
  }
}

module.exports = authMiddleware;
