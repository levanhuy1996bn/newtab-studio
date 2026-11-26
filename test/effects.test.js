import assert from 'node:assert/strict'
import test from 'node:test'
import { hasEffects, readEffects, readSchedule, scheduledThemeId } from '../src/effects.js'
import { exportLayout } from '../src/layoutExport.js'
import { defaultThemeId } from '../src/themeCatalog.js'

const at = (hour, minute = 0) => new Date(2026, 10, 26, hour, minute)

test('legacy themes keep motion disabled and exports keep only supported motion settings', () => {
  assert.equal(hasEffects(readEffects()), false)
  assert.equal(Object.hasOwn(exportLayout({ themeId: defaultThemeId }), 'effects'), false)
  const effects = { backdrop: 'rain', widget: 'rise', text: 'invalid', speed: 'fast', finish: 'loop' }
  assert.deepEqual(exportLayout({ themeId: defaultThemeId, effects }).effects, {
    backdrop: 'rain', widget: 'rise', text: 'none', speed: 'fast', strength: 'normal', finish: 'loop',
  })
})

test('day and night and custom schedules resolve local boundaries, overlaps and gaps', () => {
  const dayNight = readSchedule({ mode: 'dayNight' })
  assert.equal(scheduledThemeId(dayNight, at(6, 59)), 'coastal-train')
  assert.equal(scheduledThemeId(dayNight, at(7)), defaultThemeId)
  assert.equal(scheduledThemeId(dayNight, at(19)), 'coastal-train')
  const custom = readSchedule({ mode: 'custom', rules: [
    { start: '22:00', end: '06:00', themeId: 'midnight-orbit' },
    { start: '01:00', end: '08:00', themeId: 'alpine-air' },
    { start: '12:00', end: '12:00', themeId: 'dune-walk' },
  ] })
  assert.equal(scheduledThemeId(custom, at(22)), 'midnight-orbit')
  assert.equal(scheduledThemeId(custom, at(1)), 'midnight-orbit')
  assert.equal(scheduledThemeId(custom, at(6)), 'alpine-air')
  assert.equal(scheduledThemeId(custom, at(8)), defaultThemeId)
  assert.equal(scheduledThemeId(custom, at(12)), defaultThemeId)
  assert.equal(scheduledThemeId(readSchedule(), at(22)), null)
})
