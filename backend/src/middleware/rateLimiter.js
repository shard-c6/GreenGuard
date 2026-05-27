const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { redisClient, redisAvailable } = require('../config/redis');

const createLimiter = (options) => {
  const limiterOpts = {
    ...options,
    standardHeaders: true,
    legacyHeaders: false,
  };

  if (redisAvailable() && redisClient) {
    limiterOpts.store = new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
      prefix: `greenguard:limiter:${options.prefix || 'general'}:`,
    });
  }

  return rateLimit(limiterOpts);
};

// General API rate limiter — 100 requests per 15 minutes
const generalLimiter = createLimiter({
  prefix: 'general',
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' },
  },
});

// Strict limiter for auth routes — 20 requests per 15 minutes
const authLimiter = createLimiter({
  prefix: 'auth',
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Too many authentication attempts. Please try again later.' },
  },
});

// AI endpoint limiter — 10 requests per 15 minutes (protect API quotas)
const aiLimiter = createLimiter({
  prefix: 'ai',
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'AI identification limit reached. Please try again later.' },
  },
});

module.exports = { generalLimiter, authLimiter, aiLimiter };
