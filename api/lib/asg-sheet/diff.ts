import type { AsgClaimRow, AsgSnapshot } from './parse.js'
import { claimStableKey, round2 } from './parse.js'

const DIFF_FIELDS = [
  'totalBilledAmount',
  'unitsBilled',
  'submissionStatus',
  'primaryRemitDollars',
  'secondaryRemitDollars',
  'totalRemitDollars',
  'remitDate',
  'secondaryRemitDate',
  'primaryRemitPdf',
  'secondaryRemitPdf',
  'leftToRemitDollars',
] as const

function formatClaimLabel(c: AsgClaimRow): string {
  return `${c.patientName} · DOS ${c.dos}${c.submissionId ? ` · ${c.submissionId}` : ''}`
}

function formatMoneyDelta(n: number): string {
  const sign = n >= 0 ? '+' : ''
  return `${sign}$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export interface AsgDiffResult {
  firstRun: boolean
  hasChanges: boolean
  summary: string
  totalsDelta: Record<string, number> | null
  added: AsgClaimRow[]
  removed: AsgClaimRow[]
  changed: Array<{ claim: AsgClaimRow; changes: Record<string, { from: unknown; to: unknown }> }>
  previousCapturedAt?: string
}

export function diffSnapshots(previous: AsgSnapshot | null, current: AsgSnapshot): AsgDiffResult {
  if (!previous) {
    return {
      firstRun: true,
      hasChanges: false,
      summary: 'Baseline snapshot saved — no previous data to compare.',
      totalsDelta: null,
      added: [],
      removed: [],
      changed: [],
    }
  }

  const prevMap = new Map(previous.claims.map((c) => [claimStableKey(c), c]))
  const currMap = new Map(current.claims.map((c) => [claimStableKey(c), c]))
  const added: AsgClaimRow[] = []
  const removed: AsgClaimRow[] = []
  const changed: AsgDiffResult['changed'] = []

  for (const [key, curr] of currMap) {
    const prev = prevMap.get(key)
    if (!prev) {
      added.push(curr)
      continue
    }
    const fieldChanges: Record<string, { from: unknown; to: unknown }> = {}
    for (const field of DIFF_FIELDS) {
      if (prev[field] !== curr[field]) {
        fieldChanges[field] = { from: prev[field], to: curr[field] }
      }
    }
    if (Object.keys(fieldChanges).length > 0) {
      changed.push({ claim: curr, changes: fieldChanges })
    }
  }

  for (const [key, prev] of prevMap) {
    if (!currMap.has(key)) removed.push(prev)
  }

  const totalsDelta = {
    rowCount: current.totals.rowCount - previous.totals.rowCount,
    billedDollars: round2(current.totals.billedDollars - previous.totals.billedDollars),
    unitsBilled: round2(current.totals.unitsBilled - previous.totals.unitsBilled),
    primaryRemitDollars: round2(
      current.totals.primaryRemitDollars - previous.totals.primaryRemitDollars,
    ),
    secondaryRemitDollars: round2(
      current.totals.secondaryRemitDollars - previous.totals.secondaryRemitDollars,
    ),
  }

  const hasChanges = added.length > 0 || removed.length > 0 || changed.length > 0
  const summary = hasChanges
    ? `${added.length} new, ${removed.length} removed, ${changed.length} updated claim lines`
    : 'No changes detected since last check.'

  return {
    firstRun: false,
    hasChanges,
    summary,
    totalsDelta,
    added,
    removed,
    changed,
    previousCapturedAt: previous.capturedAt,
  }
}

export function formatDiffReport(diff: AsgDiffResult): string {
  const lines: string[] = [`ASG sheet check — ${diff.summary}`]

  if (diff.firstRun) return lines.join('\n')

  if (diff.totalsDelta) {
    lines.push('', 'Totals delta:')
    lines.push(`  Rows: ${diff.totalsDelta.rowCount >= 0 ? '+' : ''}${diff.totalsDelta.rowCount}`)
    lines.push(`  Billed: ${formatMoneyDelta(diff.totalsDelta.billedDollars)}`)
    lines.push(`  Primary remit: ${formatMoneyDelta(diff.totalsDelta.primaryRemitDollars)}`)
    lines.push(`  Secondary remit: ${formatMoneyDelta(diff.totalsDelta.secondaryRemitDollars)}`)
    lines.push(`  Units: ${diff.totalsDelta.unitsBilled >= 0 ? '+' : ''}${diff.totalsDelta.unitsBilled}`)
  }

  if (diff.added.length > 0) {
    lines.push('', `New rows (${diff.added.length}):`)
    diff.added.slice(0, 15).forEach((c) => lines.push(`  + ${formatClaimLabel(c)}`))
    if (diff.added.length > 15) lines.push(`  … and ${diff.added.length - 15} more`)
  }

  if (diff.removed.length > 0) {
    lines.push('', `Removed rows (${diff.removed.length}):`)
    diff.removed.slice(0, 15).forEach((c) => lines.push(`  - ${formatClaimLabel(c)}`))
    if (diff.removed.length > 15) lines.push(`  … and ${diff.removed.length - 15} more`)
  }

  if (diff.changed.length > 0) {
    lines.push('', `Updated rows (${diff.changed.length}):`)
    diff.changed.slice(0, 10).forEach(({ claim, changes }) => {
      const fields = Object.entries(changes)
        .map(([k, v]) => `${k}: ${v.from} → ${v.to}`)
        .join('; ')
      lines.push(`  ~ ${formatClaimLabel(claim)} — ${fields}`)
    })
    if (diff.changed.length > 10) lines.push(`  … and ${diff.changed.length - 10} more`)
  }

  return lines.join('\n')
}
