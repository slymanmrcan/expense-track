'use client'

import { formatCurrency } from '@/lib/utils'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

interface MonthlyData {
  month: string
  income: number
  outcome: number
}

interface CategoryData {
  name: string
  icon: string
  total: number
}

interface StatsData {
  monthly: MonthlyData[]
  categories: CategoryData[]
  thisMonth: {
    income: number
    outcome: number
    balance: number
  }
}

interface StatsChartsProps {
  stats: StatsData | null
}

const COLORS = [
  '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#22c55e',
  '#84cc16', '#eab308', '#f97316', '#ef4444', '#ec4899',
]

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-xl p-3 shadow-xl">
        <p className="text-gray-400 text-sm mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="font-semibold">
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function StatsCharts({ stats }: StatsChartsProps) {
  if (!stats) {
    return (
      <div className="card text-center py-12">
        <div className="text-5xl mb-4 animate-pulse">📊</div>
        <p className="text-gray-400">İstatistikler yükleniyor...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Aylık gelir/gider grafiği */}
      <div className="card">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-xl">📊</span> Aylık Gelir / Gider
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.monthly} barGap={4}>
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: '#888' }} 
                axisLine={{ stroke: '#333' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#888' }} 
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                axisLine={{ stroke: '#333' }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="income" 
                name="Gelir" 
                fill="#22c55e" 
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
              />
              <Bar 
                dataKey="outcome" 
                name="Gider" 
                fill="#ef4444" 
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Kategori dağılımı */}
      {stats.categories.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-xl">🥧</span> Gider Dağılımı
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categories}
                  dataKey="total"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={2}
                  label={({ name, percent }) => `${name} %${(percent * 100).toFixed(0)}`}
                  labelLine={{ stroke: '#444', strokeWidth: 1 }}
                >
                  {stats.categories.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'rgba(17, 17, 17, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    padding: '8px 12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Kategori listesi */}
          <div className="mt-4 space-y-2">
            {stats.categories.slice(0, 5).map((cat, index) => (
              <div key={cat.name} className="flex items-center justify-between text-sm py-2 px-3 rounded-lg hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-gray-300">{cat.icon} {cat.name}</span>
                </div>
                <span className="font-semibold text-white">{formatCurrency(cat.total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
