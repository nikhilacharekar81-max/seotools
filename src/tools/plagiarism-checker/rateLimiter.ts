import express from 'express';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}
const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_LIMIT = Number(process.env.RATE_LIMIT_LIMIT) || 50; 
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 60 * 1000;

export function apiRateLimiter(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown-ip');
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS
    });
    return next();
  }

  if (entry.count >= RATE_LIMIT_LIMIT) {
    return res.status(429).json({
      error: 'Rate Limit Exceeded: You have exceeded the permitted plagiarism scans for this period. Please try again later.'
    });
  }

  entry.count++;
  rateLimitMap.set(ip, entry);
  next();
}
