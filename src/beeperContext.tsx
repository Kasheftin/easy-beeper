import { createContext, useContext, type ReactNode } from 'react'
import { useBeeper } from './useBeeper'
import { useSettings } from './settingsContext'
import { Beep } from './model';

type BeeperContextValue = ReturnType<typeof useBeeper> & {
  beeps: Beep[]
}

const BeeperContext = createContext<BeeperContextValue | null>(null)

export function BeeperProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings()
  const beeper = useBeeper(settings.beeps)
  return <BeeperContext.Provider value={{...beeper, beeps: settings.beeps}}>{children}</BeeperContext.Provider>
}

export function useBeeperContext(): BeeperContextValue {
  const ctx = useContext(BeeperContext)
  if (!ctx) throw new Error('useBeeperContext must be used inside BeeperProvider')
  return ctx
}
