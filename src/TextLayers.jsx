import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { layerText, localDay, textFonts } from './typography.js'

function useQuoteDay() {
  const [day, setDay] = useState(() => localDay(new Date()))

  useEffect(() => {
    let timer
    function schedule() {
      window.clearTimeout(timer)
      if (document.hidden) return
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setHours(24, 0, 0, 0)
      setDay(localDay(now))
      // Recheck periodically in case the local clock or timezone changes.
      timer = window.setTimeout(schedule, Math.min(tomorrow - now + 40, 60_000))
    }
    schedule()
    document.addEventListener('visibilitychange', schedule)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', schedule)
    }
  }, [])

  return day
}

function TextLayer({ layer, text }) {
  const { font, size, weight, color, alignment, lineHeight, spacing, rotation, opacity, shadow } = layer
  const elementRef = useRef(null)
  const radians = Math.abs(rotation) * Math.PI / 180
  const sin = Math.sin(radians)

  useLayoutEffect(() => {
    if (!rotation) return
    const element = elementRef.current
    const scene = element.closest('.scene')

    function fitRotation() {
      const rotatedWidth = element.offsetWidth * Math.cos(radians) + element.offsetHeight * sin
      const availableWidth = Math.max(1, scene.clientWidth - 12)
      element.style.setProperty('--text-fit', String(Math.min(1, availableWidth / Math.max(1, rotatedWidth))))
    }

    const observer = new ResizeObserver(fitRotation)
    observer.observe(element)
    observer.observe(scene)
    fitRotation()
    return () => {
      observer.disconnect()
      element.style.removeProperty('--text-fit')
    }
  }, [rotation, radians, sin])

  return (
    <p ref={elementRef} className="scene-text-layer" data-text-id={layer.id} data-text-mode={layer.mode} style={{
      fontFamily: textFonts[font].stack,
      fontSize: `clamp(12px, ${size / 6.6}cqw, ${size}px)`,
      fontWeight: weight,
      color,
      textAlign: alignment,
      lineHeight: lineHeight / 100,
      letterSpacing: spacing + 'px',
      rotate: rotation + 'deg',
      marginBlock: `min(${44 * sin}cqw, ${425 * sin}px)`,
      opacity: opacity / 100,
      '--text-opacity': opacity / 100,
      textShadow: shadow ? '0 2px 8px #101916e6' : 'none',
    }}>{text}</p>
  )
}

function TextStack({ layers, language, day, children }) {
  const renderAt = (position) => layers.filter((layer) => layer.placement === position).map((layer) => (
    <TextLayer key={layer.id} layer={layer} text={layerText(layer, language, day)} />
  ))
  return <div className="scene-text-stack">{renderAt('above')}{children}{renderAt('below')}</div>
}

function DailyTextStack(props) {
  const day = useQuoteDay()
  return <TextStack {...props} day={day} />
}

export function SceneText({ layers, language, children }) {
  const visible = layers?.filter((layer) => layer.mode === 'daily' || layer.text.trim())
  if (!visible?.length) return children
  const Stack = visible.some((layer) => layer.mode === 'daily') ? DailyTextStack : TextStack
  return <Stack layers={visible} language={language}>{children}</Stack>
}
