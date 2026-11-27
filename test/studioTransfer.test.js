import assert from 'node:assert/strict'
import test from 'node:test'
import { readTransfer } from '../src/studioTransfer.js'
import { remapDesign, themeRecord } from '../src/studioData.js'

const theme = { id: 'theme:test', schemaVersion: 6, name: 'My theme', presetId: 'forest-hour', canvas: { layers: [] } }
const manifest = { format: 'newtab-studio.theme', schemaVersion: 1, themes: [theme], assets: [] }
const parse = (data) => readTransfer(new Blob([JSON.stringify(data)]), 'Imported')
const backup = { ...manifest, format: 'newtab-studio.backup', workspaces: [], drafts: [], widgets: [], preferences: {} }

test('portable themes validate versions, duplicate IDs and missing images', async () => {
  const data = await parse(manifest)
  assert.equal(data.themes[0].name, 'My theme')
  assert.equal(data.full, false)
  await assert.rejects(parse({ ...manifest, schemaVersion: 2 }), { code: 'phaseInvalidFile' })
  await assert.rejects(parse({ ...backup, themes: [theme, theme] }), { code: 'phaseInvalidFile' })
  await assert.rejects(parse({ ...manifest, themes: [{ ...theme, background: { type: 'image', assetId: 'asset:missing' } }] }),
    { code: 'missingImage' })
  await assert.rejects(parse({ ...backup, active: { version: 1, themeId: 'theme:missing' } }), { code: 'phaseInvalidFile' })
})

test('legacy layouts and preset records migrate with their design intact', async () => {
  const data = await parse({ format: 'newtab-studio.layout', schemaVersion: 1, themeId: 'forest-hour',
    background: { type: 'solid', color: '#ABCDEF' }, canvas: { layers: [] } })
  assert.equal(data.themes[0].presetId, 'forest-hour')
  assert.deepEqual(data.themes[0].background, { type: 'solid', color: '#abcdef' })
  assert.deepEqual(themeRecord({ id: 'forest-hour', schemaVersion: 1 }).canvas, { layers: [] })
  assert.equal(themeRecord({ id: 'forest-hour', schemaVersion: 1 }).background, null)
})

test('merge remaps canvas picture and widget order references', () => {
  const design = {
    background: { type: 'slideshow', assetIds: ['asset:a', 'bundled:forest-road'] },
    canvas: {
      layers: [{ id: 'image', type: 'image', props: { assetId: 'asset:a' } }, { id: 'notes', type: 'widget' }],
      widgetLayout: { mode: 'auto', order: ['notes'] },
    },
  }
  const merged = remapDesign(design, new Map([['asset:a', 'asset:b']]), new Map([['notes', 'new-notes']]))
  assert.deepEqual(merged.background.assetIds, ['asset:b', 'bundled:forest-road'])
  assert.equal(merged.canvas.layers[0].props.assetId, 'asset:b')
  assert.equal(merged.canvas.layers[1].id, 'new-notes')
  assert.deepEqual(merged.canvas.widgetLayout.order, ['new-notes'])
  assert.equal(design.canvas.layers[0].props.assetId, 'asset:a')
})
