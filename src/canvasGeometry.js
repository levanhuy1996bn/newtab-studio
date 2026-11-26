import { canvasGrid, canvasSize, clamp, minLayerSize, normalizeAngle } from './canvasModel.js'

export function bounds(layers) {
  const x = Math.min(...layers.map((layer) => layer.x))
  const y = Math.min(...layers.map((layer) => layer.y))
  return {
    x, y,
    width: Math.max(...layers.map((layer) => layer.x + layer.width)) - x,
    height: Math.max(...layers.map((layer) => layer.y + layer.height)) - y,
  }
}

export function center(box) {
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
}

function rotatePoint(point, degrees) {
  const angle = degrees * Math.PI / 180
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  return { x: point.x * cos - point.y * sin, y: point.x * sin + point.y * cos }
}

function axisValues(box, axis) {
  const start = box[axis]
  const size = axis === 'x' ? box.width : box.height
  return [start, start + size / 2, start + size]
}

function nearestSnap(moving, targets, tolerance) {
  let nearest = null
  for (const target of targets) {
    for (const edge of moving) {
      const delta = target - edge
      if (Math.abs(delta) <= tolerance && (!nearest || Math.abs(delta) < Math.abs(nearest.delta))) {
        nearest = { delta, guide: target }
      }
    }
  }
  return nearest
}

export function moveLayers(items, dx, dy, { others = [], tolerance = 0, grid = false } = {}) {
  const box = bounds(items)
  const plane = { x: 0, y: 0, ...canvasSize }
  const guides = {}
  const offset = {}
  for (const [axis, delta, dimension] of [['x', dx, 'width'], ['y', dy, 'height']]) {
    const targets = tolerance > 0 ? [plane, ...others].flatMap((item) => axisValues(item, axis)) : []
    const candidate = nearestSnap(axisValues(box, axis).map((edge) => edge + delta), targets, tolerance)
    const adjusted = delta + (candidate?.delta ?? (grid ? Math.round((box[axis] + delta) / canvasGrid) * canvasGrid - box[axis] - delta : 0))
    offset[axis] = clamp(adjusted, -box[axis], canvasSize[dimension] - box[axis] - box[dimension])
    if (candidate && offset[axis] === adjusted) guides[axis] = candidate.guide
  }
  return { items: items.map((layer) => ({ ...layer, x: layer.x + offset.x, y: layer.y + offset.y })), guides }
}

export function resizeLayers(items, delta, { proportional = false, grid = false } = {}) {
  if (items.length === 1) {
    const [layer] = items
    const { width, height, rotation } = layer
    const local = rotatePoint(delta, -rotation)
    const snap = (value) => grid ? Math.round(value / canvasGrid) * canvasGrid : value
    let nextWidth = clamp(snap(width + local.x), minLayerSize, canvasSize.width)
    let nextHeight = clamp(snap(height + local.y), minLayerSize, canvasSize.height)
    if (proportional) {
      const scale = clamp(Math.abs(local.x / width) >= Math.abs(local.y / height) ? nextWidth / width : nextHeight / height,
        Math.max(minLayerSize / width, minLayerSize / height),
        Math.min(canvasSize.width / width, canvasSize.height / height))
      nextWidth = width * scale
      nextHeight = height * scale
    }
    const shift = rotatePoint({ x: (nextWidth - width) / 2, y: (nextHeight - height) / 2 }, rotation)
    const pivot = center(layer)
    return [{
      ...layer, width: nextWidth, height: nextHeight,
      x: clamp(pivot.x + shift.x - nextWidth / 2, 0, canvasSize.width - nextWidth),
      y: clamp(pivot.y + shift.y - nextHeight / 2, 0, canvasSize.height - nextHeight),
    }]
  }

  const box = bounds(items)
  const max = Math.min((canvasSize.width - box.x) / box.width, (canvasSize.height - box.y) / box.height)
  const min = Math.max(...items.flatMap(({ width, height }) => [minLayerSize / width, minLayerSize / height]))
  const scale = clamp(1 + (Math.abs(delta.x / box.width) > Math.abs(delta.y / box.height)
    ? delta.x / box.width : delta.y / box.height), min, max)
  return items.map((layer) => ({
    ...layer, x: box.x + (layer.x - box.x) * scale, y: box.y + (layer.y - box.y) * scale,
    width: layer.width * scale, height: layer.height * scale,
  }))
}

export function rotateLayers(items, pivot, start, point, snap = false) {
  const heading = ({ x, y }) => Math.atan2(y - pivot.y, x - pivot.x) * 180 / Math.PI
  let delta = normalizeAngle(heading(point) - heading(start))
  if (snap) delta = Math.round(delta / 15) * 15
  return items.map((layer) => {
    const original = center(layer)
    const relative = rotatePoint({ x: original.x - pivot.x, y: original.y - pivot.y }, delta)
    return {
      ...layer,
      x: clamp(pivot.x + relative.x - layer.width / 2, 0, canvasSize.width - layer.width),
      y: clamp(pivot.y + relative.y - layer.height / 2, 0, canvasSize.height - layer.height),
      rotation: normalizeAngle(layer.rotation + delta),
    }
  })
}

export function alignLayers(items, axis, edge) {
  const region = items.length === 1 ? { x: 0, y: 0, ...canvasSize } : bounds(items)
  const dimension = axis === 'x' ? 'width' : 'height'
  return items.map((layer) => ({ ...layer, [axis]: region[axis] + (region[dimension] - layer[dimension]) * edge }))
}
