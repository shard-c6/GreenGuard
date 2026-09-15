const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

// Load environment variables from backend/.env
const envPath = path.join(__dirname, '..', 'backend', '.env');
if (fs.existsSync(envPath)) {
  require(path.join(__dirname, '..', 'backend', 'node_modules', 'dotenv')).config({ path: envPath });
} else {
  console.error('❌ backend/.env file not found!');
  process.exit(1);
}

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in backend/.env');
  process.exit(1);
}

// Initialize Supabase client using @supabase/supabase-js as required
const { createClient } = require(path.join(__dirname, '..', 'backend', 'node_modules', '@supabase/supabase-js'));
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

console.log('✅ Connected to Supabase via @supabase/supabase-js client using service role key.');

// Output directory
const outputDir = path.join(__dirname, '..', 'docs', 'schema-snapshot');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Helper to execute SQL query via Supabase CLI linked db query or Supabase client
function executeSqlQuery(sql) {
  try {
    const rawOutput = execFileSync('supabase', ['db', 'query', '--linked', sql, '--output-format', 'json'], {
      encoding: 'utf8',
      cwd: path.join(__dirname, '..'),
      maxBuffer: 10 * 1024 * 1024
    });

    const jsonStart = rawOutput.indexOf('{');
    const jsonEnd = rawOutput.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      const jsonStr = rawOutput.slice(jsonStart, jsonEnd + 1);
      const parsed = JSON.parse(jsonStr);
      if (parsed.rows) {
        return parsed.rows;
      }
    }
    throw new Error('Failed to parse rows from query output: ' + rawOutput);
  } catch (err) {
    throw new Error(err.message || String(err));
  }
}

const queries = [
  {
    filename: '01_tables.json',
    description: 'All columns across all public tables',
    sql: `SELECT table_name, column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema = 'public' ORDER BY table_name, ordinal_position;`
  },
  {
    filename: '02_plant_knowledge_schema.json',
    description: 'Exact plant_knowledge column list',
    sql: `SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'plant_knowledge' ORDER BY ordinal_position;`
  },
  {
    filename: '03_row_counts.json',
    description: 'Row count per table',
    sql: `SELECT schemaname, relname as tablename, n_live_tup as row_count FROM pg_stat_user_tables WHERE schemaname = 'public' ORDER BY relname;`
  },
  {
    filename: '04_extensions.json',
    description: 'Enabled Postgres extensions',
    sql: `SELECT name, default_version, installed_version, comment FROM pg_available_extensions WHERE installed_version IS NOT NULL ORDER BY name;`
  },
  {
    filename: '05_storage_buckets.json',
    description: 'Storage buckets',
    sql: `SELECT id, name, public, created_at FROM storage.buckets ORDER BY name;`
  },
  {
    filename: '06_policies.json',
    description: 'All RLS policies on public tables',
    sql: `SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;`
  }
];

async function runSnapshot() {
  console.log('📸 Starting Supabase schema snapshot capture...\n');

  let rowCountsData = [];

  for (const q of queries) {
    console.log(`Running query for ${q.filename} (${q.description})...`);
    try {
      let results;
      // For storage buckets, we can also try Supabase JS storage API as fallback
      if (q.filename === '05_storage_buckets.json') {
        try {
          const { data: buckets, error } = await supabase.storage.listBuckets();
          if (!error && buckets) {
            results = buckets.map(b => ({
              id: b.id,
              name: b.name,
              public: b.public,
              created_at: b.created_at
            })).sort((a, b) => a.name.localeCompare(b.name));
          } else {
            results = executeSqlQuery(q.sql);
          }
        } catch {
          results = executeSqlQuery(q.sql);
        }
      } else {
        results = executeSqlQuery(q.sql);
      }

      if (q.filename === '03_row_counts.json') {
        rowCountsData = results;
      }

      const filePath = path.join(outputDir, q.filename);
      fs.writeFileSync(filePath, JSON.stringify(results, null, 2), 'utf8');
      console.log(`  Saved ${results.length} records to ${q.filename}`);
    } catch (err) {
      console.error(`  ❌ Error processing ${q.filename}:`, err.message);
    }
  }

  console.log('\n========================================');
  console.log('📊 Table Row Counts (Public Schema):');
  console.log('========================================');
  if (rowCountsData && rowCountsData.length > 0) {
    rowCountsData.forEach(row => {
      console.log(`  - ${row.tablename}: ${row.row_count} rows`);
    });
  } else {
    console.log('  No row count data available.');
  }
  console.log('========================================\n');
  console.log('✅ Schema snapshot completed successfully!');
}

runSnapshot();
