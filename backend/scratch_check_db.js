const { supabaseAdmin } = require('./src/config/supabase');

async function checkDb() {
  try {
    // Check plants with NULL intervals
    const { data: plants, error: pError } = await supabaseAdmin
      .from('plants')
      .select('id, plant_name, watering_interval_days, fertilization_interval_days')
      .or('watering_interval_days.is.null,fertilization_interval_days.is.null');

    if (pError) throw pError;
    console.log(`Plants with NULL intervals: ${plants.length}`);
    if (plants.length > 0) {
      console.log('Sample plants with NULL:', plants.slice(0, 5));
    }

    // Check user_plants rows
    const { count: upCount, error: upError } = await supabaseAdmin
      .from('user_plants')
      .select('*', { count: 'exact', head: true });

    if (upError) throw upError;
    console.log(`Total user_plants rows: ${upCount}`);

    // Check adoptions
    const { data: adoptions, error: aError } = await supabaseAdmin
      .from('adoptions')
      .select('id, plant_id, adopter_id, status')
      .eq('status', 'approved');

    if (aError) throw aError;
    console.log(`Approved adoptions: ${adoptions.length}`);

    // Verify if approved adoptions have corresponding user_plants rows
    for (const ad of adoptions) {
      const { data: up, error: upCheckError } = await supabaseAdmin
        .from('user_plants')
        .select('id')
        .eq('user_id', ad.adopter_id)
        .eq('plant_id', ad.plant_id)
        .maybeSingle();
      
      if (upCheckError) console.error(`Error checking user_plants for adoption ${ad.id}:`, upCheckError);
      if (!up) {
        console.log(`Missing user_plants row for approved adoption ${ad.id} (User: ${ad.adopter_id}, Plant: ${ad.plant_id})`);
      }
    }

  } catch (err) {
    console.error('Check DB error:', err);
  }
}

checkDb();
