require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { count, error } = await supabase
    .from('plant_knowledge')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error fetching count:', error);
  } else {
    console.log(`Total entries in plant_knowledge: ${count}`);
  }
}

check();
