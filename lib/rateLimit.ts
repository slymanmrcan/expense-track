interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

// Memory leak önlemek için periyodik temizlik
setInterval(() => {
  const now = Date.now()
  for (const key in store) {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  }
}, 60000)

export async function rateLimit(ip: string, limit: number = 60, windowMs: number = 60000) {
  const now = Date.now()
  
  if (!store[ip] || store[ip].resetTime < now) {
    store[ip] = {
      count: 1,
      resetTime: now + windowMs
    }
  } else {
    store[ip].count++
  }

  const current = store[ip]
  const remaining = Math.max(0, limit - current.count)
  const reset = Math.ceil((current.resetTime - now) / 1000)

  return {
    success: current.count <= limit,
    limit,
    remaining,
    reset
  }
}
