import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { createToken, setAuthCookie } from '@/lib/auth'
import { checkRateLimit, getClientIP } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  try {
    // Rate limit kontrolü - 1 dakikada max 5 deneme
    const ip = getClientIP(request)
    const rateLimit = checkRateLimit(`login:${ip}`, { windowMs: 60 * 1000, maxRequests: 5 })
    
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: `Çok fazla deneme. ${rateLimit.resetIn} saniye sonra tekrar deneyin.` },
        { status: 429 }
      )
    }

    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Kullanıcı adı ve şifre gerekli' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { username },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 401 }
      )
    }

    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Şifre hatalı' },
        { status: 401 }
      )
    }

    const token = await createToken({
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    })

    await setAuthCookie(token)

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Giriş yapılırken hata oluştu' },
      { status: 500 }
    )
  }
}
