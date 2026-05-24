const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./src/config/env');
const errorHandler = require('./src/middleware/errorHandler');
const { generalLimiter } = require('./src/middleware/rateLimiter');

// Routes
const authRoutes = require('./src/routes/auth.routes');
const adminRoutes = require('./src/routes/admin.routes');
const ngoRoutes = require('./src/routes/ngo.routes');
const plantRoutes = require('./src/routes/plant.routes');
const adoptionRoutes = require('./src/routes/adoption.routes');
const postRoutes = require('./src/routes/post.routes');
const profileRoutes = require('./src/routes/profile.routes');
const reportRoutes = require('./src/routes/report.routes');
const notificationRoutes = require('./src/routes/notification.routes');
const smartAlertRoutes = require('./routes/notifications');
const aiRoutes = require('./src/routes/ai.routes');
const savedPlantRoutes = require('./routes/savedPlants');

const app = express();

// Trust proxy is required when app is behind Hugging Face Spaces load balancer for rate limiting
app.set('trust proxy', 1);

// ─── Security ───────────────────────────────────────────────────
app.use(helmet());

const allowedOrigins = [env.frontendUrl];
if (env.nodeEnv === 'development' || env.nodeEnv === 'test') {
  allowedOrigins.push('http://localhost:3000', 'http://localhost:3001');
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Parsing ────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Input Sanitization (XSS Mitigation) ──────────────────────────
const xssMiddleware = require('./src/middleware/xss.middleware');
app.use(xssMiddleware);

// ─── Logging ────────────────────────────────────────────────────
if (env.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// ─── Rate Limiting ──────────────────────────────────────────────
app.use('/api/', generalLimiter);

// ─── Supabase Request-Context Middleware ──────────────────────────
const { getSupabaseClient, supabaseLocalStorage } = require('./src/config/supabase');

app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }
  
  const userClient = getSupabaseClient(token);
  req.supabase = userClient;
  
  supabaseLocalStorage.run({ userClient }, () => {
    next();
  });
});


// ─── Health Check ───────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: env.nodeEnv,
    },
  });
});

// ─── API Routes ─────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ngo', ngoRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/adoptions', adoptionRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', smartAlertRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/saved-plants', savedPlantRoutes);

// ─── 404 Handler ────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.url} not found` },
  });
});

// ─── Global Error Handler ───────────────────────────────────────
app.use(errorHandler);

module.exports = app;
