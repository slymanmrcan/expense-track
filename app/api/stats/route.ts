import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const months = parseInt(searchParams.get('months') || '6')

  // Son X ay için istatistikler
  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1)

  const expenses = await prisma.expense.findMany({
    where: {
      userId: user.id,
      date: { gte: startDate },
    },
    include: { category: true },
    orderBy: { date: 'asc' },
  })

  // Aylık toplam hesapla
  const monthlyStats: Record<string, { income: number; outcome: number; month: string }> = {}
  
  for (let i = 0; i < months; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - months + 1 + i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
    monthlyStats[key] = { income: 0, outcome: 0, month: monthNames[d.getMonth()] }
  }

  expenses.forEach(exp => {
    const d = new Date(exp.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (monthlyStats[key]) {
      const amount = Number(exp.amount)
      if (exp.type === 'INCOME') {
        monthlyStats[key].income += amount
      } else {
        monthlyStats[key].outcome += amount
      }
    }
  })

  // Kategori bazlı toplam (sadece çıkışlar)
  const categoryStats: Record<string, { name: string; icon: string; total: number }> = {}
  
  expenses
    .filter(exp => exp.type === 'OUTCOME')
    .forEach(exp => {
      if (!categoryStats[exp.categoryId]) {
        categoryStats[exp.categoryId] = {
          name: exp.category.name,
          icon: exp.category.icon || '📦',
          total: 0,
        }
      }
      categoryStats[exp.categoryId].total += Number(exp.amount)
    })

  // Bu ay toplam
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const thisMonthExpenses = expenses.filter(exp => new Date(exp.date) >= thisMonth)
  
  const thisMonthIncome = thisMonthExpenses
    .filter(exp => exp.type === 'INCOME')
    .reduce((sum, exp) => sum + Number(exp.amount), 0)
  
  const thisMonthOutcome = thisMonthExpenses
    .filter(exp => exp.type === 'OUTCOME')
    .reduce((sum, exp) => sum + Number(exp.amount), 0)

  return NextResponse.json({
    monthly: Object.values(monthlyStats),
    categories: Object.values(categoryStats)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10),
    thisMonth: {
      income: thisMonthIncome,
      outcome: thisMonthOutcome,
      balance: thisMonthIncome - thisMonthOutcome,
    },
  })
}
