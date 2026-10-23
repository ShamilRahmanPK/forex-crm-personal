import { useCallback, useEffect, useState } from 'react'
import { getAccounts } from '../services/api'

/** Loads the user's trading accounts. `reload()` refetches after a mutation. */
export function useAccounts() {
  const [accounts, setAccounts] = useState(null)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let active = true
    getAccounts().then((data) => active && setAccounts(data))
    return () => {
      active = false
    }
  }, [version])

  const reload = useCallback(() => setVersion((v) => v + 1), [])
  return { accounts, reload }
}

export const accountLabel = (a) => `${a.nickname} #${a.id}${a.mode === 'demo' ? ' (Demo)' : ''}`
