import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string
  subtext?: string
  icon?: ReactNode
  accent?: 'brand' | 'amber' | 'blue' | 'green' | 'red'
  subtextClassName?: string
  valueClassName?: string
}

const accentMap = {
  brand: 'border-brand-200 bg-brand-50',
  amber: 'border-amber-200 bg-amber-50',
  blue: 'border-blue-200 bg-blue-50',
  green: 'border-green-200 bg-green-50',
  red: 'border-red-200 bg-red-50',
}

export default function StatCard({ label, value, subtext, icon, accent = 'brand', subtextClassName, valueClassName }: StatCardProps) {
  return (
    <div className={`rounded-xl border p-4 sm:p-5 ${accentMap[accent]}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-medium text-slate-600">{label}</p>
          <p className={`text-xl sm:text-2xl font-bold mt-0.5 sm:mt-1 tabular-nums tracking-tight break-words ${valueClassName ?? 'text-slate-900'}`}>
            {value}
          </p>
          {subtext && <p className={`text-[11px] sm:text-xs mt-1 leading-snug ${subtextClassName ?? 'text-slate-500'}`}>{subtext}</p>}
        </div>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
    </div>
  )
}
