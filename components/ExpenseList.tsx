'use client'

import { formatCurrency, formatDate } from '@/lib/utils'

import { Expense, Category } from '@/types'

interface ExpenseWithCategory extends Expense {
  category: Category
}

interface ExpenseListProps {
  expenses: ExpenseWithCategory[]
  onEdit: (expense: ExpenseWithCategory) => void
  onDelete: (id: string) => void
}

export default function ExpenseList({ expenses, onEdit, onDelete }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="text-5xl mb-4">📭</div>
        <p className="text-gray-400 text-lg">Henüz kayıt yok</p>
        <p className="text-gray-600 text-sm mt-1">İlk harcamanızı ekleyin!</p>
      </div>
    )
  }

  // Tarihe göre grupla
  const grouped = expenses.reduce((acc, expense) => {
    const dateKey = formatDate(expense.date)
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(expense)
    return acc
  }, {} as Record<string, ExpenseWithCategory[]>)

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([date, items]) => (
        <div key={date} className="animate-fade-in">
          <h3 className="text-sm font-medium text-gray-500 mb-2 px-1">{date}</h3>
          <div className="card">
            {items.map((expense) => (
              <div
                key={expense.id}
                className="expense-item group"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl flex-shrink-0">
                    {expense.category.icon || '📦'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{expense.category.name}</p>
                    {expense.description && (
                      <p className="text-sm text-gray-400 truncate">{expense.description}</p>
                    )}
                    {expense.location && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        📍 {expense.location}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span
                    className={`font-bold text-lg whitespace-nowrap ${
                      expense.type === 'INCOME' ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {expense.type === 'INCOME' ? '+' : '-'}
                    {formatCurrency(Number(expense.amount))}
                  </span>
                  
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(expense)}
                      className="p-2 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                      title="Düzenle"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Bu kaydı silmek istediğinize emin misiniz?')) {
                          onDelete(expense.id)
                        }
                      }}
                      className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Sil"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
