const { createClient } = require('@supabase/supabase-js');
const env = require('./env');
const { AsyncLocalStorage } = require('async_hooks');

// Create a local storage context for Supabase request clients
const supabaseLocalStorage = new AsyncLocalStorage();

// Public client — uses anon key, respects RLS
const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey);

// Real Admin client — uses service_role key, bypasses RLS
const realSupabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey);

// Helper function to generate a client per-request
function getSupabaseClient(token) {
  if (!token) return supabase;
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });
}

// Proxied supabaseAdmin:
// Automatically uses the authenticated user's client if active in the local storage context.
// Otherwise, falls back to the real admin client.
const supabaseAdmin = new Proxy(realSupabaseAdmin, {
  get(target, prop, receiver) {
    const store = supabaseLocalStorage.getStore();
    if (store && store.userClient) {
      return Reflect.get(store.userClient, prop, store.userClient);
    }
    return Reflect.get(target, prop, receiver);
  }
});

module.exports = { 
  supabase, 
  supabaseAdmin, 
  supabaseServiceRole: realSupabaseAdmin, 
  getSupabaseClient, 
  supabaseLocalStorage 
};

