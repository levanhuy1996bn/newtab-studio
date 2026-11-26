import { useEffect, useRef, useState } from 'react'
import { hasEffects } from './effects.js'

const reducedMotion = '(prefers-reduced-motion: reduce)'

export function useMotionPreference(performanceMode) {
  const [reduced, setReduced] = useState(() => window.matchMedia(reducedMotion).matches)
  const [hidden, setHidden] = useState(() => document.hidden)
  useEffect(() => {
    const media = window.matchMedia(reducedMotion)
    const updateMotion = () => setReduced(media.matches)
    const updateVisibility = () => setHidden(document.hidden)
    media.addEventListener('change', updateMotion)
    document.addEventListener('visibilitychange', updateVisibility)
    updateMotion()
    updateVisibility()
    return () => {
      media.removeEventListener('change', updateMotion)
      document.removeEventListener('visibilitychange', updateVisibility)
    }
  }, [])
  return { disabled: performanceMode || reduced, paused: hidden }
}

const speedFactors = { slow: 1.5, normal: 1, fast: 0.62 }
const strengths = { subtle: 0.35, normal: 0.65, strong: 0.95 }
const counts = { subtle: 8, normal: 16, strong: 24 }

export function motionAttributes(effects, motion) {
  if (!effects || motion.disabled || !hasEffects(effects)) return {}
  const loop = effects.finish === 'loop'
  return {
    'data-text-motion': effects.text,
    'data-widget-motion': effects.widget,
    'data-motion-paused': motion.paused || undefined,
    style: {
      '--motion-cycle': loop ? 'infinite' : '1',
      '--motion-duration': ((loop ? 4.2 : 0.85) * speedFactors[effects.speed]) + 's',
      '--motion-depth': strengths[effects.strength],
    },
  }
}

const particleStyles = Array.from({ length: 24 }, (_, index) => ({
  '--particle-x': ((index * 37 + 7) % 100) + '%',
  '--particle-y': ((index * 53 + 11) % 100) + '%',
  '--particle-size': (3 + index * 11 % 7) + 'px',
  '--particle-drift': ((index * 127 % 300) - 150) + 'px',
  '--particle-delay': (-index * 0.73) + 's',
}))

function Parallax({ strength, speed, paused }) {
  const marker = useRef(null)
  useEffect(() => {
    const scene = marker.current.parentElement
    let frame = 0
    function reset() {
      cancelAnimationFrame(frame)
      scene.style.removeProperty('--parallax-x')
      scene.style.removeProperty('--parallax-y')
    }
    if (paused) {
      reset()
      return
    }
    function move(event) {
      if (event.pointerType === 'touch') return
      const distance = strength * Math.min(20, Math.min(window.innerWidth, window.innerHeight) * 0.033)
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        scene.style.setProperty('--parallax-x', (event.clientX / window.innerWidth * 2 - 1) * distance + 'px')
        scene.style.setProperty('--parallax-y', (event.clientY / window.innerHeight * 2 - 1) * distance + 'px')
      })
    }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('blur', reset)
    scene.style.setProperty('--parallax-duration', speed * 0.25 + 's')
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('blur', reset)
      reset()
      scene.style.removeProperty('--parallax-duration')
    }
  }, [paused, strength, speed])
  return <span ref={marker} hidden />
}

export function SceneEffects({ effects, paused }) {
  const strength = strengths[effects.strength]
  const speed = speedFactors[effects.speed]
  const type = effects.backdrop
  if (type === 'none') return null
  if (type === 'parallax') return <Parallax strength={strength} speed={speed} paused={paused} />
  return <div className="scene-effects" data-effect={type} aria-hidden="true"
    style={{ '--effect-duration': speed * (type === 'rain' ? 1.45 : 12) + 's', '--effect-strength': strength }}>
    {type !== 'color' && particleStyles.slice(0, counts[effects.strength]).map((style, index) => <i key={index} style={style} />)}
  </div>
}
