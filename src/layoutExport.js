import { readBackground } from './background.js'
import { readCanvas } from './canvasModel.js'
import { readTextLayers } from './typography.js'
import { hasEffects, readEffects } from './effects.js'

export function exportLayout({ themeId, overrides, background, textLayers, canvas, effects }) {
  const normalizedEffects = readEffects(effects)
  return {
    format: 'newtab-studio.layout', schemaVersion: 1, themeId, overrides: overrides ?? null,
    background: background ? readBackground(background) : null,
    textLayers: readTextLayers(textLayers),
    canvas: readCanvas(canvas),
    ...(hasEffects(normalizedEffects) ? { effects: normalizedEffects } : {}),
  }
}
