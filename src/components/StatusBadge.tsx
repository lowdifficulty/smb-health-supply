import type { OrderStatus } from '../types'
import { getStatusColor, getStatusLabel } from '../lib/format'

interface StatusBadgeProps {
  status: OrderStatus
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
      {getStatusLabel(status)}
    </span>
  )
}
