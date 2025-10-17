// src/lib/middleware/rateLimit.ts
// Simple in-memory rate limiter

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

const store: RateLimitStore = {};

export function rateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const key = identifier;

  // Clean up expired entries
  if (store[key] && store[key].resetAt < now) {
    delete store[key];
  }

  // Initialize or increment
  if (!store[key]) {
    store[key] = {
      count: 1,
      resetAt: now + windowMs,
    };
    return { allowed: true, remaining: limit - 1 };
  }

  store[key].count++;

  if (store[key].count > limit) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: limit - store[key].count };
}

// Helper for API routes
export function getRateLimitKey(req: Request): string {
  // Use IP or user identifier
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return ip;
}
