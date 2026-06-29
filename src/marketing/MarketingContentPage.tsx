import { useEffect, useRef } from 'react'
import { useMarketingInquiry } from './MarketingInquiryContext'

export default function MarketingContentPage({ html }: { html: string }) {
  const { openModal } = useMarketingInquiry()
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = mainRef.current
    if (!root) return

    const buttons = root.querySelectorAll('.open-form')
    const handlers: Array<{ el: Element; fn: (e: Event) => void }> = []

    buttons.forEach((el) => {
      const fn = (e: Event) => {
        e.preventDefault()
        openModal()
      }
      el.addEventListener('click', fn)
      handlers.push({ el, fn })
    })

    return () => {
      handlers.forEach(({ el, fn }) => el.removeEventListener('click', fn))
    }
  }, [html, openModal])

  return <main ref={mainRef} dangerouslySetInnerHTML={{ __html: html }} />
}
