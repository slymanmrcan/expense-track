'use client'

import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts'

interface StatsData {
  monthly: { month: string; income: number; outcome: number }[]
  categories: { name: string; icon: string; total: number }[]
  thisMonth: { income: number; outcome: number; balance: number }
}

interface StatsModalProps {
  isOpen: boolean
  onClose: () => void
  stats: StatsData | null
}

const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', 
  '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#ec4899',
  '#f43f5e', '#84cc16', '#10b981', '#0ea5e9', '#6366f1'
]

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-lg p-3 shadow-xl">
        <p className="text-gray-400 text-sm mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
            {entry.name}: ₺{entry.value.toLocaleString('tr-TR')}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const PieTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; icon: string; value: number } }> }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-lg p-3 shadow-xl">
        <p className="text-sm font-medium text-white">
          {data.icon} {data.name}
        </p>
        <p className="text-sm text-gray-400">
          ₺{data.value.toLocaleString('tr-TR')}
        </p>
      </div>
    )
  }
  return null
}

export default function StatsModal({ isOpen, onClose, stats }: StatsModalProps) {
  const [activeChart, setActiveChart] = useState<'bar' | 'area'>('bar')

  if (!isOpen || !stats) return null

  const pieData = stats.categories
    .filter(c => c.total > 0)
    .slice(0, 10)
    .map(c => ({
      name: c.name,
      icon: c.icon,
      value: c.total
    }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">İstatistikler</h2>
              <p className="text-sm text-gray-400">Son 6 aylık özet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-xl p-4 text-center">
              <p className="text-sm text-green-400/80 mb-1">Toplam Gelir</p>
              <p className="text-2xl font-bold text-green-400">
                ₺{stats.monthly.reduce((sum, m) => sum + m.income, 0).toLocaleString('tr-TR')}
              </p>
            </div>
            <div className="bg-gradient-to-br from-red-500/10 to-rose-500/5 border border-red-500/20 rounded-xl p-4 text-center">
              <p className="text-sm text-red-400/80 mb-1">Toplam Gider</p>
              <p className="text-2xl font-bold text-red-400">
                ₺{stats.monthly.reduce((sum, m) => sum + m.outcome, 0).toLocaleString('tr-TR')}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-violet-500/5 border border-purple-500/20 rounded-xl p-4 text-center">
              <p className="text-sm text-purple-400/80 mb-1">Net Bakiye</p>
              <p className={`text-2xl font-bold ${stats.monthly.reduce((sum, m) => sum + m.income - m.outcome, 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ₺{stats.monthly.reduce((sum, m) => sum + m.income - m.outcome, 0).toLocaleString('tr-TR')}
              </p>
            </div>
          </div>

          {/* Charts Grid - 2 Column */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left - Monthly Chart */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <span>📈</span> Aylık Gelir/Gider
                </h3>
                <div className="flex gap-1 p-1 rounded-lg bg-white/5">
                  <button
                    onClick={() => setActiveChart('bar')}
                    className={`px-3 py-1 text-xs rounded-md transition-all ${
                      activeChart === 'bar' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Bar
                  </button>
                  <button
                    onClick={() => setActiveChart('area')}
                    className={`px-3 py-1 text-xs rounded-md transition-all ${
                      activeChart === 'area' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Area
                  </button>
                </div>
              </div>
              
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  {activeChart === 'bar' ? (
                    <BarChart data={stats.monthly} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        axisLine={{ stroke: '#374151' }}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fill: '#9ca3af', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `₺${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar 
                        dataKey="income" 
                        name="Gelir" 
                        fill="url(#greenGradient)" 
                        radius={[6, 6, 0, 0]}
                        maxBarSize={40}
                      />
                      <Bar 
                        dataKey="outcome" 
                        name="Gider" 
                        fill="url(#redGradient)" 
                        radius={[6, 6, 0, 0]}
                        maxBarSize={40}
                      />
                      <defs>
                        <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22c55e" />
                          <stop offset="100%" stopColor="#16a34a" />
                        </linearGradient>
                        <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4444" />
                          <stop offset="100%" stopColor="#dc2626" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  ) : (
                    <AreaChart data={stats.monthly} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        axisLine={{ stroke: '#374151' }}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fill: '#9ca3af', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `₺${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone"
                        dataKey="income" 
                        name="Gelir" 
                        stroke="#22c55e"
                        fill="url(#areaGreen)"
                        strokeWidth={2}
                      />
                      <Area 
                        type="monotone"
                        dataKey="outcome" 
                        name="Gider" 
                        stroke="#ef4444"
                        fill="url(#areaRed)"
                        strokeWidth={2}
                      />
                      <defs>
                        <linearGradient id="areaGreen" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="areaRed" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
              
              {/* Legend */}
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm text-gray-400">Gelir</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm text-gray-400">Gider</span>
                </div>
              </div>
            </div>

            {/* Right - Category Pie Chart */}
            <div className="card p-5">
              <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
                <span>🎯</span> Kategori Dağılımı (Bu Ay Giderler)
              </h3>
              
              {pieData.length > 0 ? (
                <>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {pieData.map((_, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS[index % COLORS.length]}
                              stroke="transparent"
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Category List */}
                  <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                    {pieData.map((cat, index) => (
                      <div 
                        key={cat.name}
                        className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm">
                            {cat.icon} {cat.name}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-300">
                          ₺{cat.value.toLocaleString('tr-TR')}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-72 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <span className="text-4xl mb-2 block">📊</span>
                    <p>Henüz gider verisi yok</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
