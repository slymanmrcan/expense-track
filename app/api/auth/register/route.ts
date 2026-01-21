import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { createToken, setAuthCookie } from '@/lib/auth'


export async function POST(request: NextRequest) {
  try {


    const { firstName, lastName, email, username, password } = await request.json()

    if (!firstName || !lastName || !email || !username || !password) {
      return NextResponse.json(
        { error: 'Tüm alanlar zorunlu' },
        { status: 400 }
      )
    }

    // Kullanıcı adı veya email kontrolü
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu kullanıcı adı veya email zaten kullanılıyor' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        username,
        password: hashedPassword,
      },
    })

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
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Kayıt olurken hata oluştu' },
      { status: 500 }
    )
  }
}
