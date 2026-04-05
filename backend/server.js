const app = require('./app');
const env = require('./src/config/env');

const PORT = env.port;

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════╗
  ║                                                   ║
  ║   🌱  Green Guard v2 API Server                   ║
  ║                                                   ║
  ║   Environment : ${env.nodeEnv.padEnd(20)}          ║
  ║   Port        : ${String(PORT).padEnd(20)}         ║
  ║   Supabase    : ${env.supabaseUrl ? '✅ Connected' : '❌ Not configured'}               ║
  ║   n8n Webhook : ${env.n8nWebhookUrl ? '✅ Set' : '⏳ Not set'}                     ║
  ║                                                   ║
  ║   API Base    : http://localhost:${PORT}/api        ║
  ║   Health      : http://localhost:${PORT}/api/health ║
  ║                                                   ║
  ╚═══════════════════════════════════════════════════╝
  `);
});
