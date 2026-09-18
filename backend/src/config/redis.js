const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
// The null initialiser is the defensive default for the catch path below: if
// `new Redis()` throws, callers must see null rather than undefined. The rule
// only sees the reassignment, not the throw path.
// eslint-disable-next-line no-useless-assignment
let redisClient = null;
let redisAvailable = false;

try {
  console.log(`[REDIS] Attempting connection to: ${redisUrl}`);
  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      // Limit retries in local/non-production to avoid hanging tests or dev servers
      if (process.env.NODE_ENV !== 'production' && times > 2) {
        console.warn('⚠️ [REDIS] Local connection failed. Disabling caching and falling back to memory/DB.');
        redisAvailable = false;
        return null; // Stop retrying
      }
      return Math.min(times * 100, 2000);
    }
  });

  redisClient.on('connect', () => {
    console.log('✅ [REDIS] Connected successfully.');
    redisAvailable = true;
  });

  redisClient.on('error', (err) => {
    console.warn('⚠️ [REDIS] Connection error:', err.message);
    redisAvailable = false;
  });

  redisClient.on('close', () => {
    console.warn('⚠️ [REDIS] Connection closed.');
    redisAvailable = false;
  });
} catch (err) {
  console.error('❌ [REDIS] Failed to initialize Redis client:', err.message);
  redisClient = null;
  redisAvailable = false;
}

module.exports = {
  redisClient,
  redisAvailable: () => redisAvailable
};
