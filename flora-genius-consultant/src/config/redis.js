const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
let redisClient = null;
let redisAvailable = false;

try {
  console.log(`[REDIS-CONSULTANT] Attempting connection to: ${redisUrl}`);
  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      if (process.env.NODE_ENV !== 'production' && times > 2) {
        console.warn('⚠️ [REDIS-CONSULTANT] Local connection failed. Disabling AI caching.');
        redisAvailable = false;
        return null;
      }
      return Math.min(times * 100, 2000);
    }
  });

  redisClient.on('connect', () => {
    console.log('✅ [REDIS-CONSULTANT] Connected successfully.');
    redisAvailable = true;
  });

  redisClient.on('error', (err) => {
    console.warn('⚠️ [REDIS-CONSULTANT] Connection error:', err.message);
    redisAvailable = false;
  });

  redisClient.on('close', () => {
    console.warn('⚠️ [REDIS-CONSULTANT] Connection closed.');
    redisAvailable = false;
  });
} catch (err) {
  console.error('❌ [REDIS-CONSULTANT] Failed to initialize Redis client:', err.message);
  redisClient = null;
  redisAvailable = false;
}

module.exports = {
  redisClient,
  redisAvailable: () => redisAvailable
};
