import type { SkinSubstituteFilters } from '../../types/skinSubstitute'
import { BRANDS, PRODUCTS, LOCATIONS } from '../../data/skinSubstitutes'

interface FilterPanelProps {
  filters: SkinSubstituteFilters
  onChange: (filters: SkinSubstituteFilters) => void
  onApply: () => void
  onClear: () => void
  onDownload: () => void
}

function DateFilter({
  label,
  from,
  to,
  onFrom,
  onTo,
}: {
  label: string
  from: string
  to: string
  onFrom: (v: string) => void
  onTo: (v: string) => void
}) {
  return (
    <div className="fyf-filter-field">
      <label>{label}</label>
      <div className="fyf-date-filter">
        <select className="fyf-select fyf-select-sm" defaultValue="range">
          <option value="specific">Specific Date</option>
          <option value="range">Date Range</option>
        </select>
        <input type="date" className="fyf-input fyf-input-sm" value={from} onChange={(e) => onFrom(e.target.value)} />
        <span className="fyf-date-to">to</span>
        <input type="date" className="fyf-input fyf-input-sm" value={to} onChange={(e) => onTo(e.target.value)} />
      </div>
    </div>
  )
}

function MultiSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: string[]
  selected: string[]
  onChange: (v: string[]) => void
}) {
  return (
    <div className="fyf-filter-field">
      <label>{label}</label>
      <select
        multiple
        className="fyf-select fyf-select-multi"
        value={selected}
        onChange={(e) => {
          const vals = Array.from(e.target.selectedOptions, (o) => o.value)
          onChange(vals)
        }}
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  )
}

export default function FilterPanel({ filters, onChange, onApply, onClear, onDownload }: FilterPanelProps) {
  function set<K extends keyof SkinSubstituteFilters>(key: K, value: SkinSubstituteFilters[K]) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="fyf-filter-panel">
      <div className="fyf-filter-grid">
        <DateFilter label="Application Date" from={filters.applicationDateFrom} to={filters.applicationDateTo}
          onFrom={(v) => set('applicationDateFrom', v)} onTo={(v) => set('applicationDateTo', v)} />

        <MultiSelect label="Brand" options={BRANDS} selected={filters.brand} onChange={(v) => set('brand', v)} />

        <div className="fyf-filter-field">
          <label>Carrier Tracking Number</label>
          <input type="text" className="fyf-input" value={filters.trackingNumber}
            onChange={(e) => set('trackingNumber', e.target.value)} />
        </div>

        <DateFilter label="Delivery Date" from={filters.deliveryDateFrom} to={filters.deliveryDateTo}
          onFrom={(v) => set('deliveryDateFrom', v)} onTo={(v) => set('deliveryDateTo', v)} />

        <DateFilter label="Invoice Due Date" from={filters.invoiceDueDateFrom} to={filters.invoiceDueDateTo}
          onFrom={(v) => set('invoiceDueDateFrom', v)} onTo={(v) => set('invoiceDueDateTo', v)} />

        <div className="fyf-filter-field">
          <label>Invoice Number</label>
          <input type="text" className="fyf-input" value={filters.invoiceNumber}
            onChange={(e) => set('invoiceNumber', e.target.value)} />
        </div>

        <DateFilter label="Invoice Paid Date" from={filters.invoicePaidDateFrom} to={filters.invoicePaidDateTo}
          onFrom={(v) => set('invoicePaidDateFrom', v)} onTo={(v) => set('invoicePaidDateTo', v)} />

        <MultiSelect label="Location (Address)" options={LOCATIONS} selected={filters.location}
          onChange={(v) => set('location', v)} />

        <DateFilter label="Order Date" from={filters.orderDateFrom} to={filters.orderDateTo}
          onFrom={(v) => set('orderDateFrom', v)} onTo={(v) => set('orderDateTo', v)} />

        <div className="fyf-filter-field">
          <label>Patient Birth Year</label>
          <input type="text" className="fyf-input" value={filters.patientBirthYear}
            onChange={(e) => set('patientBirthYear', e.target.value)} />
        </div>

        <div className="fyf-filter-field">
          <label>Patient Initials</label>
          <input type="text" className="fyf-input" value={filters.patientInitials}
            onChange={(e) => set('patientInitials', e.target.value)} />
        </div>

        <MultiSelect label="Product" options={PRODUCTS} selected={filters.product}
          onChange={(v) => set('product', v)} />

        <DateFilter label="Product Ship Date" from={filters.shipDateFrom} to={filters.shipDateTo}
          onFrom={(v) => set('shipDateFrom', v)} onTo={(v) => set('shipDateTo', v)} />

        <MultiSelect label="Status (Kanban)" options={['Consigned', 'Appeals', 'Applied', 'Paid']}
          selected={filters.status} onChange={(v) => set('status', v)} />

        <div className="fyf-filter-field">
          <label>Tissue ID / Lot Number</label>
          <input type="text" className="fyf-input" value={filters.tissueId}
            onChange={(e) => set('tissueId', e.target.value)} />
        </div>

        <DateFilter label="Update Applied Date" from="" to="" onFrom={() => {}} onTo={() => {}} />
      </div>

      <div className="fyf-filter-actions">
        <button type="button" className="fyf-btn fyf-btn-primary" onClick={onApply}>Apply</button>
        <button type="button" className="fyf-btn" onClick={onClear}>Clear</button>
        <button type="button" className="fyf-btn" onClick={onDownload}>Download</button>
      </div>
    </div>
  )
}
