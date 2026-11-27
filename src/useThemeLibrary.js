import { useEffect, useState } from 'react'
import { defaultWorkspaceId } from './studioData.js'
import { readThemeLibrary, watchStudio } from './studioRepository.js'

const emptyLibrary = { custom: [], saved: [], drafts: new Set(), workspaces: [{ id: defaultWorkspaceId, name: '' }] }

export function useThemeLibrary() {
  const [library, setLibrary] = useState(emptyLibrary)
  const [error, setError] = useState(null)
  useEffect(() => {
    let current = 0
    let alive = true
    async function refresh() {
      const request = ++current
      try {
        const saved = await readThemeLibrary()
        if (alive && request === current) {
          setLibrary(saved)
          setError(null)
        }
      } catch {
        if (alive && request === current) setError('readError')
      }
    }
    const stop = watchStudio((event) => {
      if (['library', 'selection', 'restore', 'draft'].includes(event)) void refresh()
    })
    void refresh()
    return () => { alive = false; stop() }
  }, [])
  return { ...library, error }
}

