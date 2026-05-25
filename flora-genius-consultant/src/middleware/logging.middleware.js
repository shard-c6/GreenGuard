/**
 * Request Logging & Anomaly Detection Middleware
 * 
 * Functions:
 * 1. Detailed logging of each AI microservice request (path, payload size, duration, user, IP).
 * 2. Prompt injection suspicion detection (scanning queries for bypass terms).
 * 3. Payload size and character length anomaly audits (>800 chars query).
 * 4. Burst request frequency monitoring (in-memory sliding window for traffic alerts).
 */

const fs = require('fs');

// In-memory cache for burst traffic detection (tracks timestamps per IP or User ID in the last 60 seconds)
const requestWindowCache = new Map();
const BURST_TIME_WINDOW_MS = 60 * 1000; // 1 minute sliding window
const BURST_MAX_REQUESTS = 6;           // Max requests per minute to trigger an alert
const QUERY_LENGTH_THRESHOLD = 800;    // Character length threshold for large prompt audit

// Suspicious patterns representing potential prompt injection attempts
const SUSPICIOUS_PATTERNS = [
  /ignore\s+(?:any|previous)?\s*instruction/gi,
  /system\s+prompt/gi,
  /override\s+instruction/gi,
  /you\s+are\s+now\s+a/gi,
  /forget\s+everything/gi,
  /new\s+instruction/gi,
  /disregard\s+(?:the|above)?\s*instruction/gi,
  /translate\s+this\s+prompt/gi
];

function loggingMiddleware(req, res, next) {
  const start = Date.now();
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  
  // Calculate approximate request payload size in bytes
  const payloadSize = req.body ? Buffer.byteLength(JSON.stringify(req.body)) : 0;
  
  // ─── ANOMALY DETECTION ───
  const anomalies = [];
  const query = req.body?.query;

  // 1. Audit Query Length
  if (query && typeof query === 'string') {
    if (query.length > QUERY_LENGTH_THRESHOLD) {
      anomalies.push(`LARGE_PAYLOAD (${query.length} chars)`);
    }

    // 2. Scan for Prompt Injection keywords
    for (const pattern of SUSPICIOUS_PATTERNS) {
      if (pattern.test(query)) {
        anomalies.push(`PROMPT_INJECTION_SUSPICION (${pattern.source})`);
      }
    }
  }

  // 3. Traffic Burst Anomaly Detection
  // Identify key (User ID if authenticated, else IP address)
  const clientKey = req.user?.id || ip;
  const now = Date.now();

  if (!requestWindowCache.has(clientKey)) {
    requestWindowCache.set(clientKey, []);
  }

  const timestamps = requestWindowCache.get(clientKey);
  // Filter timestamps to only keep those within the sliding 1-minute window
  const validTimestamps = timestamps.filter(ts => now - ts < BURST_TIME_WINDOW_MS);
  validTimestamps.push(now);
  requestWindowCache.set(clientKey, validTimestamps);

  // If request rate exceeds the threshold, raise an anomaly alert
  if (validTimestamps.length > BURST_MAX_REQUESTS) {
    anomalies.push(`BURST_TRAFFIC_ANOMALY (${validTimestamps.length} req/min)`);
  }

  // Periodic cleanup of idle cache entries to prevent memory growth
  if (requestWindowCache.size > 1000) {
    for (const [key, tsArray] of requestWindowCache.entries()) {
      const active = tsArray.filter(ts => now - ts < BURST_TIME_WINDOW_MS);
      if (active.length === 0) {
        requestWindowCache.delete(key);
      } else {
        requestWindowCache.set(key, active);
      }
    }
  }

  // ─── RESPONSE INTERCEPTION FOR LOGGING ───
  // Intercept response finish event to measure time taken
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const userId = req.user?.id || 'unauthenticated';

    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      statusCode: status,
      durationMs: duration,
      payloadSizeBytes: payloadSize,
      clientIp: ip,
      userId: userId,
      anomalies: anomalies.length > 0 ? anomalies : undefined
    };

    // Format output
    let logString = `[${logEntry.timestamp}] ${logEntry.method} ${logEntry.path} - Status: ${logEntry.statusCode} (${logEntry.durationMs}ms) | Size: ${logEntry.payloadSizeBytes}B | IP: ${logEntry.clientIp} | User: ${logEntry.userId}`;
    
    if (logEntry.anomalies) {
      logString += `\n⚠️  [ANOMALY DETECTED]: ${logEntry.anomalies.join(' | ')}`;
      if (query) {
        // Escape controls for log safety
        const sanitizedQuery = query.substring(0, 100).replace(/[\r\n\t]/g, ' ');
        logString += ` | Query Snippet: "${sanitizedQuery}"`;
      }
      console.warn(logString);
    } else {
      console.log(logString);
    }
  });

  next();
}

module.exports = loggingMiddleware;
