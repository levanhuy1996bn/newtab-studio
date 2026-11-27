import { useEffect, useRef, useState } from 'react'
import { saveThemeDraft } from './studioRepository.js'

export function useThemeDraft(themeId, part, value) {
  const previous = useRef(null)
  const [status, setStatus] = useState(null)
  const serialized = value == null ? null : JSON.stringify(value)
  useEffect(() => {
    if (serialized === null) return
    if (previous.current === null) {
      previous.current = serialized
      return
    }
    if (previous.current === serialized) return
    previous.current = serialized
    let alive = true
    saveThemeDraft(themeId, part, JSON.parse(serialized)).then(() => {
      if (alive) setStatus('phaseDraftSaved')
    }).catch(() => {
      if (alive) setStatus('phaseDraftError')
    })
    return () => { alive = false }
  }, [themeId, part, serialized])
  return status
}
