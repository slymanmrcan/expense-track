import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

// GET - Harcamaları listele
export async function GET(request: NextRequest) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const month = searchParams.get('month')
  const year = searchParams.get('year')
  const type = searchParams.get('type')
  const categoryId = searchParams.get('categoryId')

  const where: Record<string, unknown> = { userId: user.id }

  if (month && year) {
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)
    where.date = { gte: startDate, lte: endDate }
  } else if (year) {
    const startDate = new Date(parseInt(year), 0, 1)
    const endDate = new Date(parseInt(year), 11, 31, 23, 59, 59)
    where.date = { gte: startDate, lte: endDate }
  }

  if (type) {
    where.type = type
  }

  if (categoryId) {
    where.categoryId = categoryId
  }

  const expenses = await prisma.expense.findMany({
    where,
    include: { category: true },
    orderBy: { date: 'desc' },
  })

  return NextResponse.json({ expenses })
}

// POST - Yeni harcama ekle
export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

  try {
    const { amount, type, categoryId, description, location, date } = await request.json()

    if (!amount || !categoryId) {
      return NextResponse.json(
        { error: 'Tutar ve kategori zorunlu' },
        { status: 400 }
      )
    }

    const expense = await prisma.expense.create({
      data: {
        amount,
        type: type || 'OUTCOME',
        categoryId,
        description,
        location,
        date: date ? new Date(date) : new Date(),
        userId: user.id,
      },
      include: { category: true },
    })

    return NextResponse.json({ expense })
  } catch (error) {
    console.error('Create expense error:', error)
    return NextResponse.json(
      { error: 'Harcama eklenirken hata oluştu' },
      { status: 500 }
    )
  }
}
