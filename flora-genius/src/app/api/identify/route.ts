import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ensureStorageBucket } from '@/lib/supabase';
import axios, { AxiosError } from 'axios';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

interface N8nPayload {
  type: 'image' | 'text';
  input: string;
}

interface IdentifyResult {
  common_name?: string;
  scientific_name?: string;
  confidence?: number;
  co2?: string;
  oxygen?: string;
  uses?: string;
  fact?: string;
  description?: string;
  valid?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    // 0. Setup Auth & Service Client
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase credentials');
      return NextResponse.json({ error: 'Server configuration error: Missing Supabase credentials' }, { status: 500 });
    }

    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    
    // We use service role for persistence to bypass RLS restrictions if necessary
    // But we still verify the user's identity via the token
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    let userId: string | null = null;
    if (token) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (!authError && user) {
        userId = user.id;
      }
    }
    
    // Ensure the storage bucket exists
    await ensureStorageBucket();
    
    const formData = await req.formData();
    const file = formData.get('image') as File;
    const type = formData.get('type') as string || 'image';

    if (!file && type === 'image') {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const n8nPayload: N8nPayload = {
      type: type === 'text' ? 'text' : 'image',
      input: '',
    };

    if (type === 'image' && file) {
      // 1. Upload to Supabase Storage
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
      const { error: uploadError } = await supabase.storage
        .from('flora-scans')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        return NextResponse.json({ error: 'Failed to upload image to storage' }, { status: 500 });
      }

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('flora-scans')
        .getPublicUrl(fileName);

      n8nPayload.input = publicUrl;
    } else {
      n8nPayload.input = formData.get('input') as string;
    }

    // 3. Call n8n Webhook
    const n8nUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/plant-detect';
    const plantnetKey = process.env.PLANTNET_API_KEY;
    
    try {
      const n8nResponse = await axios.post<IdentifyResult>(n8nUrl, n8nPayload, {
        timeout: 20000,
        headers: { 
          'Content-Type': 'application/json',
          'X-PlantNet-API-Key': plantnetKey || ''
        }
      });

      const aiData = n8nResponse.data;

      // 4. PERSISTENCE: Save to GreenGuard 'plants' table if user is authenticated
      if (userId && aiData && aiData.valid !== false) {
        try {
          const { error: dbError } = await supabase
            .from('plants')
            .insert({
              ngo_id: userId, // Current user becomes the owner/reporter
              plant_name: aiData.common_name || 'Unknown Plant',
              species: aiData.scientific_name || null,
              description: aiData.fact || aiData.description || null,
              image_urls: n8nPayload.type === 'image' ? [n8nPayload.input] : [],
              ai_profile: aiData,
              adoption_status: 'available'
            });

          if (dbError) console.error('Persistence error:', dbError);
          else console.log('Scan saved to GreenGuard successfully');
        } catch (dbErr) {
          console.error('Database write failed:', dbErr);
        }
      }

      return NextResponse.json({
        success: true,
        data: aiData
      });
    } catch (n8nError) {
      const error = n8nError as AxiosError;
      console.error('n8n error:', error.message);
      return NextResponse.json({ 
        error: 'AI service timed out or returned an error. Check if n8n is running locally.',
        details: error.message 
      }, { status: 502 });
    }

  } catch (error) {
    console.error('Identification API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
