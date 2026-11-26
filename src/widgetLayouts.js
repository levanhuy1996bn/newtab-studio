import { canvasLimit, canvasSize, makeLayer } from './canvasModel.js'
import { widgetRegistry } from './widgetModel.js'

export const layoutPresets = {
  minimal: [['digital', 400, 74, 400, 144], ['search', 340, 286, 520, 120], ['quote', 390, 460, 420, 130]],
  work: [['digital', 60, 52, 350, 126], ['search', 505, 52, 635, 126], ['todo', 60, 224, 416, 345],
    ['calendar', 510, 224, 340, 345], ['links', 880, 224, 260, 345]],
  study: [['greeting', 65, 52, 390, 138], ['digital', 530, 52, 390, 138], ['pomodoro', 65, 228, 390, 254],
    ['notes', 530, 228, 560, 330]],
}

export function orderedWidgets(canvas) {
  const widgets = new Map((canvas?.layers ?? []).filter(({ type }) => type === 'widget').map((layer) => [layer.id, layer]))
  const ordered = []
  for (const id of canvas?.widgetLayout?.order ?? []) {
    if (widgets.has(id)) ordered.push(widgets.get(id))
    widgets.delete(id)
  }
  return [...ordered, ...widgets.values()]
}

const overlaps = (a, b) => a.x < b.x + b.width && a.x + a.width > b.x
  && a.y < b.y + b.height && a.y + a.height > b.y

function place(existing, designs) {
  if (!designs.length || existing.length + designs.length > canvasLimit) return null
  const occupied = existing.filter((layer) => !layer.hidden)
  const minX = Math.min(...designs.map(([, x]) => x))
  const minY = Math.min(...designs.map(([, , y]) => y))
  const width = Math.max(...designs.map(([, x, , w]) => x + w)) - minX
  const height = Math.max(...designs.map(([, , y, , h]) => y + h)) - minY
  for (const scale of [1, 0.85, 0.7]) {
    const limitX = canvasSize.width - width * scale
    const limitY = canvasSize.height - height * scale
    const candidates = [[Math.min(minX, limitX), Math.min(minY, limitY)]]
    for (let y = 0; y <= limitY; y += 24) {
      for (let x = 0; x <= limitX; x += 24) candidates.push([x, y])
    }
    candidates.push([limitX, limitY])
    for (const [originX, originY] of candidates) {
      const boxes = designs.map(([kind, x, y, w, h]) => ({
        kind, x: originX + (x - minX) * scale, y: originY + (y - minY) * scale, width: w * scale, height: h * scale,
      }))
      if (boxes.every((box) => !occupied.some((layer) => overlaps(box, layer)))) {
        return boxes.map(({ kind, ...box }, index) => ({ ...makeLayer('widget', index, { kind }), ...box }))
      }
    }
  }
  return null
}

export function insertPreset(layers, preset) {
  return Object.hasOwn(layoutPresets, preset) ? place(layers, layoutPresets[preset]) : null
}

export function insertWidget(layers, kind) {
  if (!Object.hasOwn(widgetRegistry, kind)) return null
  const [width, height] = widgetRegistry[kind].size
  return place(layers, [[kind, 72, 54, width, height]])
}
