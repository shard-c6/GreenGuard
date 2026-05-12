/**
 * Seed Test Data Script
 * 
 * Adds 3 "Available Plants" and 1 "Community Post" for testing the Adopter's dashboard.
 * Associated with the Admin user.
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedTestData() {
  console.log('🌱 Seeding test data for User Dashboard...\n');

  // 1. Get Admin User
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@greenguard.com';
  const { data: admin, error: adminError } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', adminEmail)
    .single();

  if (adminError || !admin) {
    console.error('❌ Admin user not found. Run seed-admin.js first.');
    process.exit(1);
  }

  const adminId = admin.id;

  // 2. Add Plants (Pune Coordinates)
  console.log('🌵 Adding 3 test plants...');
  const testPlants = [
    {
      ngo_id: adminId,
      plant_name: 'Urban Ficus',
      species: 'Ficus Benjamina',
      description: 'A beautiful indoor plant, great for air purification.',
      image_urls: ['https://images.unsplash.com/photo-1598512752271-33f913a5af13?auto=format&fit=crop&q=80&w=400'],
      location: 'SRID=4326;POINT(73.8567 18.5204)', // Longitude Latitude
      address: 'Near Shaniwar Wada, Pune',
      adoption_status: 'available'
    },
    {
      ngo_id: adminId,
      plant_name: 'Desert Aloe',
      species: 'Aloe Vera',
      description: 'Hardy and medicinal. Perfect for a sunny balcony.',
      image_urls: ['https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&q=80&w=400'],
      location: 'SRID=4326;POINT(73.9272 18.5089)', // Hadapsar area
      address: 'Magarpatta City, Pune',
      adoption_status: 'available'
    },
    {
      ngo_id: adminId,
      plant_name: 'Garden Hibiscus',
      species: 'Hibiscus Rosa-sinensis',
      description: 'Produces vibrant red flowers. Needs daily watering.',
      image_urls: ['https://images.unsplash.com/photo-1591880911855-40899478f771?auto=format&fit=crop&q=80&w=400'],
      location: 'SRID=4326;POINT(73.8340 18.5283)', // Shivaji Nagar
      address: 'Shivajinagar, Pune',
      adoption_status: 'available'
    }
  ];

  const { error: plantError } = await supabaseAdmin.from('plants').insert(testPlants);

  if (plantError) {
    console.error('❌ Failed to seed plants:', plantError.message);
  } else {
    console.log('✅ 3 Plants seeded.');
  }

  // 3. Add a Post
  console.log('📜 Adding a community post...');
  const { error: postError } = await supabaseAdmin.from('posts').insert({
    author_id: adminId,
    content: 'Welcome to GreenGuard! 🌿 We just added 3 new plants available for adoption in the Pune area. Check the map to see their locations!',
    image_urls: ['https://images.unsplash.com/photo-1524486361537-8ad15938e1a3?auto=format&fit=crop&q=80&w=600']
  });

  if (postError) {
    console.error('❌ Failed to seed post:', postError.message);
  } else {
    console.log('✅ Community post seeded.');
  }

  console.log('\n✨ Seeding completed!');
}

seedTestData().catch(err => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
});
