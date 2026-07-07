import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

interface MarketingInquiryContextValue {
  openModal: () => void
  closeModal: () => void
}

const MarketingInquiryContext = createContext<MarketingInquiryContextValue | null>(null)

export function MarketingInquiryProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)

  const openModal = useCallback(() => setOpen(true), [])
  const closeModal = useCallback(() => setOpen(false), [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeModal()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [closeModal])

  return (
    <MarketingInquiryContext.Provider value={{ openModal, closeModal }}>
      {children}
      <InquiryModal open={open} onClose={closeModal} />
    </MarketingInquiryContext.Provider>
  )
}

export function useMarketingInquiry() {
  const ctx = useContext(MarketingInquiryContext)
  if (!ctx) throw new Error('useMarketingInquiry must be used within MarketingInquiryProvider')
  return ctx
}

function InquiryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))

    try {
      const res = await fetch('https://formsubmit.co/ajax/support@smbhealthsupply.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: 'New SMB Health Supply inquiry',
          _template: 'table',
          name: data.name,
          email: data.email,
          phone: data.phone,
          organization: data.organization,
          message: data.message || '—',
        }),
      })
      if (!res.ok) throw new Error('Submit failed')
      setSuccess(true)
      form.reset()
    } catch {
      alert(
        'Something went wrong. Please call us at (913) 302-6065 or email support@smbhealthsupply.com.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  function handleClose() {
    setSuccess(false)
    onClose()
  }

  return (
    <div
      className={`modal-overlay${open ? ' open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
    >
      <div className="modal">
        <div className="modal-header">
          <div>
            <h2 id="modal-title">Get in touch</h2>
            <p>Tell us about your practice and we&apos;ll follow up promptly.</p>
          </div>
          <button type="button" className="modal-close" aria-label="Close" onClick={handleClose}>
            &times;
          </button>
        </div>
        {!success ? (
          <form className="modal-form" onSubmit={handleSubmit}>
            <div className="form-row two-col">
              <div className="form-group">
                <label htmlFor="inq-name">Full name *</label>
                <input id="inq-name" name="name" required autoComplete="name" />
              </div>
              <div className="form-group">
                <label htmlFor="inq-email">Email *</label>
                <input id="inq-email" name="email" type="email" required autoComplete="email" />
              </div>
            </div>
            <div className="form-row two-col">
              <div className="form-group">
                <label htmlFor="inq-phone">Phone *</label>
                <input id="inq-phone" name="phone" type="tel" required autoComplete="tel" />
              </div>
              <div className="form-group">
                <label htmlFor="inq-org">Organization / Practice *</label>
                <input id="inq-org" name="organization" required />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="inq-message">Additional details</label>
              <textarea
                id="inq-message"
                name="message"
                placeholder="Tell us about your wound care program, volume, or questions…"
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
              {submitting ? 'Sending…' : 'Submit inquiry'}
            </button>
          </form>
        ) : (
          <div className="form-success show">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <h3>Thank you!</h3>
            <p>A member of our team will reach out shortly.</p>
            <button type="button" className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={handleClose}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
