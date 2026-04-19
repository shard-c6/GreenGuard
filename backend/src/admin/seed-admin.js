/**
 * Admin Seed Script — creates the first admin account.
 * Run once: node scripts/seed-admin.js
 *
 * Uses the admin credentials from .env:
 *   ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_USERNAME
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedAdmin() {
  console.log('🌱 Seeding admin account...\n');

  const email = process.env.ADMIN_EMAIL || 'admin@greenguard.com';
  const password = process.env.ADMIN_PASSWORD || 'changeme';
  const username = process.env.ADMIN_USERNAME || 'admin';

  // Check if admin already exists
  const { data: existingProfile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('role', 'admin')
    .single();

  if (existingProfile) {
    console.log('⚠️  Admin already exists. Skipping seed.');
    process.exit(0);
  }

  // Create auth user
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    console.error('❌ Failed to create admin auth user:', authError.message);
    process.exit(1);
  }

  const userId = authData.user.id;

  // Create profile
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: userId,
      role: 'admin',
      username,
      display_name: 'Green Guard Admin',
      email,
    });

  if (profileError) {
    console.error('❌ Failed to create admin profile:', profileError.message);
    // Rollback auth user
    await supabaseAdmin.auth.admin.deleteUser(userId);
    process.exit(1);
  }

  console.log('✅ Admin account created successfully!');
  console.log(`   Email    : ${email}`);
  console.log(`   Username : ${username}`);
  console.log(`   Role     : admin`);
  console.log(`   ID       : ${userId}`);
  console.log('\n   You can now log in via POST /api/auth/login');
}

seedAdmin().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
