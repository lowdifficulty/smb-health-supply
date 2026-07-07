import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { setAsgData, getAsgData } from '../data/asgData'

type AsgDataSource = 'live' | 'static' | 'loading'

interface AsgDataContextValue {
  ready: boolean
  source: AsgDataSource
  generatedAt: string
  refresh: () => Promise<void>
}

const AsgDataContext = createContext<AsgDataContextValue | null>(null)

async function fetchLiveAsgData(): Promise<boolean> {
  try {
    const res = await fetch('/api/asg-data')
    if (!res.ok) return false
    const data = await res.json()
    if (data?.claims && data?.remitEvents) {
      setAsgData(data)
      return true
    }
  } catch {
    // static fallback already loaded
  }
  return false
}

export function AsgDataProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [source, setSource] = useState<AsgDataSource>('loading')

  async function load() {
    setSource('loading')
    const live = await fetchLiveAsgData()
    setSource(live ? 'live' : 'static')
    setReady(true)
  }

  useEffect(() => {
    load()
  }, [])

  const generatedAt = getAsgData().generatedAt

  return (
    <AsgDataContext.Provider
      value={{
        ready,
        source,
        generatedAt,
        refresh: load,
      }}
    >
      {children}
    </AsgDataContext.Provider>
  )
}

export function useAsgDataMeta() {
  const ctx = useContext(AsgDataContext)
  if (!ctx) throw new Error('useAsgDataMeta must be used within AsgDataProvider')
  return ctx
}
