import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

// GET - Kategorileri listele
export async function GET(request: NextRequest) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') // 'income' veya 'outcome'

  const where: Record<string, unknown> = {}

  if (type === 'income') {
    where.isIncome = true
  } else if (type === 'outcome') {
    where.isIncome = false
  }

  const categories = await prisma.category.findMany({
    where,
    orderBy: { order: 'asc' },
  })

  return NextResponse.json({ categories })
}

// POST - Yeni kategori ekle
export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

  try {
    const { name, icon, isIncome, order } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Kategori adı zorunlu' },
        { status: 400 }
      )
    }

    const category = await prisma.category.create({
      data: {
        name,
        icon,
        isIncome: isIncome || false,
        order: order || 0,
      },
    })

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Create category error:', error)
    return NextResponse.json(
      { error: 'Kategori eklenirken hata oluştu' },
      { status: 500 }
    )
  }
}
