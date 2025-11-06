import rateLimit from 'express-rate-limit';
import { RedisClientType } from 'redis';
import { getRedisClient } from '../config/redis';

// In-memory store fallback
const memoryStore = new Map<string, { count: number; resetTime: number }>();

export const createRateLimiter = (
  windowMs: number,
  max: number,
  keyGenerator?: (req: any) => string
) => {
  return async (req: any, res: any, next: any) => {
    try {
      const client = getRedisClient();
      const key = keyGenerator ? keyGenerator(req) : req.ip;
      const redisKey = `rate_limit:${key}`;

      const current = await (client as RedisClientType).get(redisKey);
      const count = current ? parseInt(current, 10) : 0;

      if (count >= max) {
        const ttl = await (client as RedisClientType).ttl(redisKey);
        return res.status(429).json({
          error: 'Too many requests',
          retryAfter: ttl,
        });
      }

      await (client as RedisClientType).incr(redisKey);
      if (count === 0) {
        await (client as RedisClientType).expire(redisKey, Math.ceil(windowMs / 1000));
      }

      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - count - 1));

      next();
    } catch (error) {
      // Fallback to memory store if Redis fails
      const key = keyGenerator ? keyGenerator(req) : req.ip;
      const memoryKey = `${key}:${Math.floor(Date.now() / windowMs)}`;
      const entry = memoryStore.get(memoryKey);

      if (entry && entry.resetTime > Date.now()) {
        if (entry.count >= max) {
          return res.status(429).json({ error: 'Too many requests' });
        }
        entry.count++;
      } else {
        memoryStore.set(memoryKey, { count: 1, resetTime: Date.now() + windowMs });
      }

      // Cleanup old entries
      for (const [k, v] of memoryStore.entries()) {
        if (v.resetTime < Date.now()) {
          memoryStore.delete(k);
        }
      }

      next();
    }
  };
};

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

export const orderRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 orders per minute
  message: 'Too many orders, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

