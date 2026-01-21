import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimit } from './lib/rateLimit'

export async function middleware(request: NextRequest) {    
  const ip = request.ip || '127.0.0.1'
  const path = request.nextUrl.pathname

  // 1. Dashboard Koruması
  if (path.startsWith('/dashboard')) {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // 2. API Güvenliği (Rate Limit & Headers)
  if (path.startsWith('/api')) {
    // Rate limit kontrolü (1 dakikada 60 istek)
    const { success, limit, remaining, reset } = await rateLimit(ip)

    if (!success) {
      return new NextResponse(JSON.stringify({ 
        error: 'Too Many Requests',
        message: 'Çok fazla istek gönderdiniz. Lütfen biraz bekleyin.' 
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString()
        }
      })
    }

    const response = NextResponse.next()
    
    // Rate limit başlıklarını ekle
    response.headers.set('X-RateLimit-Limit', limit.toString())
    response.headers.set('X-RateLimit-Remaining', remaining.toString())
    response.headers.set('X-RateLimit-Reset', reset.toString())
    
    // CSP Header Ekleme
    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data:;
      font-src 'self';
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      block-all-mixed-content;
      upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim()

    response.headers.set('Content-Security-Policy', cspHeader)

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*',     // API rotaları için
    '/dashboard/:path*' // Dashboard koruması için
  ],
}
