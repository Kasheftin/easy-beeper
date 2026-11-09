import { useEffect, useState } from 'react'

export function useTimer() {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    let timeout = 0
    const run = () => {
      setNow(Date.now())
      timeout = setTimeout(run, 250)
    }
    run()
    return () => clearTimeout(timeout)
  }, [])
  return now
}
