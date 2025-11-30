import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

// GET - Tek harcama getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

  const { id } = await params

  const expense = await prisma.expense.findFirst({
    where: { id, userId: user.id },
    include: { category: true },
  })

  if (!expense) {
    return NextResponse.json({ error: 'Harcama bulunamadı' }, { status: 404 })
  }

  return NextResponse.json({ expense })
}

// PUT - Harcama güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

  const { id } = await params

  try {
    const { amount, type, categoryId, description, location, date } = await request.json()

    // Kullanıcıya ait mi kontrol et
    const existing = await prisma.expense.findFirst({
      where: { id, userId: user.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Harcama bulunamadı' }, { status: 404 })
    }

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        amount,
        type,
        categoryId,
        description,
        location,
        date: date ? new Date(date) : undefined,
      },
      include: { category: true },
    })

    return NextResponse.json({ expense })
  } catch (error) {
    console.error('Update expense error:', error)
    return NextResponse.json(
      { error: 'Harcama güncellenirken hata oluştu' },
      { status: 500 }
    )
  }
}

// DELETE - Harcama sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

  const { id } = await params

  try {
    // Kullanıcıya ait mi kontrol et
    const existing = await prisma.expense.findFirst({
      where: { id, userId: user.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Harcama bulunamadı' }, { status: 404 })
    }

    await prisma.expense.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete expense error:', error)
    return NextResponse.json(
      { error: 'Harcama silinirken hata oluştu' },
      { status: 500 }
    )
  }
}
