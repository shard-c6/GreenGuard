require('dotenv').config();
const { supabaseAdmin } = require('../src/config/supabase');

/**
 * PRODUCTION-LEVEL SEEDER
 * -----------------------
 * Generates:
 * - 1 Admin (from .env)
 * - 3 NGOs (Approved, Pending, Rejected)
 * - 5 Adopters
 * - 15 Plants (across different NGOs and statuses)
 * - 5 Adoption requests with various statuses
 * - 10 Community posts (Regular and Plantation Updates)
 */

async function seed() {
  console.log('🚀 Starting Production-Level Seeding...');

  try {
    // 1. Create ADMIN (from .env)
    console.log('Creating Admin...');
    const adminEmail = process.env.ADMIN_EMAIL || 'shard.chogale1983@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'GreenGuard2026!';
    
    let { data: adminUser, error: adminErr } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { role: 'admin' }
    });

    if (adminErr && !adminErr.message.includes('already been registered')) {
        throw adminErr;
    }

    const adminId = adminUser?.user?.id || (await supabaseAdmin.from('profiles').select('id').eq('email', adminEmail).single()).data?.id;

    if (adminId) {
      await supabaseAdmin.from('profiles').upsert({
        id: adminId,
        role: 'admin',
        username: 'greenguard_hq',
        display_name: 'GreenGuard HQ',
        email: adminEmail
      });
    }

    // 2. Create NGOs
    console.log('Creating NGOs...');
    const ngos = [
      {
        email: 'greenearth@ngo.org',
        username: 'greenearth',
        display_name: 'Green Earth Foundation',
        status: 'approved',
        org_name: 'Green Earth Foundation',
        registration_number: 'NGO123456',
        website: 'https://greenearth.org',
        mission: 'Restoring native forests in Western Ghats.',
        darpan_id: 'MH/2024/0123456'
      },
      {
        email: 'rootsofhope@ngo.org',
        username: 'rootsofhope',
        display_name: 'Roots of Hope',
        status: 'pending',
        org_name: 'Roots of Hope Initiative',
        registration_number: 'NGO789012',
        darpan_id: 'KA/2024/7890123'
      },
      {
        email: 'ecoquest@ngo.org',
        username: 'ecoquest',
        display_name: 'EcoQuest Network',
        status: 'rejected',
        org_name: 'EcoQuest Global Network',
        darpan_id: 'TN/2024/9999999'
      }
    ];

    const seededNgos = [];

    for (const n of ngos) {
      const { data: userData, error: uErr } = await supabaseAdmin.auth.admin.createUser({
        email: n.email,
        password: 'Password123!',
        email_confirm: true
      });

      if (uErr && !uErr.message.includes('already been registered')) continue;
      
      const userId = userData?.user?.id || (await supabaseAdmin.from('profiles').select('id').eq('email', n.email).single()).data?.id;

      await supabaseAdmin.from('profiles').upsert({
        id: userId,
        role: 'ngo',
        username: n.username,
        display_name: n.display_name,
        email: n.email
      });

      await supabaseAdmin.from('ngo_profiles').upsert({
        id: userId,
        status: n.status,
        org_name: n.org_name,
        registration_number: n.registration_number,
        website: n.website,
        mission: n.mission,
        darpan_id: n.darpan_id,
        onboarding_answers: {
           annual_capacity: '10000+ trees',
           primary_region: 'India - Maharashtra',
           experience_years: 5
        }
      });

      if (n.status === 'approved') {
        seededNgos.push(userId);
      }
    }

    // 3. Create Adopters
    console.log('Creating Adopters...');
    const adopters = [
      { email: 'test_adopter@gmail.com', username: 'adopter_test', display_name: 'Test Adopter' },
      { email: 'shardul@test.com', username: 'shardul_k', display_name: 'Shardul Kulkarni' },
      { email: 'aarav@test.com', username: 'aarav_j', display_name: 'Aarav Joshi' }
    ];

    const seededAdopters = [];
    for (const a of adopters) {
      const { data: userData, error: uErr } = await supabaseAdmin.auth.admin.createUser({
        email: a.email,
        password: 'Password123!',
        email_confirm: true
      });

      if (uErr && !uErr.message.includes('already been registered')) continue;
      
      const userId = userData?.user?.id || (await supabaseAdmin.from('profiles').select('id').eq('email', a.email).single()).data?.id;

      await supabaseAdmin.from('profiles').upsert({
        id: userId,
        role: 'adopter',
        username: a.username,
        display_name: a.display_name,
        email: a.email
      });
      seededAdopters.push(userId);
    }

    // 4. Create Plants
    console.log('Creating Plants...');
    const plantSpecies = ['Neem', 'Banyan', 'Peepal', 'Mango', 'Teak'];
    const plantIds = [];

    for (let i = 0; i < 15; i++) {
        const ngoId = seededNgos[i % seededNgos.length];
        const species = plantSpecies[i % plantSpecies.length];
        const status = i < 8 ? 'available' : i < 12 ? 'pending' : 'adopted';
        
        // Random locations around Mumbai/Pune region
        const lat = 19.0760 + (Math.random() - 0.5) * 0.5;
        const lng = 72.8777 + (Math.random() - 0.5) * 0.5;

        const { data: plant, error: pErr } = await supabaseAdmin.from('plants').insert({
            ngo_id: ngoId,
            plant_name: `${species} Tree #${i+1}`,
            species: species,
            location: `POINT(${lng} ${lat})`,
            latitude: lat,
            longitude: lng,
            adoption_status: status,
            price: 500 + (Math.floor(Math.random() * 5) * 100),
            image_urls: ['https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=600'],
            health_status: 'healthy',
            planted_date: new Date().toISOString().split('T')[0]
        }).select().single();

        if (plant) plantIds.push(plant.id);
    }

    // 5. Create Adoptions
    console.log('Creating Adoptions...');
    for (let i = 0; i < 5; i++) {
        const adopterId = seededAdopters[i % seededAdopters.length];
        const plantId = plantIds[i + 8]; // Using pending/adopted plants
        const status = i < 3 ? 'approved' : 'pending';

        await supabaseAdmin.from('adoptions').insert({
            adopter_id: adopterId,
            plant_id: plantId,
            ngo_id: seededNgos[0],
            status: status,
            total_amount: 500
        });
    }

    // 6. Create Social Posts
    console.log('Creating Posts...');
    const posts = [
        {
            author_id: seededNgos[0],
            content: 'We just finished our monsoon plantation drive at Sanjay Gandhi National Park! 🌳✨ #Reforestation',
            image_urls: ['https://images.unsplash.com/photo-1576085898323-2183ba9b222c?q=80&w=800'],
            post_type: 'plantation',
            latitude: 19.2288,
            longitude: 72.9182,
            location: 'POINT(72.9182 19.2288)',
            address: 'Sanjay Gandhi National Park, Mumbai'
        },
        {
            author_id: seededAdopters[0],
            content: 'Just adopted my first Neem tree! Can\'t wait to see it grow. 🌿',
            image_urls: ['https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=800'],
            post_type: 'normal'
        },
        {
            author_id: seededNgos[0],
            content: 'Our Banyan trees are showing incredible growth this month. Check out the height comparison!',
            image_urls: ['https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=800'],
            post_type: 'normal'
        }
    ];

    for (const p of posts) {
        await supabaseAdmin.from('posts').insert(p);
    }

    console.log('✅ Seeding Complete!');
    console.log(`
      SEEDED CREDENTIALS:
      -------------------
      Admin: ${adminEmail} / ${adminPassword}
      NGO (Approved): greenearth@ngo.org / Password123!
      NGO (Pending): rootsofhope@ngo.org / Password123!
      Adopter: test_adopter@gmail.com / Password123!
    `);

  } catch (err) {
    console.error('❌ SEEDING FAILED:', err);
    process.exit(1);
  }
}

seed();
