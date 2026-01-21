export type ExpenseType = 'INCOME' | 'OUTCOME'

export interface Category {
  id: string
  name: string
  icon: string | null
  isIncome: boolean
  order?: number
}

export interface Expense {
  id: string
  amount: number
  type: ExpenseType
  description: string | null
  location: string | null
  date: string
  categoryId: string
  category?: Category
  createdAt?: string
  updatedAt?: string
  userId?: string
}

export interface User {
  id: string
  username: string
  firstName: string
  lastName: string
  email?: string
}

export interface StatsData {
  monthly: { month: string; income: number; outcome: number }[]
  categories: { name: string; icon: string; total: number }[]
  thisMonth: { income: number; outcome: number; balance: number }
}
