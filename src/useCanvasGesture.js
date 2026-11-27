import { useEffect, useRef, useState } from 'react'
import { bounds, center, moveLayers, resizeLayers, rotateLayers } from './canvasGeometry.js'
import { canvasSize } from './canvasModel.js'

function position(event, rect) {
  return {
    x: (event.clientX - rect.left) * canvasSize.width / rect.width,
    y: (event.clientY - rect.top) * canvasSize.height / rect.height,
  }
}

export function useCanvasGesture(onCommit, canSnapTo = () => true) {
  const planeRef = useRef(null)
  const session = useRef(null)
  const [preview, setPreview] = useState(null)
  useEffect(() => () => {
    session.current?.detach()
    session.current = null
  }, [])

  function begin(event, mode, layers, selected, grid) {
    if (event.button !== 0 || session.current || !selected.length) return
    const plane = planeRef.current
    const rect = plane.getBoundingClientRect()
    const items = layers.filter((layer) => selected.includes(layer.id) && !layer.hidden && !layer.locked)
    if (!items.length || !rect.width) return
    event.preventDefault()
    plane.focus({ preventScroll: true })
    plane.setPointerCapture(event.pointerId)
    const point = position(event, rect)
    // Keep tracking across compositor capture loss while the pointer is still pressed.
    const end = (pointer) => finish(pointer, true)
    const cancel = (pointer) => finish(pointer, false)
    const blur = () => finish(null, false)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', end)
    window.addEventListener('pointercancel', cancel)
    window.addEventListener('blur', blur)
    session.current = {
      mode, rect, point, layers, items, grid, plane, pointerId: event.pointerId, next: null,
      startX: event.clientX, startY: event.clientY,
      others: layers.filter((layer) => !layer.hidden && !items.includes(layer) && canSnapTo(layer)),
      pivot: center(bounds(items)),
      detach() {
        window.removeEventListener('pointermove', move)
        window.removeEventListener('pointerup', end)
        window.removeEventListener('pointercancel', cancel)
        window.removeEventListener('blur', blur)
      },
    }
    setPreview({ layers, guides: {} })
  }

  function move(event) {
    const state = session.current
    if (!state || state.pointerId !== event.pointerId) return
    if (event.buttons === 0) {
      finish(event, false)
      return
    }
    if (!state.next && Math.hypot(event.clientX - state.startX, event.clientY - state.startY) < 3) return
    const point = position(event, state.rect)
    const delta = { x: point.x - state.point.x, y: point.y - state.point.y }
    let items
    let guides = {}
    if (state.mode === 'move') {
      ({ items, guides } = moveLayers(state.items, delta.x, delta.y, {
        others: state.others, tolerance: 5 * canvasSize.width / state.rect.width, grid: state.grid,
      }))
    } else if (state.mode === 'resize') {
      items = resizeLayers(state.items, delta, { proportional: event.shiftKey, grid: state.grid })
    } else {
      items = rotateLayers(state.items, state.pivot, state.point, point, event.shiftKey)
    }
    const byId = new Map(items.map((layer) => [layer.id, layer]))
    state.next = state.layers.map((layer) => {
      const next = byId.get(layer.id)
      return next && ['x', 'y', 'width', 'height', 'rotation'].some((key) => Math.abs(next[key] - layer[key]) > 0.01) ? next : layer
    })
    setPreview({ layers: state.next, guides })
  }

  function finish(event, commit) {
    const state = session.current
    if (!state || (event && state.pointerId !== event.pointerId)) return false
    session.current = null
    state.detach()
    setPreview(null)
    if (state.plane.hasPointerCapture(state.pointerId)) state.plane.releasePointerCapture(state.pointerId)
    if (commit && state.next) onCommit(state.next)
    return true
  }

  return {
    planeRef, preview, begin,
    lostCapture: (event) => { if (event.buttons === 0) finish(event, false) },
    cancel: () => finish(null, false),
  }
}
