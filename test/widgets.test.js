import assert from 'node:assert/strict'
import test from 'node:test'
import { makeLayer, readCanvas } from '../src/canvasModel.js'
import { exportLayout } from '../src/layoutExport.js'
import { insertPreset, insertWidget, layoutPresets, orderedWidgets } from '../src/widgetLayouts.js'
import { calendarModel, historyShortcuts, httpUrl, readWidget, readWidgetData, searchUrl, timerAction, timerRemaining } from '../src/widgetModel.js'

test('widget settings validate links and encode user search as query data', () => {
  assert.equal(httpUrl('javascript:alert(1)'), null)
  assert.equal(httpUrl('data:text/html,hi'), null)
  assert.equal(httpUrl('https://someone:secret@example.com'), null)
  assert.equal(readWidget('missing', {}), null)
  assert.deepEqual(readWidget('links', { links: [{ url: 'https://example.com' }, { url: 'file:///tmp/a' }] }).links,
    [{ url: 'https://example.com/', label: 'example.com' }])
  const query = 'Hà Nội & q=khác #'
  assert.equal(new URL(searchUrl('duckduckgo', query)).searchParams.get('q'), query)
})

test('calendar uses locale starting days and supports month rollover', () => {
  const sunday = new Date(2026, 1, 1, 12)
  assert.equal(calendarModel(sunday, false).offset, 0)
  assert.equal(calendarModel(sunday, true).offset, 6)
  assert.equal(calendarModel(new Date(2028, 1, 29), true).days, 29)
  assert.deepEqual(calendarModel(new Date(2026, 12, 1), true), { year: 2027, month: 0, offset: 4, days: 31 })
})

test('timer persists a deadline and resumes based on elapsed time', () => {
  const config = readWidget('pomodoro', { minutes: 25, breakMinutes: 5 })
  const start = timerAction(readWidgetData('pomodoro'), config, 'start', 10000)
  assert.equal(start.deadline, 1510000)
  assert.equal(timerRemaining(config, start, 100000), 1410000)
  const paused = timerAction(start, config, 'pause', 100000)
  assert.equal(timerRemaining(config, paused, 999000), 1410000)
  assert.equal(timerRemaining(config, start, 1510001), 0)
  assert.equal(timerRemaining(config, timerAction(start, config, 'switch', 0), 0), 300000)
})

test('shortcuts preserve legacy fallback, deliberate removal, and safe history ordering', () => {
  const first = { url: 'https://first.example/', title: 'First', visitCount: 12, lastVisitTime: 11 }
  const recent = { url: 'https://recent.example/', title: 'Recent', visitCount: 2, lastVisitTime: 30 }
  const items = [recent, { ...first, lastVisitTime: 5 }, first, { url: 'chrome://settings', visitCount: 100, lastVisitTime: 50 }]
  assert.deepEqual(historyShortcuts(items, 'frequent').map(({ label }) => label), ['First', 'Recent'])
  assert.deepEqual(historyShortcuts(items, 'recent').map(({ label }) => label), ['Recent', 'First'])
  assert.deepEqual(readWidgetData('links'), { source: 'manual', links: null })
  assert.deepEqual(readWidgetData('links', { source: 'recent', links: [] }), { source: 'recent', links: [] })
  assert.equal(readWidgetData('links', { links: Array.from({ length: 14 }, (_, index) => ({ url: 'https://example.com/' + index })) }).links.length, 12)
})

test('preset insertion finds space, preserves existing layers and creates distinct IDs', () => {
  const first = insertPreset([], 'minimal')
  const second = insertPreset(first, 'minimal')
  assert.equal(first.length, 3)
  assert.equal(second.length, 3)
  assert.equal(new Set([...first, ...second].map((layer) => layer.id)).size, 6)
  const occupied = [{ ...makeLayer('rect', 0), x: 0, y: 0, width: 1200, height: 675 }]
  assert.equal(insertWidget(occupied, 'notes'), null)
  for (const key of Object.keys(layoutPresets)) assert.ok(insertPreset([], key))
})

test('layout export retains widget configuration and excludes private widget data', () => {
  const widget = makeLayer('widget', 0, { kind: 'notes', config: { title: 'Notes' } })
  assert.equal(widget.props.surfaceOpacity, 26)
  widget.props.surfaceOpacity = 14
  widget.props.data = { text: 'private-note' }
  const oldCanvas = readCanvas({ layers: [makeLayer('rect', 0)] })
  assert.equal(oldCanvas.layers[0].type, 'rect')
  const data = exportLayout({
    themeId: 'forest-hour', canvas: { layers: [widget] },
    widgetData: { [widget.id]: { text: 'private-note' } },
  })
  assert.equal(data.canvas.layers[0].props.config.title, 'Notes')
  assert.equal(data.canvas.layers[0].props.surfaceOpacity, 14)
  assert.equal(data.canvas.layers[0].opacity, 100)
  assert.ok(!JSON.stringify(data).includes('private-note'))
  assert.equal(Object.hasOwn(data, 'widgetData'), false)
})

test('automatic order exports independently of saved layer geometry and defaults to Free Canvas for older themes', () => {
  const layers = insertPreset([], 'work')
  const [clock, search, todo] = layers
  layers[2] = { ...todo, rotation: 18, hidden: true }
  const legacy = readCanvas({ layers })
  assert.equal(legacy.widgetLayout, undefined)
  const order = [todo.id, 'deleted', search.id, todo.id]
  const auto = readCanvas({ layers, widgetLayout: { mode: 'auto', order } })
  assert.deepEqual(auto.layers, legacy.layers)
  assert.deepEqual(auto.widgetLayout, { mode: 'auto', order: [todo.id, search.id] })
  assert.deepEqual(orderedWidgets(auto).map(({ id }) => id), [todo.id, search.id, clock.id, ...layers.slice(3).map(({ id }) => id)])
  const free = readCanvas({ ...auto, widgetLayout: { ...auto.widgetLayout, mode: 'free' } })
  assert.deepEqual(free.layers, legacy.layers)
  assert.deepEqual(free.widgetLayout.order, auto.widgetLayout.order)
  assert.deepEqual(exportLayout({ themeId: 'forest-hour', canvas: auto }).canvas, auto)
})

test('analog face and markings normalize older designs and survive export', () => {
  const legacy = readWidget('analog', { seconds: false })
  assert.equal(legacy.face, 'ivory')
  assert.equal(legacy.markings, 'numbers')
  assert.equal(legacy.seconds, false)
  const layer = makeLayer('widget', 0, { kind: 'analog', config: { face: 'copper', markings: 'dots', seconds: false } })
  const exported = exportLayout({ themeId: 'forest-hour', canvas: { layers: [layer] } })
  assert.deepEqual(exported.canvas.layers[0].props.config, { title: '', face: 'copper', markings: 'dots', seconds: false })
  assert.deepEqual(readWidget('analog', { face: 'unknown', markings: '__proto__' }), readWidget('analog'))
})
