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

// Helper to execute SQL query via Supabase CLI linked db query using temp file
function executeSqlQuery(sql) {
  const tmpDir = path.join(__dirname, '..', 'supabase', '.temp');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  const tmpFile = path.join(tmpDir, '_query.sql');
  fs.writeFileSync(tmpFile, sql, 'utf8');

  try {
    const isWin = process.platform === 'win32';
    const cmd = isWin ? 'npx.cmd' : 'supabase';
    const args = isWin
      ? ['supabase', 'db', 'query', '--linked', '-f', tmpFile, '--output-format', 'json']
      : ['db', 'query', '--linked', '-f', tmpFile, '--output-format', 'json'];

    const rawOutput = execFileSync(cmd, args, {
      encoding: 'utf8',
      cwd: path.join(__dirname, '..'),
      maxBuffer: 10 * 1024 * 1024,
      shell: true
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
  } finally {
    try { fs.unlinkSync(tmpFile); } catch {}
  }
}

async function getRowCounts() {
  console.log('Fetching exact row counts...');
  const tables = executeSqlQuery(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`);
  const rowCounts = [];

  for (const t of tables) {
    const tableName = t.table_name;
    const { count, error } = await supabase.from(tableName).select('*', { count: 'exact', head: true });
    let cnt = count;
    if (error || count === null) {
      try {
        const res = executeSqlQuery(`SELECT COUNT(*) as count FROM public."${tableName}";`);
        cnt = res && res[0] ? parseInt(res[0].count, 10) : 0;
      } catch {
        cnt = 0;
      }
    }
    rowCounts.push({
      schemaname: 'public',
      tablename: tableName,
      row_count: cnt
    });
  }

  // auth.users count
  try {
    const authResult = executeSqlQuery(`SELECT COUNT(*) as count FROM auth.users;`);
    const authCount = authResult && authResult[0] ? parseInt(authResult[0].count, 10) : 0;
    rowCounts.push({
      schemaname: 'auth',
      tablename: 'users',
      row_count: authCount
    });
  } catch (err) {
    console.error('Error counting auth.users:', err.message);
  }

  // storage.objects count
  try {
    const storageResult = executeSqlQuery(`SELECT COUNT(*) as count FROM storage.objects;`);
    const storageCount = storageResult && storageResult[0] ? parseInt(storageResult[0].count, 10) : 0;
    rowCounts.push({
      schemaname: 'storage',
      tablename: 'objects',
      row_count: storageCount
    });
  } catch (err) {
    console.error('Error counting storage.objects:', err.message);
  }

  return rowCounts;
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
    customHandler: getRowCounts
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
  },
  {
    filename: '07_indexes.json',
    description: 'All indexes on public tables',
    sql: `SELECT indexname, tablename, indexdef FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname;`
  },
  {
    filename: '08_constraints.json',
    description: 'All constraints on public tables (with definitions)',
    sql: `SELECT tc.constraint_name, tc.table_name, tc.constraint_type, pg_get_constraintdef(pgc.oid, true) AS constraint_definition, tc2.table_name AS referenced_table FROM information_schema.table_constraints tc JOIN pg_constraint pgc ON pgc.conname = tc.constraint_name AND pgc.connamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') LEFT JOIN information_schema.referential_constraints rc ON rc.constraint_name = tc.constraint_name AND rc.constraint_schema = tc.table_schema LEFT JOIN information_schema.table_constraints tc2 ON tc2.constraint_name = rc.unique_constraint_name AND tc2.table_schema = rc.unique_constraint_schema WHERE tc.table_schema = 'public' ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;`
  },
  {
    filename: '09_functions.json',
    description: 'All functions in public schema',
    sql: `SELECT routine_name AS function_name, routine_type, data_type AS return_type, routine_definition AS full_definition FROM information_schema.routines WHERE routine_schema = 'public' ORDER BY routine_name;`
  },
  {
    filename: '10_triggers.json',
    description: 'All triggers in public schema',
    sql: `SELECT trigger_name, event_manipulation, event_object_table, action_statement FROM information_schema.triggers WHERE trigger_schema = 'public';`
  }
];

function generateSnapshotSummary() {
  console.log('\n📝 Generating SNAPSHOT_SUMMARY.md...');

  const load = (name) => {
    const p = path.join(outputDir, name);
    if (!fs.existsSync(p)) return [];
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  };

  const now = new Date();
  const isoDate = now.toISOString().replace('T', ' ').replace(/\..+/, ' UTC');
  const localDate = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const rowCounts   = load('03_row_counts.json');
  const pkSchema    = load('02_plant_knowledge_schema.json');
  const extensions  = load('04_extensions.json');
  const buckets     = load('05_storage_buckets.json');
  const policies    = load('06_policies.json');
  const indexes     = load('07_indexes.json');
  const constraints = load('08_constraints.json');
  const functions   = load('09_functions.json');
  const triggers    = load('10_triggers.json');

  const fmt = (n) => Number(n || 0).toLocaleString('en-US');

  const publicRows = rowCounts.filter(r => r.schemaname === 'public');
  const otherRows  = rowCounts.filter(r => r.schemaname !== 'public');
  const totalDataRows = rowCounts.reduce((s, r) => s + (r.row_count || 0), 0);

  let md = `# Supabase Database Schema Snapshot Summary\n\n`;
  md += `**Snapshot Date & Time:** ${localDate} (${isoDate})  \n`;
  md += `**Project Ref:** \`eopmwvdmgzxoaxqqfsdq\` (GreenGuard)  \n`;
  md += `**Total rows across all captured tables:** ${fmt(totalDataRows)}\n\n`;
  md += `---\n\n`;

  md += `## 1. Tables & Row Counts\n\n`;
  md += `### Public Schema (${publicRows.length} tables)\n\n`;
  md += `| Table Name | Row Count |\n| :--- | ---: |\n`;
  for (const r of publicRows) {
    md += `| \`${r.tablename}\` | ${fmt(r.row_count)} |\n`;
  }
  if (otherRows.length > 0) {
    md += `\n### Other Schemas\n\n`;
    md += `| Schema.Table | Row Count |\n| :--- | ---: |\n`;
    for (const r of otherRows) {
      md += `| \`${r.schemaname}.${r.tablename}\` | ${fmt(r.row_count)} |\n`;
    }
  }
  md += `\n---\n\n`;

  md += `## 2. \`plant_knowledge\` Column Specification\n\n`;
  md += `Total Columns: **${pkSchema.length}**\n\n`;
  md += `| Column Name | Data Type | Nullable | Default |\n| :--- | :--- | :--- | :--- |\n`;
  for (const c of pkSchema) {
    const def = c.column_default || 'null';
    const dt = c.data_type === 'USER-DEFINED' ? `\`USER-DEFINED\` (vector)` : `\`${c.data_type}\``;
    md += `| \`${c.column_name}\` | ${dt} | ${c.is_nullable} | \`${def}\` |\n`;
  }
  md += `\n---\n\n`;

  md += `## 3. Enabled Postgres Extensions\n\n`;
  md += `Total Enabled Extensions: **${extensions.length}**\n\n`;
  md += `| Extension Name | Version | Description / Comment |\n| :--- | :--- | :--- |\n`;
  for (const e of extensions) {
    md += `| \`${e.name}\` | ${e.installed_version} | ${e.comment || ''} |\n`;
  }
  md += `\n---\n\n`;

  md += `## 4. Storage Buckets\n\n`;
  md += `Total Buckets Found: **${buckets.length}**\n\n`;
  md += `| Bucket ID / Name | Public | Created At |\n| :--- | :--- | :--- |\n`;
  for (const b of buckets) {
    md += `| \`${b.name}\` | \`${b.public}\` | ${b.created_at} |\n`;
  }
  md += `\n---\n\n`;

  const polByTable = {};
  for (const p of policies) {
    polByTable[p.tablename] = (polByTable[p.tablename] || 0) + 1;
  }
  md += `## 5. RLS Policies Count per Table\n\n`;
  md += `Total RLS Policies: **${policies.length}**\n\n`;
  md += `| Table Name | Policy Count |\n| :--- | :--- |\n`;
  for (const [tbl, cnt] of Object.entries(polByTable)) {
    md += `| \`${tbl}\` | ${cnt} |\n`;
  }
  md += `\n---\n\n`;

  md += `## 6. Indexes\n\n`;
  md += `Total Indexes: **${indexes.length}**\n\n`;
  md += `| Table | Index Name | Definition |\n| :--- | :--- | :--- |\n`;
  for (const idx of indexes) {
    md += `| \`${idx.tablename}\` | \`${idx.indexname}\` | \`${idx.indexdef}\` |\n`;
  }
  md += `\n---\n\n`;

  const checkCount = constraints.filter(c => c.constraint_type === 'CHECK').length;
  const fkCount    = constraints.filter(c => c.constraint_type === 'FOREIGN KEY').length;
  const pkCount    = constraints.filter(c => c.constraint_type === 'PRIMARY KEY').length;
  const uniqueCount= constraints.filter(c => c.constraint_type === 'UNIQUE').length;

  md += `## 7. Constraints\n\n`;
  md += `Total Constraints: **${constraints.length}** (${checkCount} CHECK, ${fkCount} FOREIGN KEY, ${pkCount} PRIMARY KEY, ${uniqueCount} UNIQUE)\n\n`;
  md += `| Table | Constraint Name | Type | Definition | References |\n| :--- | :--- | :--- | :--- | :--- |\n`;
  for (const c of constraints) {
    const ref = c.referenced_table ? `\`${c.referenced_table}\`` : '';
    md += `| \`${c.table_name}\` | \`${c.constraint_name}\` | ${c.constraint_type} | \`${c.constraint_definition || ''}\` | ${ref} |\n`;
  }
  md += `\n---\n\n`;

  md += `## 8. Functions\n\n`;
  md += `Total Functions: **${functions.length}**\n\n`;
  md += `| Function Name | Routine Type | Return Type |\n| :--- | :--- | :--- |\n`;
  for (const f of functions) {
    md += `| \`${f.function_name}\` | ${f.routine_type} | \`${f.return_type || ''}\` |\n`;
  }
  md += `\n> Full function definitions are in \`09_functions.json\`.\n\n`;
  md += `---\n\n`;

  md += `## 9. Triggers\n\n`;
  md += `Total Triggers: **${triggers.length}**\n\n`;
  if (triggers.length > 0) {
    md += `| Trigger Name | Table | Event | Statement |\n| :--- | :--- | :--- | :--- |\n`;
    for (const tr of triggers) {
      md += `| \`${tr.trigger_name}\` | \`${tr.event_object_table}\` | ${tr.event_manipulation} | \`${tr.action_statement}\` |\n`;
    }
  } else {
    md += `_No triggers found._\n`;
  }
  md += `\n`;

  const summaryPath = path.join(outputDir, 'SNAPSHOT_SUMMARY.md');
  fs.writeFileSync(summaryPath, md, 'utf8');
  console.log(`  ✅ Saved SNAPSHOT_SUMMARY.md`);
}

async function runSnapshot() {
  console.log('📸 Starting Supabase schema snapshot capture...\n');

  let rowCountsData = [];

  for (const q of queries) {
    console.log(`Running query for ${q.filename} (${q.description})...`);
    try {
      let results;
      if (q.customHandler) {
        results = await q.customHandler();
      } else if (q.filename === '05_storage_buckets.json') {
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
  console.log('📊 Table Row Counts (Public Schema + auth/storage):');
  console.log('========================================');
  if (rowCountsData && rowCountsData.length > 0) {
    rowCountsData.forEach(row => {
      console.log(`  - ${row.schemaname}.${row.tablename}: ${row.row_count} rows`);
    });
  } else {
    console.log('  No row count data available.');
  }
  console.log('========================================\n');

  generateSnapshotSummary();

  console.log('\n✅ Schema snapshot completed successfully!');
}

runSnapshot();

