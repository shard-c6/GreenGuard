require('dotenv').config();

const requiredVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
];

for (const varName of requiredVars) {
  if (!process.env[varName]) {
    console.error(`❌ Missing required environment variable: ${varName}`);
    console.error('   Copy .env.example to .env and fill in your Supabase credentials.');
    process.exit(1);
  }
}

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  n8nWebhookUrl: process.env.N8N_WEBHOOK_URL || '',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 5,
  maxImagesPerPlant: parseInt(process.env.MAX_IMAGES_PER_PLANT, 10) || 3,
  adminEmail: process.env.ADMIN_EMAIL || 'admin@greenguard.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'changeme',
  adminUsername: process.env.ADMIN_USERNAME || 'admin',
  /** Optional — smart care alerts (Gemini 1.5 Flash REST) */
  geminiApiKey: process.env.GEMINI_API_KEY || '',
};
