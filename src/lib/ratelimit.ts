import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60,
});

export async function checkRateLimit(key: string): Promise<boolean> {
  try {
    await rateLimiter.consume(key);
    return true;
  } catch {
    return false;
  }
}
