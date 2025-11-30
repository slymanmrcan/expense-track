'use client'

import { useState, useEffect } from 'react'
import { formatCurrency, formatDateForInput } from '@/lib/utils'

interface Category {
  id: string
  name: string
  icon: string | null
  isIncome: boolean
}

interface ExpenseFormProps {
  onSuccess: () => void
  editingExpense?: {
    id: string
    amount: number
    type: 'INCOME' | 'OUTCOME'
    categoryId: string
    description: string | null
    location: string | null
    date: string
  } | null
  onCancelEdit?: () => void
}

export default function ExpenseForm({ onSuccess, editingExpense, onCancelEdit }: ExpenseFormProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState<'INCOME' | 'OUTCOME'>('OUTCOME')
  
  const [form, setForm] = useState({
    amount: '',
    categoryId: '',
    description: '',
    location: '',
    date: formatDateForInput(new Date()),
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (editingExpense) {
      setType(editingExpense.type)
      setForm({
        amount: String(editingExpense.amount),
        categoryId: editingExpense.categoryId,
        description: editingExpense.description || '',
        location: editingExpense.location || '',
        date: formatDateForInput(editingExpense.date),
      })
    }
  }, [editingExpense])

  const fetchCategories = async () => {
    const res = await fetch('/api/categories')
    const data = await res.json()
    setCategories(data.categories || [])
  }

  const filteredCategories = categories.filter((c: Category) => c.isIncome === (type === 'INCOME'))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingExpense ? `/api/expenses/${editingExpense.id}` : '/api/expenses'
      const method = editingExpense ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(form.amount),
          type,
          categoryId: form.categoryId,
          description: form.description || null,
          location: form.location || null,
          date: form.date,
        }),
      })

      if (res.ok) {
        setForm({
          amount: '',
          categoryId: '',
          description: '',
          location: '',
          date: formatDateForInput(new Date()),
        })
        onSuccess()
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setForm({
      amount: '',
      categoryId: '',
      description: '',
      location: '',
      date: formatDateForInput(new Date()),
    })
    setType('OUTCOME')
    onCancelEdit?.()
  }

  return (
    <div className="card h-full">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm">
            {editingExpense ? '✏️' : '➕'}
          </span>
          {editingExpense ? 'Kaydı Düzenle' : 'Yeni Kayıt Ekle'}
        </h2>
        {editingExpense && onCancelEdit && (
          <button
            type="button"
            onClick={handleCancel}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Tip seçimi - Daha belirgin */}
      <div className="type-toggle p-1 mb-5">
        <button
          type="button"
          onClick={() => {
            setType('OUTCOME')
            setForm(f => ({ ...f, categoryId: '' }))
          }}
          className={`type-btn ${type === 'OUTCOME' ? 'active outcome' : ''}`}
        >
          <span className="mr-2">📉</span> Gider
        </button>
        <button
          type="button"
          onClick={() => {
            setType('INCOME')
            setForm(f => ({ ...f, categoryId: '' }))
          }}
          className={`type-btn ${type === 'INCOME' ? 'active income' : ''}`}
        >
          <span className="mr-2">📈</span> Gelir
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tutar - Daha büyük */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tutar *
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400 font-medium">₺</span>
            <input
              type="number"
              step="0.01"
              min="0"
              className="input pl-10 text-xl font-semibold h-14"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
          </div>
          {form.amount && parseFloat(form.amount) > 0 && (
            <p className="text-sm text-gray-500 mt-2 ml-1">
              {formatCurrency(parseFloat(form.amount))}
            </p>
          )}
        </div>

        {/* Kategori - Grid şeklinde */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Kategori *
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 category-grid">
            {filteredCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setForm({ ...form, categoryId: cat.id })}
                className={`p-2.5 rounded-xl text-center transition-all ${
                  form.categoryId === cat.id
                    ? type === 'INCOME'
                      ? 'bg-green-500/30 border-2 border-green-500 text-green-300 shadow-lg shadow-green-500/20'
                      : 'bg-red-500/30 border-2 border-red-500 text-red-300 shadow-lg shadow-red-500/20'
                    : 'bg-white/5 border-2 border-transparent hover:bg-white/10 text-gray-300'
                }`}
              >
                <span className="text-xl block mb-1">{cat.icon}</span>
                <span className="text-xs truncate block font-medium">{cat.name}</span>
              </button>
            ))}
          </div>
          {filteredCategories.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">Kategori bulunamadı</p>
          )}
        </div>

        {/* Tarih & Konum - Yan yana */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tarih *
            </label>
            <input
              type="date"
              className="input"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Konum
            </label>
            <input
              type="text"
              className="input"
              placeholder="Opsiyonel"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>
        </div>

        {/* Açıklama */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Açıklama
          </label>
          <input
            type="text"
            className="input"
            placeholder="Opsiyonel açıklama..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        {/* Butonlar */}
        <div className="flex gap-3 pt-3">
          {editingExpense && (
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-ghost flex-1 py-3"
            >
              İptal
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !form.categoryId}
            className={`btn flex-1 py-3 text-base font-semibold ${
              type === 'INCOME' 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/20' 
                : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-500/20'
            } text-white rounded-xl transition-all ${loading || !form.categoryId ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Kaydediliyor...
              </span>
            ) : (
              <>
                <span className="mr-2">{type === 'INCOME' ? '📈' : '📉'}</span>
                {editingExpense ? 'Güncelle' : `${type === 'INCOME' ? 'Gelir' : 'Gider'} Ekle`}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
