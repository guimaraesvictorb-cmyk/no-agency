/**
 * Edge-compatible sliding-window rate limiter.
 *
 * State lives in this module's memory per Edge instance.
 * Good enough to stop brute-force and scraping; for multi-region
 * persistence upgrade to Vercel KV or Upstash Redis.
 */

interface Window {
  count: number
  resetAt: number
}

const store = new Map<string, Window>()

/** Removes expired windows to avoid unbounded memory growth. */
function cleanup() {
  const now = Date.now()
  store.forEach((v, k) => { if (now > v.resetAt) store.delete(k) })
}

// Cleanup every minute (setInterval is available in Edge runtime)
if (typeof setInterval !== "undefined") {
  setInterval(cleanup, 60_000)
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number   // epoch ms
  retryAfter: number // seconds until reset
}

/**
 * @param key       Unique key: e.g. `login:${ip}` or `api:${ip}`
 * @param limit     Max requests allowed in the window
 * @param windowMs  Window duration in milliseconds
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  let window = store.get(key)

  if (!window || now > window.resetAt) {
    window = { count: 1, resetAt: now + windowMs }
    store.set(key, window)
    return { allowed: true, remaining: limit - 1, resetAt: window.resetAt, retryAfter: 0 }
  }

  if (window.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: window.resetAt,
      retryAfter: Math.ceil((window.resetAt - now) / 1000),
    }
  }

  window.count++
  return {
    allowed: true,
    remaining: limit - window.count,
    resetAt: window.resetAt,
    retryAfter: 0,
  }
}

/** Convenience: get the requester's IP from a Next.js Request. */
export function getIp(req: Request): string {
  return (
    req.headers.get("x-real-ip") ??
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown"
  )
}
