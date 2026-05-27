const crypto = require('crypto');
const { redisClient, redisAvailable } = require('../config/redis');

/**
 * Generates a SHA-256 hash of a file buffer to uniquely identify images.
 * @param {Buffer} buffer 
 * @returns {string} hex hash
 */
function getHash(buffer) {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error('Input must be a valid Buffer');
  }
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Generates a unique key based on scientific name and user query.
 * @param {string} scientificName 
 * @param {string} query 
 * @returns {string} md5 hash key
 */
function getQueryKey(scientificName, query) {
  const normalized = `${(scientificName || '').trim().toLowerCase()}:${(query || '').trim().toLowerCase()}`;
  const md5 = crypto.createHash('md5').update(normalized).digest('hex');
  return md5;
}

/**
 * Retrieve cached value from Redis.
 * @param {string} key 
 * @returns {Promise<any | null>} parsed JSON/string or null
 */
async function get(key) {
  if (!redisAvailable() || !redisClient) {
    return null;
  }
  try {
    const val = await redisClient.get(key);
    if (!val) return null;
    
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  } catch (err) {
    console.warn(`⚠️ [CACHE] Failed to get key "${key}":`, err.message);
    return null;
  }
}

/**
 * Write value to Redis cache with optional TTL.
 * @param {string} key 
 * @param {any} value - Will be serialized to JSON if it's an object
 * @param {number} [ttlSeconds] - optional time-to-live in seconds
 */
async function set(key, value, ttlSeconds = null) {
  if (!redisAvailable() || !redisClient) {
    return;
  }
  try {
    const valStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
    if (ttlSeconds) {
      await redisClient.set(key, valStr, 'EX', ttlSeconds);
    } else {
      await redisClient.set(key, valStr);
    }
  } catch (err) {
    console.warn(`⚠️ [CACHE] Failed to set key "${key}":`, err.message);
  }
}

module.exports = {
  getHash,
  getQueryKey,
  get,
  set
};
