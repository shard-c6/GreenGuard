require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { redisClient, redisAvailable } = require('./config/redis');
const { createClient } = require('@supabase/supabase-js');
const plantnet = require('./services/plantnet.service');
const gemini = require('./services/gemini.service');
const cache = require('./services/cache.service');
const authMiddleware = require('./middleware/auth.middleware');
const xssMiddleware = require('./middleware/xss.middleware');
const apiKeyMiddleware = require('./middleware/apiKey.middleware');
const loggingMiddleware = require('./middleware/logging.middleware');


const app = express();

// Trust proxy for rate limiter to correctly see client IP when running behind proxies
app.set('trust proxy', 1);

// Configure multer with strict limits (5MB max image size)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

// Configuration
const PORT = process.env.PORT || 5002;
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Body Parser with strict limit (1MB max body payload)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Input Sanitization (XSS mitigation)
app.use(xssMiddleware);

// Global Request Logger & Anomaly Detector (placed after body parsing so req.body can be scanned)
app.use(loggingMiddleware);

// Security Headers
app.use(helmet());

// CORS Configuration - restrict to trusted origins
const allowedOrigins = [];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}
// Default development origins - only added in non-production environments
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173');
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
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
}));

// Rate Limiter — 10 requests per 15 minutes per user
const consultantLimiterOpts = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  validate: { keyGeneratorIpFallback: false },
  keyGenerator: (req) => req.user?.id || req.ip,
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' },
  },
};

if (redisAvailable() && redisClient) {
  consultantLimiterOpts.store = new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
    prefix: 'flora:limiter:consultant:',
  });
}

const consultantLimiter = rateLimit(consultantLimiterOpts);


app.get('/', (req, res) => {
  res.send('Flora Genius AI is running!');
});



/**
 * Endpoint 1: Identify Plant via PlantNet
 */
