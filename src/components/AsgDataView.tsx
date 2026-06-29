import { Fragment, useMemo, useState } from 'react'
import StatCard from './StatCard'
import RemitPdfLinks from './RemitPdfLinks'
import { SQCM_ABBREV } from '../lib/pricing'
import { formatCurrency, formatDate } from '../lib/format'
import {
  getAsgData,
  getAsgRemitEvents,
  getAsgTotals,
  getRemitDollarsPerSqCm,
  getRemitRateSummariesForYears,
  getRemitPdfLink,
  groupRemitEventsByPdf,
} from '../data/asgData'
import { useAsgDataMeta } from '../context/AsgDataContext'
import type { AsgRemitPdfGroup, AsgRemitEvent } from '../types/asg'
import { nextSortDirection, sortRows, type SortDirection } from '../lib/sortTable'

type RemitSortKey = 'pdfLabel' | 'dos' | 'dateOfRemit' | 'remitAmountDollars'

const GROUP_SORT_GETTERS: Record<RemitSortKey, (row: AsgRemitPdfGroup) => string | number> = {
  pdfLabel: (g) => g.remitPdf.label,
  dos: (g) => g.latestDos,
  dateOfRemit: (g) => g.dateOfRemit,
  remitAmountDollars: (g) => g.totalRemitDollars,
}

function SortableTh({
  label,
  active,
  direction,
  onSort,
  align = 'left',
}: {
  label: string
  active: boolean
  direction: SortDirection
  onSort: () => void
  align?: 'left' | 'right'
}) {
  return (
    <th
      className={`px-3 py-2.5 font-semibold whitespace-nowrap border-r border-slate-200 ${
        align === 'right' ? 'text-right' : 'text-left'
      }`}
    >
      <button
        type="button"
        onClick={onSort}
        className={`inline-flex items-center gap-1 hover:text-brand-700 transition-colors ${
          align === 'right' ? 'justify-end w-full' : ''
        } ${active ? 'text-brand-700' : 'text-slate-600'}`}
      >
        <span>{label}</span>
        <span className="text-[10px] leading-none opacity-70">
          {active ? (direction === 'asc' ? '▲' : '▼') : '↕'}
        </span>
      </button>
    </th>
  )
}

function formatDosRange(earliest: string, latest: string): string {
  if (!earliest) return '—'
  if (earliest === latest) return formatDate(earliest)
  return `${formatDate(earliest)} – ${formatDate(latest)}`
}

function RemitDetailRow({ row }: { row: AsgRemitEvent }) {
  const rate = getRemitDollarsPerSqCm(row)
  return (
    <tr className="border-b border-slate-100 bg-slate-50/80">
      <td className="px-2 py-2 border-r border-slate-100" />
      <td className="px-3 py-2 whitespace-nowrap border-r border-slate-100 text-slate-800 font-medium pl-6">
        {row.patientName}
      </td>
      <td className="px-3 py-2 whitespace-nowrap border-r border-slate-100 text-slate-700">
        {formatDate(row.dos)}
      </td>
      <td className="px-3 py-2 whitespace-nowrap border-r border-slate-100 text-slate-500">
        —
      </td>
      <td className="px-3 py-2 whitespace-nowrap border-r border-slate-100 text-right text-slate-600 font-medium">
        {formatCurrency(row.remitAmountDollars)}
      </td>
      <td className="px-3 py-2 whitespace-nowrap border-r border-slate-100 text-right text-slate-700">
        {row.remitUnitsSqCm > 0 ? row.remitUnitsSqCm.toFixed(1) : '—'}
      </td>
      <td className="px-3 py-2 whitespace-nowrap border-r border-slate-100 text-right text-slate-700">
        {rate !== null ? formatCurrency(rate) : '—'}
      </td>
      <td className="px-3 py-2 whitespace-nowrap border-r border-slate-100 text-right text-slate-600">
        {formatCurrency(row.remainingDollars)}
      </td>
      <td className="px-3 py-2 text-slate-400">—</td>
    </tr>
  )
}

