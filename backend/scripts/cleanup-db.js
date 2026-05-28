/**
 * Database & Storage Cleanup Script
 * 
 * USE WITH CAUTION: This script wipes all test data and storage buckets.
 * Preserves the Admin account configured in .env.
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BUCKETS = ['plant-images', 'post-images', 'report-images', 'avatars'];
const TABLES = [
  'notifications',
  'follows',
  'bookmarks',
  'likes',
  'growth_reports',
  'adoptions',
  'posts',
  'plants'
];

async function cleanup() {
  console.log('🧹 Starting thorough system cleanup...\n');

  const adminEmail = process.env.ADMIN_EMAIL || 'shard.chogale1983@gmail.com';

  // 1. Clear Storage Buckets
  console.log('📦 Cleaning Storage Buckets...');
  for (const bucket of BUCKETS) {
    const { data: files, error: listError } = await supabaseAdmin
      .storage
      .from(bucket)
      .list();

    if (listError) {
      console.warn(`   ⚠️  Could not list files in bucket "${bucket}":`, listError.message);
      continue;
    }

    if (files && files.length > 0) {
      const paths = files.map(f => f.name).filter(name => name !== '.emptyFolderPlaceholder');
      if (paths.length > 0) {
        const { error: deleteError } = await supabaseAdmin
          .storage
          .from(bucket)
          .remove(paths);

        if (deleteError) {
          console.error(`   ❌ Failed to clear bucket "${bucket}":`, deleteError.message);
        } else {
          console.log(`   ✅ Cleared ${paths.length} files from "${bucket}".`);
        }
      } else {
        console.log(`   ℹ️  Bucket "${bucket}" is already empty.`);
      }
    } else {
      console.log(`   ℹ️  Bucket "${bucket}" is empty.`);
    }
  }

  // 2. Clear All Transactional Data (including Admin-owned rows)
  console.log('\n📊 Clearing Table Data...');
  for (const table of TABLES) {
    let query = supabaseAdmin.from(table).delete();
    
    if (['follows', 'likes', 'bookmarks'].includes(table)) {
      query = query.neq('user_id', '00000000-0000-0000-0000-000000000000');
      if (table === 'follows') {
        query = supabaseAdmin.from(table).delete().neq('follower_id', '00000000-0000-0000-0000-000000000000');
      }
    } else {
      query = query.neq('id', '00000000-0000-0000-0000-000000000000');
    }

    const { error } = await query;

    if (error) {
      console.error(`   ❌ Failed to clear table "${table}":`, error.message);
    } else {
      console.log(`   ✅ Cleared table "${table}".`);
    }
  }

  // 3. Delete Non-Admin Users
  console.log('\n👤 Cleaning up User Accounts...');
  const { data: { users }, error: listUsersError } = await supabaseAdmin.auth.admin.listUsers();

  if (listUsersError) {
    console.error('❌ Failed to fetch users:', listUsersError.message);
    process.exit(1);
  }

  let deletedCount = 0;
  for (const user of users) {
    if (user.email === adminEmail) {
      console.log(`   ⭐ Preserving Admin: ${user.email} (${user.id})`);
      continue;
    }

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    if (deleteError) {
      console.error(`   ❌ Failed to delete user ${user.email}:`, deleteError.message);
    } else {
      deletedCount++;
    }
  }
  console.log(`   ✅ Deleted ${deletedCount} user accounts.`);

  console.log('\n✨ Cleanup completed successfully!');
}

cleanup().catch((err) => {
  console.error('\n❌ Cleanup failed with fatal error:', err);
  process.exit(1);
});
