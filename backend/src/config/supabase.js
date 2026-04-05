const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

// Public client — uses anon key, respects RLS
const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey);

// Admin client — uses service_role key, bypasses RLS
// Use this for admin operations, creating notifications, seeding, etc.
const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey);

module.exports = { supabase, supabaseAdmin };
