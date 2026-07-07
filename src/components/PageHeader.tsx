import { Link } from 'react-router-dom'

interface PageHeaderProps {
  title: string
  description?: string
  action?: { label: string; to: string }
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {description && <p className="text-slate-600 mt-1 text-sm sm:text-base leading-relaxed">{description}</p>}
      </div>
      {action && (
        <Link
          to={action.to}
          className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors shrink-0"
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}
