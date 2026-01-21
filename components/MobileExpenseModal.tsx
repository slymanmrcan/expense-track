'use client'

import ExpenseForm from './ExpenseForm'

import { Expense } from '@/types'


interface MobileExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editingExpense?: Expense | null // Changed from any
  onCancelEdit?: () => void
}

export default function MobileExpenseModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  editingExpense,
  onCancelEdit
}: MobileExpenseModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal - Bottom sheet on mobile, centered on larger */}
      <div className="relative w-full sm:max-w-lg bg-[#0f0f0f] sm:bg-gray-900/95 backdrop-blur-xl border-t sm:border border-white/10 rounded-t-2xl sm:rounded-2xl shadow-2xl animate-slide-up sm:animate-fade-in max-h-[85vh] overflow-y-auto">
        {/* Drag handle for mobile feel */}
        <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto mt-3 mb-1 sm:hidden" />

        <div className="p-1 sm:p-4">
          <ExpenseForm 
            className="!bg-transparent !border-0 !shadow-none !p-0"
            onSuccess={() => {
              onSuccess()
              onClose()
            }}
            editingExpense={editingExpense}
            onCancelEdit={() => {
              if (onCancelEdit) onCancelEdit()
              onClose()
            }}
          />
        </div>
      </div>
    </div>
  )
}
