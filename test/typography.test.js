import assert from 'node:assert/strict'
import test from 'node:test'
import {
  dailyQuote, layerText, localDay, maxTextLayers, maxTextLength, newTextLayer, randomQuote, readTextLayers, textEntries,
} from '../src/typography.js'

test('preserves multiline plain text, normalizes typography and rejects duplicate IDs', () => {
  const poem = 'Ánh nắng bên cửa\r\n<img src=x> & gió dịu'
  const corrupt = {
    id: 'poem', type: 'text', text: poem, font: 'url(https://example.test/font)', color: '#AABBCC',
    size: 999, weight: 505, spacing: -20, lineHeight: Infinity, rotation: -90, alignment: 'stretch',
  }
  const [clean, ...rest] = readTextLayers([null, corrupt, corrupt, { id: 'empty', type: 'text', text: '  ' }])
  assert.equal(clean.text, poem.replace('\r\n', '\n'))
  assert.equal(clean.font, 'serif')
  assert.equal(clean.color, '#aabbcc')
  assert.equal(clean.size, 84)
  assert.equal(clean.weight, 500)
  assert.equal(clean.spacing, -2)
  assert.equal(clean.lineHeight, 135)
  assert.equal(clean.rotation, -30)
  assert.equal(clean.alignment, 'center')
  assert.deepEqual(rest, [])
  assert.deepEqual(readTextLayers(undefined), [])
})

test('caps text length and layers while retaining insertion order', () => {
  const edited = Array.from({ length: maxTextLayers + 2 }, (_, index) => ({
    id: String(index), type: 'text', text: 'x'.repeat(maxTextLength + 10),
  }))
  const layers = readTextLayers(edited)
  assert.equal(layers.length, maxTextLayers)
  assert.equal(layers.at(-1).id, String(maxTextLayers - 1))
  assert.equal(layers[0].text.length, maxTextLength)
})

test('daily quote follows the local calendar and locale; inserted templates remain editable', () => {
  const morning = localDay(new Date(2026, 10, 26, 0, 5))
  const evening = localDay(new Date(2026, 10, 26, 23, 55))
  const tomorrow = localDay(new Date(2026, 10, 27, 0, 0))
  const [daily] = readTextLayers([newTextLayer({ daily: true })])
  assert.equal(dailyQuote(morning), dailyQuote(evening))
  assert.notEqual(dailyQuote(morning), dailyQuote(tomorrow))
  assert.equal(layerText(daily, 'vi', morning), dailyQuote(morning).texts[1])
  assert.equal(layerText(daily, 'en', morning), dailyQuote(morning).texts[0])
  const entry = textEntries.find(({ kind }) => kind === 'poem')
  const template = newTextLayer({ entry, language: 'vi' })
  assert.equal(layerText(template, 'en', tomorrow), entry.texts[1])
  assert.equal(template.lineHeight, 165)
})

test('random quote excludes the previous choice when possible', () => {
  const previous = randomQuote(null, () => 0)
  assert.equal(previous.kind, 'quote')
  assert.notEqual(randomQuote(previous.id, () => 0).id, previous.id)
})
