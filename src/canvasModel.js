import { bundledById } from './background.js'
import { textFonts } from './typography.js'
import { readWidget, widgetRegistry } from './widgetModel.js'

export const canvasSize = { width: 1200, height: 675 }
export const canvasLimit = 64
export const canvasGrid = 24
export const minLayerSize = 24
export const defaultWidgetSurfaceOpacity = 26
export const canvasTypes = ['rect', 'ellipse', 'frame', 'sticker', 'image', 'text', 'widget']
export const stickers = ['✦', '☾', '♥', '✿', '✶', '☀', '🌿', '☁️', '✨', '🌙']
const validId = (id) => typeof id === 'string' && /^[\w-]{1,64}$/.test(id)

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function number(value, min, max, fallback) {
  return Number.isFinite(value) ? clamp(value, min, max) : fallback
}

export function normalizeAngle(angle) {
  return ((angle + 180) % 360 + 360) % 360 - 180
}

export function readCanvas(value) {
  const layers = []
  const ids = new Set()
  for (const item of Array.isArray(value?.layers) ? value.layers : []) {
    if (!canvasTypes.includes(item?.type) || !validId(item.id) || ids.has(item.id)) continue
    const width = number(item.width, minLayerSize, canvasSize.width, 240)
    const height = number(item.height, minLayerSize, canvasSize.height, 144)
    const props = item.props ?? {}
    const layer = {
      id: item.id, type: item.type,
      name: typeof item.name === 'string' ? item.name.trim().slice(0, 60) : '',
      x: number(item.x, 0, canvasSize.width - width, 0),
      y: number(item.y, 0, canvasSize.height - height, 0),
      width, height,
      rotation: Number.isFinite(item.rotation) ? normalizeAngle(item.rotation) : 0,
      opacity: number(item.opacity, 0, 100, 100),
      locked: item.locked === true, hidden: item.hidden === true,
      groupId: validId(item.groupId) ? item.groupId : null,
      props: {
        color: typeof props.color === 'string' && /^#[0-9a-f]{6}$/i.test(props.color) ? props.color.toLowerCase() : '#e9c779',
      },
    }
    if (item.type === 'frame') layer.props.stroke = number(props.stroke, 1, 32, 8)
    if (item.type === 'sticker') layer.props.symbol = stickers.includes(props.symbol) ? props.symbol : stickers[0]
    if (item.type === 'image') {
      if (typeof props.assetId !== 'string' || (!bundledById.has(props.assetId) && !/^asset:[\w-]+$/.test(props.assetId))) continue
      layer.props.assetId = props.assetId
    }
    if (item.type === 'text') {
      layer.props.text = typeof props.text === 'string' ? props.text.slice(0, 480) : ''
      layer.props.font = Object.hasOwn(textFonts, props.font) ? props.font : 'serif'
      layer.props.size = number(props.size, 12, 120, 48)
    }
    if (item.type === 'widget') {
      const config = readWidget(props.kind, props.config)
      if (!config) continue
      Object.assign(layer.props, {
        kind: props.kind, config,
        surface: ['glass', 'paper', 'clear'].includes(props.surface) ? props.surface : 'glass',
        surfaceOpacity: number(props.surfaceOpacity, 0, 100, defaultWidgetSurfaceOpacity),
      })
      if (!props.color) layer.props.color = '#fffdf4'
    }
    layers.push(layer)
    ids.add(item.id)
    if (layers.length === canvasLimit) break
  }
  const canvas = { layers: tidyGroups(layers) }
  const widgetIds = new Set(layers.filter(({ type }) => type === 'widget').map(({ id }) => id))
  const layout = value?.widgetLayout
  const order = Array.isArray(layout?.order) ? layout.order.filter((id) => widgetIds.delete(id)) : []
  if (layout?.mode === 'auto' || order.length) {
    canvas.widgetLayout = { mode: layout.mode === 'auto' ? 'auto' : 'free', order }
  }
  return canvas
}

export function makeLayer(type, index, props) {
  const sizes = {
    rect: [264, 168], ellipse: [190, 190], frame: [344, 228],
    sticker: [116, 116], image: [324, 204], text: [368, 122],
  }
  const [width, height] = type === 'widget' ? widgetRegistry[props.kind].size : sizes[type]
  const offset = index % 6 * 24
  return readCanvas({ layers: [{
    id: crypto.randomUUID(), type, props, width, height,
    x: canvasSize.width / 2 - width / 2 + offset,
    y: canvasSize.height * 0.27 - height / 2 + offset,
  }] }).layers[0]
}

export function localCanvasPictures(canvas) {
  return [...new Set(readCanvas(canvas).layers.filter(({ type, props }) =>
    type === 'image' && !bundledById.has(props.assetId)).map(({ props }) => props.assetId))]
}

export function tidyGroups(layers) {
  const counts = new Map()
  for (const { groupId } of layers) {
    if (groupId) counts.set(groupId, (counts.get(groupId) ?? 0) + 1)
  }
  return layers.map((layer) => layer.groupId && counts.get(layer.groupId) < 2 ? { ...layer, groupId: null } : layer)
}

export function duplicateLayers(layers, ids, newId) {
  const groupIds = new Map()
  const copies = layers.filter((layer) => ids.includes(layer.id)).map((layer) => {
    if (layer.groupId && !groupIds.has(layer.groupId)) groupIds.set(layer.groupId, newId())
    return {
      ...layer, id: newId(), locked: false,
      x: clamp(layer.x + canvasGrid, 0, canvasSize.width - layer.width),
      y: clamp(layer.y + canvasGrid, 0, canvasSize.height - layer.height),
      groupId: groupIds.get(layer.groupId) ?? null,
    }
  })
  return tidyGroups(copies.slice(0, Math.max(0, canvasLimit - layers.length)))
}

export function reorderLayers(layers, ids, direction) {
  const selected = new Set(ids)
  const next = layers.slice()
  const indexes = next.map((_, index) => index)
  if (direction > 0) indexes.reverse()
  for (const index of indexes) {
    const neighbor = next[index + direction]
    if (neighbor && selected.has(next[index].id) && !selected.has(neighbor.id)) {
      next[index + direction] = next[index]
      next[index] = neighbor
    }
  }
  return next.every((layer, index) => layer === layers[index]) ? layers : next
}

export function canvasHistory(state, action) {
  if (action.type === 'undo') {
    if (!state.past.length) return state
    return { past: state.past.slice(0, -1), layers: state.past.at(-1), future: [state.layers, ...state.future] }
  }
  if (action.type === 'redo') {
    if (!state.future.length) return state
    return { past: [...state.past, state.layers], layers: state.future[0], future: state.future.slice(1) }
  }
  const layers = action.next(state.layers)
  if (layers === state.layers || (layers.length === state.layers.length && layers.every((layer, index) => layer === state.layers[index]))) return state
  return { past: [...state.past.slice(-79), state.layers], layers, future: [] }
}
