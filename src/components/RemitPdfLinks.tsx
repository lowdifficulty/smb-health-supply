import type { AsgRemitPdfLink } from '../types/asg'
import { getRemitPdfUrl } from '../lib/asgRemitPdf'

export default function RemitPdfLinks({
  links,
  className = '',
}: {
  links: AsgRemitPdfLink[]
  className?: string
}) {
  const unique = links.filter((link) => link.label).filter(
    (link, index, arr) =>
      arr.findIndex((x) => x.label === link.label && x.url === link.url) === index,
  )

  if (unique.length === 0) {
    return <span className="text-slate-400">—</span>
  }

  return (
    <span className={`inline-flex flex-wrap gap-x-2 gap-y-1 ${className}`}>
      {unique.map((link, index) => {
        const href = link.url || getRemitPdfUrl(link.label)
        const hasExternalUrl = Boolean(link.url)

        return (
          <span key={`${link.label}-${link.url}-${index}`}>
            {index > 0 && <span className="text-slate-300 mr-2">·</span>}
            {hasExternalUrl || href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 hover:text-brand-800 hover:underline"
                title={link.label}
              >
                {link.label}
              </a>
            ) : (
              <span className="text-slate-500" title={link.label}>{link.label}</span>
            )}
          </span>
        )
      })}
    </span>
  )
}
