// In-memory rate limiter
// Restart atınca sıfırlanır - production için Redis kullanılabilir

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

// Eski kayıtları temizle (memory leak önleme)
setInterval(() => {
  const now = Date.now()
  rateLimitMap.forEach((entry, key) => {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key)
    }
  })
}, 60 * 1000) // Her dakika temizlik

interface RateLimitConfig {
  windowMs: number  // Zaman penceresi (ms)
  maxRequests: number  // Max istek sayısı
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetIn: number  // Saniye cinsinden
}

export function checkRateLimit(
  identifier: string, 
  config: RateLimitConfig = { windowMs: 60 * 1000, maxRequests: 5 }
): RateLimitResult {
  const now = Date.now()
  const entry = rateLimitMap.get(identifier)

  // Yeni kayıt veya süresi dolmuş
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    })
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetIn: Math.ceil(config.windowMs / 1000),
    }
  }

  // Limit aşıldı mı?
  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetIn: Math.ceil((entry.resetTime - now) / 1000),
    }
  }

  // Sayacı artır
  entry.count++
  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetIn: Math.ceil((entry.resetTime - now) / 1000),
  }
}

// IP adresini al (proxy arkasında da çalışır)
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  // Fallback
  return 'unknown'
}
