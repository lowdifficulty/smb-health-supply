import { useState, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import FilterPanel from '../../components/fyf/FilterPanel'
import SkinSubstituteTable from '../../components/fyf/SkinSubstituteTable'
import { CLIENT_PORTAL_NAME, skinSubstituteRecords } from '../../data/skinSubstitutes'
import { EMPTY_FILTERS, type SkinSubstituteFilters, type SortField, type StatusFilter } from '../../types/skinSubstitute'
import { filterRecords, sortRecords, downloadCsv } from '../../lib/skinSubstituteUtils'

interface OutletContext {
  activeTab: StatusFilter
  setActiveTab: (tab: StatusFilter) => void
}

export default function SkinSubstitutes() {
  const { activeTab } = useOutletContext<OutletContext>()
  const [filters, setFilters] = useState<SkinSubstituteFilters>({ ...EMPTY_FILTERS })
  const [appliedFilters, setAppliedFilters] = useState<SkinSubstituteFilters>({ ...EMPTY_FILTERS })
  const [sortField, setSortField] = useState<SortField>('tissueId')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const records = useMemo(() => {
    const filtered = filterRecords(skinSubstituteRecords, appliedFilters, activeTab)
    return sortRecords(filtered, sortField, sortDirection)
  }, [appliedFilters, activeTab, sortField, sortDirection])

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  return (
    <div className="fyf-page-content">
      <div className="fyf-pager">
        <button type="button" className="fyf-pager-btn" disabled>&lt;</button>
        <button type="button" className="fyf-pager-btn" disabled>&gt;</button>
      </div>

      <h3 className="fyf-page-title">{CLIENT_PORTAL_NAME}</h3>

      <p className="fyf-filter-hint">
        Select a filter Application Date Brand Carrier Tracking Number Delivery Date Invoice Due Date
        Invoice Number Invoice Paid Date Location (Address) Order Date Patient Birth Year Patient Initials
        Product Ship Date Status (Kanban) Tissue ID / Lot Number Update Applied Date
      </p>

      <FilterPanel
        filters={filters}
        onChange={setFilters}
        onApply={() => setAppliedFilters({ ...filters })}
        onClear={() => {
          setFilters({ ...EMPTY_FILTERS })
          setAppliedFilters({ ...EMPTY_FILTERS })
        }}
        onDownload={() => downloadCsv(records)}
      />

      <SkinSubstituteTable
        records={records}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
      />
    </div>
  )
}
