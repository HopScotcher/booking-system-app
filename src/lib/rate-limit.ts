interface RateLimitConfig {
  interval: number
  uniqueTokenPerInterval: number
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

class RateLimiter {
  private tokens: Map<string, { count: number; resetTime: number }> = new Map()
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  async check(identifier: string, limit: number): Promise<RateLimitResult> {
    const now = Date.now()
    const key = `${identifier}:${Math.floor(now / this.config.interval)}`
    
    const current = this.tokens.get(key)
    
    if (!current || now > current.resetTime) {
      // First request or interval expired
      this.tokens.set(key, {
        count: 1,
        resetTime: now + this.config.interval,
      })
      
      return {
        success: true,
        limit,
        remaining: limit - 1,
        reset: now + this.config.interval,
      }
    }
    
    if (current.count >= limit) {
      // Rate limit exceeded
      return {
        success: false,
        limit,
        remaining: 0,
        reset: current.resetTime,
      }
    }
    
    // Increment counter
    current.count++
    this.tokens.set(key, current)
    
    return {
      success: true,
      limit,
      remaining: limit - current.count,
      reset: current.resetTime,
    }
  }

  // Clean up expired entries periodically
  cleanup() {
    const now = Date.now()
    for (const [key, value] of this.tokens.entries()) {
      if (now > value.resetTime) {
        this.tokens.delete(key)
      }
    }
  }
}

// Clean up expired entries every 5 minutes
setInterval(() => {
  // This will run in development, but in production you might want
  // to use a more sophisticated cleanup mechanism
}, 5 * 60 * 1000)

export function rateLimit(config: RateLimitConfig): RateLimiter {
  return new RateLimiter(config)
}