function RemitDetailMobile({ row }: { row: AsgRemitEvent }) {
  const rate = getRemitDollarsPerSqCm(row)
  return (
    <div className="px-4 py-3 bg-slate-50/90 border-t border-slate-100 text-xs">
      <p className="font-medium text-slate-800">{row.patientName}</p>
      <p className="text-slate-500 mt-0.5">DOS {formatDate(row.dos)}</p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2 mt-2">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-slate-400">Remit</p>
          <p className="font-medium text-slate-800 tabular-nums">{formatCurrency(row.remitAmountDollars)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-slate-400">{SQCM_ABBREV}</p>
          <p className="text-slate-700">{row.remitUnitsSqCm > 0 ? row.remitUnitsSqCm.toFixed(1) : '—'}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-slate-400">$/ {SQCM_ABBREV}</p>
          <p className="text-slate-700">{rate !== null ? formatCurrency(rate) : '—'}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-slate-400">Remaining</p>
          <p className="text-slate-700 tabular-nums">{formatCurrency(row.remainingDollars)}</p>
        </div>
      </div>
    </div>
  )
}

function RemitPdfMobileCard({
  group,
  expanded,
  onToggle,
}: {
  group: AsgRemitPdfGroup
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-4 text-left active:bg-slate-50 transition-colors"
        aria-expanded={expanded}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-slate-500">
              Remit {formatDate(group.dateOfRemit)}
              {group.remitType === 'secondary' && (
                <span className="text-slate-400"> · secondary</span>
              )}
            </p>
            <div className="mt-1 break-words">
              {group.remitPdf.label ? (
                <RemitPdfLinks links={[getRemitPdfLink(group.remitPdf)]} />
              ) : (
                <span className="text-slate-400 text-sm">—</span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {group.lineCount} line{group.lineCount !== 1 ? 's' : ''} · {group.patientCount} patient
              {group.patientCount !== 1 ? 's' : ''}
            </p>
          </div>
          <span className="text-slate-400 text-xs shrink-0 mt-1" aria-hidden>
            {expanded ? '▼' : '▶'}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-slate-400 font-medium">Remit ($)</p>
            <p className="font-semibold text-slate-900 tabular-nums mt-0.5">
              {formatCurrency(group.totalRemitDollars)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-slate-400 font-medium">Remaining</p>
            <p className="font-semibold text-slate-800 tabular-nums mt-0.5">
              {formatCurrency(group.totalRemainingDollars)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-slate-400 font-medium">DOS</p>
            <p className="text-slate-700 text-xs mt-0.5 leading-snug">
              {formatDosRange(group.earliestDos, group.latestDos)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-slate-400 font-medium">
              Remit ({SQCM_ABBREV})
            </p>
            <p className="text-slate-700 mt-0.5">
              {group.totalRemitSqCm > 0 ? group.totalRemitSqCm.toFixed(1) : '—'}
            </p>
          </div>
        </div>
      </button>
      {expanded && group.events.map((event) => <RemitDetailMobile key={event.id} row={event} />)}
    </div>
  )
}

const SORT_OPTIONS: { key: RemitSortKey; label: string }[] = [
  { key: 'dateOfRemit', label: 'Date of remit' },
  { key: 'pdfLabel', label: 'Remit PDF' },
  { key: 'dos', label: 'Date of service' },
  { key: 'remitAmountDollars', label: 'Remit amount' },
]

export default function AsgDataView() {
  const { ready, source } = useAsgDataMeta()
  const asgData = getAsgData()
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<RemitSortKey>('dateOfRemit')
  const [sortDir, setSortDir] = useState<SortDirection>('desc')
  const [expandedBatches, setExpandedBatches] = useState<Set<string>>(new Set())

  const totals = getAsgTotals()
  const remitEvents = getAsgRemitEvents()
  const rateSummaries = getRemitRateSummariesForYears(['2025', '2026'])

  const filteredEvents = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return remitEvents
    return remitEvents.filter(
      (row) =>
        row.patientName.toLowerCase().includes(q) ||
        row.dos.includes(q) ||
        row.dateOfRemit.includes(q) ||
        row.remitPdf.label.toLowerCase().includes(q),
    )
  }, [remitEvents, search])

  const pdfGroups = useMemo(() => {
    const groups = groupRemitEventsByPdf(filteredEvents)
    return sortRows(groups, GROUP_SORT_GETTERS[sortKey], sortDir)
  }, [filteredEvents, sortKey, sortDir])

  function handleSort(key: RemitSortKey) {
    setSortDir(nextSortDirection(sortKey, key, sortDir))
    setSortKey(key)
  }

  function toggleBatch(id: string) {
    setExpandedBatches((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (!ready) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 px-6 py-12 text-center text-slate-500 text-sm">
        Loading ASG remit data…
      </div>
    )
  }

  if (remitEvents.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-sm text-amber-900">
        <p className="font-semibold">No ASG remit data loaded.</p>
        <p className="mt-1 text-amber-800">
          Run <code className="bg-amber-100 px-1 rounded">node scripts/generate-asg-data.mjs</code> to import ASG.xlsx.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <StatCard
          label="Patients"
          value={String(totals.patients)}
          subtext={`${totals.remitEvents} remit payments`}
          accent="brand"
        />
        <StatCard
          label="Total Remitted"
          value={formatCurrency(totals.remitDollars)}
          subtext={`${totals.remitSqCm.toFixed(1)} ${SQCM_ABBREV} on primary remits`}
          accent="green"
        />
        <StatCard
          label="Secondary Remits"
          value={formatCurrency(totals.secondaryRemitDollars)}
          subtext={
            totals.secondaryRemitEvents > 0
              ? `${totals.secondaryRemitEvents} secondary payment${totals.secondaryRemitEvents !== 1 ? 's' : ''} · dollar-only`
              : 'No secondary remits'
          }
          accent="blue"
        />
        <StatCard
          label="Remaining to Remit"
          value={formatCurrency(totals.leftDollars)}
          subtext={`${totals.leftSqCm.toFixed(1)} ${SQCM_ABBREV} outstanding`}
          accent="amber"
        />
        <StatCard
          label="Total Placed"
          value={`${totals.billedSqCm.toFixed(1)} ${SQCM_ABBREV}`}
          subtext={formatCurrency(totals.billedDollars)}
          accent="blue"
        />
      </div>

      <section className="mb-6 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-4 sm:px-6 pt-4 sm:pt-6">
          <h2 className="text-sm font-semibold text-slate-900">
            Remit $ / {SQCM_ABBREV} by DOS year
          </h2>
          <p className="text-xs text-slate-500 mt-1.5 max-w-3xl leading-relaxed">
            Per remit payment ÷ placed sq cm on the claim line. Secondary remits are dollar-only but
            allocated across billed sq cm.
          </p>
        </div>
        <div className="px-4 sm:px-6 pt-4 pb-4 sm:pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {rateSummaries.map((summary) => {
              const label = `${summary.year} ${summary.remitType === 'primary' ? 'Primary' : 'Secondary'}`
              const hasData = summary.remitCount > 0
              return (
                <div
                  key={`${summary.year}-${summary.remitType}`}
                  className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5 min-h-[7.5rem]"
                >
                  <p className="text-xs font-medium text-slate-500">{label}</p>
                  {hasData ? (
                    <>
                      <p className="text-lg sm:text-xl font-semibold text-slate-900 mt-1 tabular-nums tracking-tight">
                        {formatCurrency(summary.medianPerSqCm)}
                        <span className="text-sm font-normal text-slate-500"> / {SQCM_ABBREV}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1.5 leading-snug">
                        Median · avg {formatCurrency(summary.avgPerSqCm)} · blended{' '}
                        {formatCurrency(summary.blendedPerSqCm)}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {summary.remitCount} remit{summary.remitCount !== 1 ? 's' : ''}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-slate-400 mt-2">No remits in data</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <p className="text-xs text-slate-500 mb-4">
        {asgData.note}
        {source === 'live' && (
          <span className="ml-2 text-green-700 font-medium">· Live from Google Sheets</span>
        )}
      </p>

      <div className="flex flex-col gap-3 mb-4">
        <p className="text-sm font-medium text-slate-900">
          Remit summary — {pdfGroups.length} remit PDFs ({filteredEvents.length} claim lines)
        </p>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search patient or date…"
          className="input w-full sm:max-w-xs"
        />
        <div className="flex gap-2 md:hidden">
          <select
            className="input text-sm flex-1 min-w-0"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as RemitSortKey)}
            aria-label="Sort remits by"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>{opt.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
            className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 shrink-0"
            aria-label="Toggle sort direction"
          >
            {sortDir === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      <section className="md:hidden bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {pdfGroups.length === 0 ? (
          <p className="px-4 py-12 text-center text-slate-500 text-sm">No matching remits.</p>
        ) : (
          pdfGroups.map((group) => (
            <RemitPdfMobileCard
              key={group.id}
              group={group}
              expanded={expandedBatches.has(group.id)}
              onToggle={() => toggleBatch(group.id)}
            />
          ))
        )}
      </section>

      <section className="hidden md:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto table-scroll-x scroll-hint">
          <table className="w-full text-xs border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="w-8 px-2 py-2.5 border-r border-slate-200" aria-label="Expand" />
                <SortableTh
                  label="Remit PDF"
                  active={sortKey === 'pdfLabel'}
                  direction={sortDir}
                  onSort={() => handleSort('pdfLabel')}
                />
                <SortableTh
                  label="Date of Service"
                  active={sortKey === 'dos'}
                  direction={sortDir}
                  onSort={() => handleSort('dos')}
                />
                <SortableTh
                  label="Date of Remit"
                  active={sortKey === 'dateOfRemit'}
                  direction={sortDir}
                  onSort={() => handleSort('dateOfRemit')}
                />
                <SortableTh
                  label="Remit ($)"
                  align="right"
                  active={sortKey === 'remitAmountDollars'}
                  direction={sortDir}
                  onSort={() => handleSort('remitAmountDollars')}
                />
                <th className="px-3 py-2.5 font-semibold text-right text-slate-600 border-r border-slate-200 whitespace-nowrap">
                  Remit ({SQCM_ABBREV})
                </th>
                <th className="px-3 py-2.5 font-semibold text-right text-slate-600 border-r border-slate-200 whitespace-nowrap">
                  Remit $ / {SQCM_ABBREV}
                </th>
                <th className="px-3 py-2.5 font-semibold text-right text-slate-600 border-r border-slate-200 whitespace-nowrap">
                  Remaining ($)
                </th>
                <th className="px-3 py-2.5 font-semibold text-left text-slate-600 whitespace-nowrap">
                  Patients
                </th>
              </tr>
            </thead>
            <tbody>
              {pdfGroups.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                    No matching remits.
                  </td>
                </tr>
              ) : (
                pdfGroups.map((group, i) => {
                  const expanded = expandedBatches.has(group.id)
                  return (
                    <Fragment key={group.id}>
                      <tr
                        className={`border-b border-slate-100 hover:bg-brand-50/40 ${
                          i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                        }`}
                      >
                        <td className="px-2 py-2 border-r border-slate-100 text-center">
                          <button
                            type="button"
                            onClick={() => toggleBatch(group.id)}
                            className="text-slate-500 hover:text-brand-700 w-6 h-6 rounded hover:bg-slate-100"
                            aria-expanded={expanded}
                            aria-label={`${expanded ? 'Collapse' : 'Expand'} ${group.remitPdf.label}`}
                          >
                            {expanded ? '▼' : '▶'}
                          </button>
                        </td>
                        <td className="px-3 py-2 border-r border-slate-100 max-w-[240px]">
                          <button
                            type="button"
                            onClick={() => toggleBatch(group.id)}
                            className="text-left w-full"
                          >
                            {group.remitPdf.label ? (
                              <RemitPdfLinks links={[getRemitPdfLink(group.remitPdf)]} />
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                            <span className="block text-slate-400 mt-0.5">
                              {group.lineCount} line{group.lineCount !== 1 ? 's' : ''}
                            </span>
                          </button>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap border-r border-slate-100 text-slate-700">
                          {formatDosRange(group.earliestDos, group.latestDos)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap border-r border-slate-100 text-slate-700 font-medium">
                          {formatDate(group.dateOfRemit)}
                          {group.remitType === 'secondary' && (
                            <span className="ml-1 text-slate-400 font-normal">(secondary)</span>
                          )}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap border-r border-slate-100 text-right text-slate-600 font-semibold">
                          {formatCurrency(group.totalRemitDollars)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap border-r border-slate-100 text-right text-slate-700 font-medium">
                          {group.totalRemitSqCm > 0 ? group.totalRemitSqCm.toFixed(1) : '—'}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap border-r border-slate-100 text-right text-slate-700 font-medium">
                          {group.totalUnitsBilled > 0 ? formatCurrency(group.blendedRemitPerSqCm) : '—'}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap border-r border-slate-100 text-right text-slate-600 font-semibold">
                          {formatCurrency(group.totalRemainingDollars)}
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          {group.patientCount} patient{group.patientCount !== 1 ? 's' : ''}
                        </td>
                      </tr>
                      {expanded &&
                        group.events.map((event) => (
                          <RemitDetailRow key={event.id} row={event} />
                        ))}
                    </Fragment>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
