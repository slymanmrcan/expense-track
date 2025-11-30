'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import ExpenseForm from '@/components/ExpenseForm'
import ExpenseList from '@/components/ExpenseList'
import StatsModal from '@/components/StatsModal'

interface Category {
  id: string
  name: string
  icon: string | null
}

interface Expense {
  id: string
  amount: number
  type: 'INCOME' | 'OUTCOME'
  description: string | null
  location: string | null
  date: string
  categoryId: string
  category: Category
}

interface User {
  id: string
  username: string
  firstName: string
  lastName: string
}

interface StatsData {
  monthly: { month: string; income: number; outcome: number }[]
  categories: { name: string; icon: string; total: number }[]
  thisMonth: { income: number; outcome: number; balance: number }
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [stats, setStats] = useState<StatsData | null>(null)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [loading, setLoading] = useState(true)
  const [showStats, setShowStats] = useState(false)

  const fetchExpenses = useCallback(async () => {
    const now = new Date()
    const res = await fetch(`/api/expenses?month=${now.getMonth() + 1}&year=${now.getFullYear()}`)
    const data = await res.json()
    setExpenses(data.expenses || [])
  }, [])

  const fetchStats = useCallback(async () => {
    const res = await fetch('/api/stats?months=6')
    const data = await res.json()
    setStats(data)
  }, [])

  const checkAuth = useCallback(async () => {
    const res = await fetch('/api/auth/me')
    const data = await res.json()
    if (!data.user) {
      router.push('/')
      return
    }
    setUser(data.user)
    setLoading(false)
  }, [router])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (user) {
      fetchExpenses()
      fetchStats()
    }
  }, [user, fetchExpenses, fetchStats])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
    fetchExpenses()
    fetchStats()
  }

  const handleSuccess = () => {
    setEditingExpense(null)
    fetchExpenses()
    fetchStats()
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    // Scroll to form on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4 animate-pulse">
            <span className="text-3xl">💰</span>
          </div>
          <p className="text-gray-400">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-black/30 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <span className="text-lg">💰</span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-white">Harcama Takip</h1>
              <p className="text-xs text-gray-400">
                {user?.firstName} {user?.lastName}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Stats Button */}
            <button
              onClick={() => setShowStats(true)}
              className="btn btn-ghost text-sm px-3 py-2 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="hidden sm:inline">İstatistikler</span>
            </button>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="btn btn-ghost text-sm px-3 py-2"
            >
              <span className="hidden sm:inline mr-1">Çıkış</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        {/* Quick Stats - Üstte */}
        {stats && (
          <div className="grid grid-cols-3 gap-3 mb-6 animate-fade-in">
            <div className="stat-card group hover:bg-green-500/10 transition-colors cursor-pointer" onClick={() => setShowStats(true)}>
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-green-500/20 mx-auto mb-2 group-hover:scale-110 transition-transform">
                <span className="text-xl">📈</span>
              </div>
              <p className="text-xs text-gray-500 mb-1">Bu Ay Gelir</p>
              <p className="text-xl font-bold text-green-400">
                ₺{stats.thisMonth.income.toLocaleString('tr-TR')}
              </p>
            </div>
            <div className="stat-card group hover:bg-red-500/10 transition-colors cursor-pointer" onClick={() => setShowStats(true)}>
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/20 mx-auto mb-2 group-hover:scale-110 transition-transform">
                <span className="text-xl">📉</span>
              </div>
              <p className="text-xs text-gray-500 mb-1">Bu Ay Gider</p>
              <p className="text-xl font-bold text-red-400">
                ₺{stats.thisMonth.outcome.toLocaleString('tr-TR')}
              </p>
            </div>
            <div className="stat-card group hover:bg-purple-500/10 transition-colors cursor-pointer" onClick={() => setShowStats(true)}>
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/20 mx-auto mb-2 group-hover:scale-110 transition-transform">
                <span className="text-xl">💎</span>
              </div>
              <p className="text-xs text-gray-500 mb-1">Bakiye</p>
              <p className={`text-xl font-bold ${stats.thisMonth.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ₺{stats.thisMonth.balance.toLocaleString('tr-TR')}
              </p>
            </div>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sol Kolon - Form */}
          <div className="animate-fade-in">
            <ExpenseForm
              onSuccess={handleSuccess}
              editingExpense={editingExpense}
              onCancelEdit={() => setEditingExpense(null)}
            />
          </div>

          {/* Sağ Kolon - Liste */}
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <span>📋</span> Son Kayıtlar
              </h2>
              <span className="text-sm text-gray-500">
                {expenses.length} kayıt
              </span>
            </div>
            <ExpenseList
              expenses={expenses}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </main>

      {/* Stats Modal */}
      <StatsModal 
        isOpen={showStats} 
        onClose={() => setShowStats(false)} 
        stats={stats} 
      />
    </div>
  )
}