app.post('/api/consultant/identify', apiKeyMiddleware, authMiddleware, consultantLimiter, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Image is required' });
    
    const imageHash = cache.getHash(req.file.buffer);
    const cacheKey = `flora:plantnet:${imageHash}`;
    
    const cachedResult = await cache.get(cacheKey);
    if (cachedResult) {
      console.log(`[CACHE HIT] Serving PlantNet result from Redis for image hash: ${imageHash}`);
      return res.json({ success: true, data: cachedResult, source: 'cache' });
    }

    const identification = await plantnet.identifyPlant(req.file.buffer, req.file.originalname, req.file.mimetype);
    
    await cache.set(cacheKey, identification, 7 * 24 * 60 * 60); // Cache for 7 days
    
    res.json({ success: true, data: identification, source: 'api' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/consultant/expert', apiKeyMiddleware, authMiddleware, consultantLimiter, upload.single('image'), async (req, res) => {
  let { scientificName, query, history } = req.body;
  
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  // Strict validation of query types and lengths
  if (typeof query !== 'string' || query.trim().length === 0 || query.length > 1000) {
    return res.status(400).json({ error: 'Invalid query length/type (max 1000 chars)' });
  }

  if (scientificName && (typeof scientificName !== 'string' || scientificName.trim().length === 0 || scientificName.length > 100)) {
    return res.status(400).json({ error: 'Invalid scientific name length/type (max 100 chars)' });
  }

  // Parse history string if sent as a multipart/form-data field
  let historyParsed = history;
  if (typeof history === 'string') {
    try {
      historyParsed = JSON.parse(history);
    } catch (e) {
      historyParsed = [];
    }
  }

  try {
    let identifiedPlant = null;
    let imageHash = null;

    if (req.file) {
      imageHash = cache.getHash(req.file.buffer);
    }

    // Auto-identification: Run PlantNet identification if an image is uploaded and scientificName is unspecified
    if (req.file && (!scientificName || scientificName === 'General Plants' || scientificName.trim() === '')) {
      const plantnetCacheKey = `flora:plantnet:${imageHash}`;
      const cachedPlant = await cache.get(plantnetCacheKey);
      
      if (cachedPlant) {
        console.log(`[CACHE HIT] Serving Auto-Identified plant from cache: ${cachedPlant.scientific_name}`);
        scientificName = cachedPlant.scientific_name;
        identifiedPlant = {
          scientificName: cachedPlant.scientific_name,
          commonName: cachedPlant.common_name,
          confidence: cachedPlant.confidence
        };
      } else {
        try {
          console.log('[AUTO-IDENTIFY] Image uploaded without plant context. Initiating identification...');
          const identification = await plantnet.identifyPlant(req.file.buffer, req.file.originalname, req.file.mimetype);
          
          scientificName = identification.scientific_name;
          identifiedPlant = {
            scientificName: identification.scientific_name,
            commonName: identification.common_name,
            confidence: identification.confidence
          };
          
          // Cache PlantNet result
          await cache.set(plantnetCacheKey, identification, 7 * 24 * 60 * 60);
          console.log(`[AUTO-IDENTIFY SUCCESS] Identified plant as: ${identification.scientific_name} (${identification.common_name})`);
        } catch (identError) {
          console.warn(`[AUTO-IDENTIFY WARNING] PlantNet failed: ${identError.message}. Falling back to General Plants.`);
          scientificName = 'General Plants';
        }
      }
    }

    // Attempt to serve the entire Gemini consultation from cache if it exists
    const geminiQueryMd5 = cache.getQueryKey(scientificName || 'General Plants', query);
    const geminiCacheKey = imageHash 
      ? `flora:gemini:${geminiQueryMd5}:${imageHash}`
      : `flora:gemini:${geminiQueryMd5}`;
      
    const cachedAnswer = await cache.get(geminiCacheKey);
    if (cachedAnswer) {
      console.log(`[CACHE HIT] Serving Gemini expert advice from Redis for key: ${geminiCacheKey}`);
      return res.json({ 
        success: true, 
        answer: cachedAnswer, 
        identifiedPlant: identifiedPlant,
        source: 'cache'
      });
    }

    let context = '';
    
    // Execute RAG similarity search if we have a valid plant context (i.e. not General Plants)
    if (scientificName && scientificName !== 'General Plants' && scientificName.trim() !== '') {
      const vectorCacheKey = `flora:vector:${geminiQueryMd5}`;
      
      // Try fetching context from cache
      const cachedContext = await cache.get(vectorCacheKey);
      if (cachedContext !== null) {
        console.log(`[CACHE HIT] Serving RAG vector search context from Redis for key: ${vectorCacheKey}`);
        context = cachedContext;
      } else {
        console.log(`[CACHE MISS] Running vector similarity RAG search on Supabase for scientificName: ${scientificName}`);
        // 1. Generate query expansions
        const expandedQueries = await gemini.expandQuery(query);
        const allQueries = [query, ...expandedQueries];
        
        // 2. Execute parallel searches
        const searchPromises = allQueries.map(async (q) => {
          try {
            const qEmbedding = await gemini.getEmbedding(q);
            const { data, error } = await supabase.rpc('hybrid_plant_search', {
              query_text: q,
              query_embedding: qEmbedding,
              match_threshold: 0.2,
              match_count: 3
            });
            if (error) throw error;
            return data || [];
          } catch (err) {
            const sanitizedQ = typeof q === 'string' ? q.replace(/[\r\n]/g, '_') : '';
            console.error(`Search failed for variant "${sanitizedQ}":`, err.message);
            return [];
          }
        });
        
        const resultsArray = await Promise.all(searchPromises);
        
        // 3. Flatten and Deduplicate results
        const uniqueChunksMap = new Map();
        resultsArray.flat().forEach(chunk => {
          if (chunk && chunk.id) {
            uniqueChunksMap.set(chunk.id, chunk);
          } else if (chunk && chunk.content) {
            uniqueChunksMap.set(chunk.content.substring(0, 50), chunk);
          }
        });
        
        const contextChunks = Array.from(uniqueChunksMap.values());
    
        // 4. Reranking / Context Preparation
        const sortedChunks = contextChunks.sort((a, b) => {
          const aMatch = a.scientific_name && a.scientific_name.toLowerCase() === scientificName.toLowerCase();
          const bMatch = b.scientific_name && b.scientific_name.toLowerCase() === scientificName.toLowerCase();
          return bMatch - aMatch;
        });
    
        context = sortedChunks.map(c => c.content).join('\n\n');
        
        // Cache vector context search for 24 hours
        await cache.set(vectorCacheKey, context, 24 * 60 * 60);
      }
    }

    // 5. Ask Gemini using optional multi-modal image buffers
    const response = await gemini.askExpert(
      scientificName || 'General Plants',
      context,
      query,
      historyParsed || [],
      req.file ? req.file.buffer : null,
      req.file ? req.file.mimetype : null
    );
    
    // Cache the advice for 12 hours
    await cache.set(geminiCacheKey, response, 12 * 60 * 60);
    
    res.json({ 
      success: true, 
      answer: response, 
      identifiedPlant: identifiedPlant,
      source: 'api'
    });
  } catch (error) {
    console.error('Expert API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Flora Genius Consultant running on http://localhost:${PORT}`);
});
