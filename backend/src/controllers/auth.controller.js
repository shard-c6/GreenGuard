const { supabase, supabaseServiceRole: supabaseAdmin } = require('../config/supabase');
const { success, created, error, unauthorized, serverError } = require('../utils/response');
const env = require('../config/env');

/**
 * POST /api/auth/register
 * Register a new user via Supabase Auth + create profile row.
 */
async function register(req, res) {
  try {
    const { email, password, username, display_name, role, phone } = req.body;

    // Check if username is taken
    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single();

    if (existing) {
      return error(res, 'Username is already taken', 409, 'CONFLICT');
    }

    // Create auth user in Supabase
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for now; enable email verification later
    });

    if (authError) {
      if (authError.message.includes('already been registered')) {
        return error(res, 'Email is already registered', 409, 'CONFLICT');
      }
      return error(res, authError.message, 400);
    }

    const userId = authData.user.id;

    // NGO and Admin roles must NOT be self-assigned at registration.
    // They default to 'adopter' and require admin approval.
    const finalRole = 'adopter';

    // Create profile row (use upsert to handle cases where a trigger might have already created a skeleton profile)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        role: finalRole,
        username,
        display_name: display_name || username,
        email,
        phone: phone || null,
        updated_at: new Date(),
      });

    if (profileError) {
      // Rollback: delete the auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(userId);
      console.error('Profile creation failed:', profileError);
      return serverError(res, 'Failed to create user profile');
    }

    // If NGO, create a pending ngo_profiles entry
    if (role === 'ngo') {
      const { darpan_id, onboarding_answers, org_name } = req.body;
      await supabaseAdmin
        .from('ngo_profiles')
        .insert({
          id: userId,
          org_name: org_name || display_name || username,
          status: 'pending',
          darpan_id: darpan_id || null,
          onboarding_answers: onboarding_answers || null,
        });
    }

    // Sign in to get session tokens
    const { data: session, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return created(res, {
        user: { id: userId, email, role: finalRole, username },
        message: 'Account created. Please log in.',
      });
    }

    return created(res, {
      user: { id: userId, email, role: finalRole, username },
      session: {
        access_token: session.session.access_token,
        refresh_token: session.session.refresh_token,
        expires_at: session.session.expires_at,
      },
    });
  } catch (err) {
    console.error('CRITICAL Registration failure:', err);
    return error(res, err.message || 'Internal server error during registration', 500, 'REGISTRATION_CRASH');
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return unauthorized(res, 'Invalid email or password');
    }

    // Fetch profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, role, username, display_name, is_banned')
      .eq('id', data.user.id)
      .single();

    if (!profile) {
      return unauthorized(res, 'User profile not found');
    }

    if (profile.is_banned) {
      return unauthorized(res, 'Your account has been suspended. Contact support.');
    }

    // If NGO, check approval status
    let ngoStatus = null;
    if (profile.role === 'ngo') {
      const { data: ngoProfile } = await supabaseAdmin
        .from('ngo_profiles')
        .select('status')
        .eq('id', profile.id)
        .single();
      ngoStatus = ngoProfile?.status || 'pending';
    }

    return success(res, {
      user: {
        id: profile.id,
        email: data.user.email,
        role: profile.role,
        username: profile.username,
        display_name: profile.display_name,
        ngo_status: ngoStatus,
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return serverError(res);
  }
}

/**
 * GET /api/auth/me — get current user profile
 */
async function getMe(req, res) {
  try {
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (profileError || !profile) {
      return error(res, 'Profile not found', 404);
    }

    let ngoProfile = null;
    if (profile.role === 'ngo') {
      const { data } = await supabaseAdmin
        .from('ngo_profiles')
        .select('*')
        .eq('id', profile.id)
        .single();
      ngoProfile = data;
    }

    return success(res, {
      ...profile,
      ngo_profile: ngoProfile,
    });
  } catch (err) {
    console.error('GetMe error:', err);
    return serverError(res);
  }
}

/**
 * PUT /api/auth/me — update current user profile
 */
async function updateMe(req, res) {
  try {
    const { display_name, bio, phone, address } = req.body;

    const updates = {};
    if (display_name !== undefined) updates.display_name = display_name;
    if (bio !== undefined) updates.bio = bio;
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;
    updates.updated_at = new Date().toISOString();

    const { data, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (updateError) {
      return error(res, updateError.message, 400);
    }

    return success(res, data);
  } catch (err) {
    console.error('UpdateMe error:', err);
    return serverError(res);
  }
}

/**
 * POST /api/auth/forgot-password
 */
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const redirectTo = `${env.frontendUrl}/reset-password`;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (resetError) {
      console.error('Forgot password error:', resetError);
    }

    // Always return success to prevent email enumeration
    return success(res, {
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (err) {
    console.error('ForgotPassword error:', err);
    return serverError(res);
  }
}

/**
 * POST /api/auth/reset-password
 * (Called after user clicks the reset link and has a valid session)
 */
async function resetPassword(req, res) {
  try {
    const { new_password } = req.body;

    const { error: updateError } = await supabase.auth.updateUser({
      password: new_password,
    });

    if (updateError) {
      return error(res, updateError.message, 400);
    }

    return success(res, { message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error('ResetPassword error:', err);
    return serverError(res);
  }
}

/**
 * POST /api/auth/logout
 */
async function logout(req, res) {
  try {
    await supabase.auth.signOut();
    return success(res, { message: 'Logged out successfully.' });
  } catch (err) {
    console.error('Logout error:', err);
    return serverError(res);
  }
}

/**
 * GET /api/auth/authorize/:provider
 * Get the Supabase OAuth URL to redirect the frontend
 */
async function authorizeSocial(req, res) {
  try {
    const { provider } = req.params;
    const validProviders = ['google', 'apple', 'facebook'];
    
    if (!validProviders.includes(provider)) {
      return error(res, 'Invalid provider', 400);
    }

    const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${env.frontendUrl}/auth/callback`,
      },
    });

    if (oauthError) {
      return error(res, oauthError.message, 400);
    }

    return success(res, { url: data.url });
  } catch (err) {
    console.error('authorizeSocial error:', err);
    return serverError(res);
  }
}

module.exports = { register, login, getMe, updateMe, forgotPassword, resetPassword, logout, authorizeSocial };
