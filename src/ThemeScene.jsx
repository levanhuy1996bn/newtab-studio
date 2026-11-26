import { useEffect, useState } from 'react'
import { sceneColors } from './themeCatalog.js'
import { SceneBackground } from './backgroundRendering.jsx'
import { SceneText } from './TextLayers.jsx'
import { SceneCanvas } from './CanvasScene.jsx'
import { hasClockWidget } from './widgetModel.js'
import { SceneEffects } from './SceneEffects.jsx'

export function ThemeScene({ theme, overrides, background, textLayers, canvas, canvasEditor, language,
  liveWidgets, dockWidgets, still, effects, motion, className = '', children }) {
  const [base, mid, accent] = sceneColors(theme, overrides)
  const wallpaper = (!background || background.type === 'preset') ? theme.wallpaper : null
  const visualBackground = wallpaper ?? background
  const animate = effects && !still && !motion?.disabled
  return (
    <div
      className={`scene ${className}`}
      data-motif={theme.motif}
      data-background={visualBackground?.type ?? 'preset'}
      data-parallax={animate && !motion?.paused && effects.backdrop === 'parallax' || undefined}
      style={{ '--scene-base': base, '--scene-mid': mid, '--scene-accent': accent }}
    >
      <div className="scene-art" aria-hidden="true">
        <i className="scene-sun" />
        <i className="scene-form scene-form-back" />
        <i className="scene-form scene-form-front" />
        <i className="scene-grain" />
      </div>
      <SceneBackground background={visualBackground} still={still} paused={motion?.disabled} />
      {wallpaper && overrides && <div className="scene-preset-palette" aria-hidden="true" />}
      {animate && <SceneEffects effects={effects} paused={motion?.paused} />}
      <SceneText layers={textLayers} language={language}>{!hasClockWidget(canvas) && children}</SceneText>
      <SceneCanvas canvas={canvas} editor={canvasEditor} language={language} liveWidgets={liveWidgets} dockWidgets={dockWidgets} />
    </div>
  )
}

export function Clock({ language }) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const locale = language === 'vi' ? 'vi-VN' : 'en-US'
  const time = new Intl.DateTimeFormat(locale, {
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).format(now)
  const date = new Intl.DateTimeFormat(locale, {
    weekday: 'long', month: 'long', day: 'numeric',
  }).format(now)

  return (
    <div className="scene-clock">
      <time className="clock-time" dateTime={now.toISOString()}>{time}</time>
      <div className="clock-date">{date}</div>
    </div>
  )
}
