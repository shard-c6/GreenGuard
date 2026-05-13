const { supabaseAdmin } = require('../src/config/supabase');

async function seedIntervals() {
  try {
    console.log('Seeding default intervals for plants...');

    // Update plants with NULL watering_interval_days
    const { data: wData, error: wError } = await supabaseAdmin
      .from('plants')
      .update({ watering_interval_days: 7 })
      .is('watering_interval_days', null)
      .select('id');

    if (wError) throw wError;
    console.log(`Updated ${wData?.length || 0} plants with default watering interval (7 days).`);

    // Update plants with NULL fertilization_interval_days
    const { data: fData, error: fError } = await supabaseAdmin
      .from('plants')
      .update({ fertilization_interval_days: 30 })
      .is('fertilization_interval_days', null)
      .select('id');

    if (fError) throw fError;
    console.log(`Updated ${fData?.length || 0} plants with default fertilization interval (30 days).`);

    // Also check for user_plants and ensure they have reasonable created_at or last_watered_at
    // This is just to make sure they show up in notifications if they are old.

    console.log('Done seeding intervals.');
    process.exit(0);
  } catch (err) {
    console.error('Seed intervals error:', err);
    process.exit(1);
  }
}

seedIntervals();
