import assert from 'node:assert/strict'
import test from 'node:test'
import { alignLayers, bounds, center, moveLayers, resizeLayers, rotateLayers } from '../src/canvasGeometry.js'
import { canvasHistory, duplicateLayers, localCanvasPictures, readCanvas, reorderLayers } from '../src/canvasModel.js'

const rect = (id, x, y, groupId = null) => ({ id, type: 'rect', x, y, width: 100, height: 80, rotation: 0, groupId })

test('normalizes malformed layers and retains references to local images', () => {
  const rows = [
    { ...rect('a', -100, 4000, 'orphan'), rotation: 360, opacity: 200 },
    { id: 'b', type: 'image', props: { assetId: 'asset:abc' } },
    { id: 'c', type: 'image', props: { assetId: 'https://example.test/image.jpg' } },
    { id: 'd', type: 'image', props: { assetId: 'bundled:blue-marble' } },
    rect('a', 250, 250),
  ]
  const canvas = readCanvas({ layers: rows })
  assert.deepEqual(canvas.layers.map(({ id }) => id), ['a', 'b', 'd'])
  assert.equal(canvas.layers[0].x, 0)
  assert.equal(canvas.layers[0].y, 595)
  assert.equal(canvas.layers[0].rotation, 0)
  assert.equal(canvas.layers[0].groupId, null)
  assert.deepEqual(localCanvasPictures(canvas), ['asset:abc'])
})

test('moves groups against the bounds and snaps to both guides and grid', () => {
  const items = [rect('a', 100, 100), rect('b', 300, 110)]
  const first = moveLayers(items, -999, 0)
  assert.deepEqual(first.items.map(({ x }) => x), [0, 200])
  const grid = moveLayers(items, 8, 19, { grid: true })
  assert.deepEqual(grid.items.map(({ x, y }) => [x, y]), [[120, 120], [320, 130]])
  const guided = moveLayers(items, 97, 0, { others: [rect('other', 200, 320)], tolerance: 4 })
  assert.equal(guided.items[0].x, 200)
  assert.equal(guided.guides.x, 200)
})

test('resizes in the rotated frame and applies proportional group transforms', () => {
  const single = { ...rect('a', 200, 180), rotation: 90 }
  const [size] = resizeLayers([single], { x: 0, y: 60 })
  assert.equal(Math.round(size.width), 160)
  assert.equal(Math.round(size.height), 80)
  const items = [rect('b', 300, 200), rect('c', 500, 220)]
  const resized = resizeLayers(items, { x: 150, y: 0 })
  assert.equal(resized[0].width, 150)
  assert.equal(resized[1].x, 600)
  const pivot = center(bounds(items))
  const rotated = rotateLayers(items, pivot, { x: pivot.x, y: pivot.y - 50 }, { x: pivot.x + 50, y: pivot.y }, true)
  assert.deepEqual(rotated.map(({ rotation }) => rotation), [90, 90])
  assert.equal(Math.round(center(rotated[0]).y), Math.round(pivot.y - 100))
  assert.equal(alignLayers([single], 'x', 0.5)[0].x, 550)
})

test('group duplication and layer order are reversible in a single history step', () => {
  const a = rect('a', 100, 100, 'g')
  const b = rect('b', 250, 100, 'g')
  const c = rect('c', 450, 100)
  let counter = 0
  const copies = duplicateLayers([a, b, c], ['a', 'b'], () => 'copy-' + ++counter)
  assert.equal(copies[0].groupId, copies[1].groupId)
  assert.notEqual(copies[0].groupId, 'g')
  const state = { layers: [a, b, c], past: [], future: [] }
  const updated = canvasHistory(state, { type: 'commit', next: (layers) => reorderLayers(layers, ['a', 'b'], 1) })
  assert.deepEqual(updated.layers.map(({ id }) => id), ['c', 'a', 'b'])
  const undone = canvasHistory(updated, { type: 'undo' })
  assert.equal(undone.layers, state.layers)
  assert.equal(canvasHistory(undone, { type: 'redo' }).layers, updated.layers)
  assert.equal(canvasHistory(updated, { type: 'commit', next: (layers) => layers.slice() }), updated)
})
