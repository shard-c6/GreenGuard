import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

// Default client (respects RLS)
export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

// Admin client (bypasses RLS - use ONLY for administrative tasks)
export const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey || '');

/**
 * Ensures the flora-scans bucket exists with public access
 * Uses supabaseAdmin to bypass restriction on bucket management
 */
export async function ensureStorageBucket() {
  const { data: buckets, error } = await supabaseAdmin.storage.listBuckets();
  
  if (error) {
    console.error('Error fetching buckets:', error);
    return;
  }

  const exists = buckets.find(b => b.id === 'flora-scans');
  
  if (!exists) {
    const { error: createError } = await supabaseAdmin.storage.createBucket('flora-scans', {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    });
    
    if (createError) {
      console.error('Error creating bucket:', createError);
    } else {
      console.log('Bucket "flora-scans" created successfully');
    }
  }
}

// Allow manual initialization via: npx tsx src/lib/supabase.ts
if (require.main === module || (typeof process !== 'undefined' && process.argv[1]?.endsWith('supabase.ts'))) {
  ensureStorageBucket().then(() => console.log('Storage check complete.'));
}
