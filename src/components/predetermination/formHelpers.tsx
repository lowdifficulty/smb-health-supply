import type { ReactNode } from 'react'

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="p-6 border-b border-slate-100">
      <h3 className="font-semibold text-slate-900 mb-4">{title}</h3>
      {children}
    </div>
  )
}

export function Field({ label, required, children, className = '' }: {
  label: string
  required?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-medium text-slate-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  )
}

export function SelectInput({ value, onChange, options, placeholder }: {
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder?: string
}) {
  return (
    <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

export function YesNoUnknown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-3 mt-1">
      {['Yes', 'No', 'Unknown'].map((o) => (
        <label key={o} className="inline-flex items-center gap-1.5 text-sm text-slate-700">
          <input type="radio" checked={value === o} onChange={() => onChange(o)} />
          {o}
        </label>
      ))}
    </div>
  )
}

export function YesNo({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-3 mt-1">
      {['Yes', 'No'].map((o) => (
        <label key={o} className="inline-flex items-center gap-1.5 text-sm text-slate-700">
          <input type="radio" checked={value === o} onChange={() => onChange(o)} />
          {o}
        </label>
      ))}
    </div>
  )
}

export function CheckboxGroup({ values, options, onChange }: {
  values: string[]
  options: string[]
  onChange: (v: string[]) => void
}) {
  function toggle(option: string) {
    onChange(values.includes(option) ? values.filter((v) => v !== option) : [...values, option])
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
      {options.map((o) => (
        <label key={o} className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={values.includes(o)} onChange={() => toggle(o)} />
          {o}
        </label>
      ))}
    </div>
  )
}

export const grid = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
export const grid4 = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'
