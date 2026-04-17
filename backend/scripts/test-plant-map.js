/**
 * Test Plant Map Query
 * Directly runs the Supabase query used in mapPlants controller.
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testQuery() {
  console.log('🧪 Testing mapPlants query...');

  const { data, error } = await supabase
    .from('plants')
    .select('id, plant_name, species, location, adoption_status, adopted_by, image_urls, ngo_id, profiles!plants_ngo_id_fkey(display_name)');

  if (error) {
    console.error('❌ Query failed with error:', error);
    if (error.message.includes('relationship') || error.message.includes('profiles')) {
      console.log('👉 Possible relationship name mismatch.');
      
      // Try with plural name (common in some Supabase setups)
      console.log('🔄 Trying with "profiles!ngo_id"...');
      const { error: error2 } = await supabase
        .from('plants')
        .select('id, profiles!ngo_id(display_name)');
      if (!error2) console.log('✅ Success with "profiles!ngo_id"!');
      
      // Try without relationship name (if singular)
      console.log('🔄 Trying with just "profiles"...');
      const { error: error3 } = await supabase
        .from('plants')
        .select('id, profiles(display_name)');
      if (!error3) console.log('✅ Success with "profiles"!');
    }
  } else {
    console.log('✅ Query succeeded! Data count:', data.length);
    if (data.length > 0) {
      console.log('Sample item:', JSON.stringify(data[0], null, 2));
    }
  }
}

testQuery();
