/**
 * Map Verification Script
 * Inserts a test "NGO Plantation" post with geospatial data.
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyMapData() {
  console.log('🗺️  Seeding a test plantation post for map verification...');

  // 1. Get Admin User
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@greenguard.com';
  const { data: admin } = await supabase.from('profiles').select('id').eq('email', adminEmail).single();

  if (!admin) {
    console.error('❌ Admin user not found. Please run seed-admin.js first.');
    return;
  }

  // 2. Insert Plantation Post (Mumbai)
  const testPost = {
    author_id: admin.id,
    content: 'Special NGO Plantation Event! We just planted 50 saplings at Sanjay Gandhi National Park. 🌳',
    post_type: 'plantation',
    latitude: 19.2212,
    longitude: 72.9113,
    location: 'POINT(72.9113 19.2212)',
    address: 'Sanjay Gandhi National Park, Mumbai',
    image_urls: ['https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800']
  };

  const { data, error } = await supabase.from('posts').insert(testPost).select().single();

  if (error) {
    console.error('❌ Failed to insert test post:', error.message);
    if (error.message.includes('column "post_type" does not exist')) {
       console.error('👉 This means the SQL migration was NOT successful.');
    }
  } else {
    console.log('✅ Success! Test plantation post created with ID:', data.id);
    console.log('📍 Location:', testPost.address);
    console.log('\n🚀 Now refresh your /map page to see the new indigo marker!');
  }
}

verifyMapData();
