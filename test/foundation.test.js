import assert from 'node:assert/strict'
import test from 'node:test'
import { readActiveTheme } from '../src/preferences.js'
import { defaultThemeId, filterThemes, galleryCategories, themes, themesById } from '../src/themeCatalog.js'
import { bundledById } from '../src/background.js'
import { canvasSize } from '../src/canvasModel.js'
import { defaultQuoteId, readThemeCanvas } from '../src/studioData.js'

test('presets default to a Daily quote in the lower right until a canvas is saved', () => {
  const canvas = readThemeCanvas(defaultThemeId)
  assert.equal(canvas.layers.length, 1)
  const [quote] = canvas.layers
  assert.equal(quote.id, defaultQuoteId)
  assert.equal(quote.props.kind, 'quote')
  assert.equal(quote.x + quote.width, canvasSize.width)
  assert.equal(quote.y + quote.height, canvasSize.height)
  assert.equal(readThemeCanvas(defaultThemeId, { layers: [] }).layers.length, 0)
  assert.equal(readThemeCanvas('theme:custom').layers.length, 0)
  const edited = { ...quote, x: 50, y: 40, hidden: true }
  assert.deepEqual(readThemeCanvas(defaultThemeId, { layers: [edited] }).layers, [edited])
})

test('gallery presets have bilingual names and wallpaper assets', () => {
  assert.equal(themes.length, 51)
  assert.equal(themesById.size, 88)
  assert.ok(themesById.has(defaultThemeId))
  assert.deepEqual(galleryCategories.map(([id]) => id), ['anime', 'conan', 'doraemon', 'landscape', 'nature', 'nostalgia', 'sky'])
  assert.ok(themes.every((theme) => bundledById.has(theme.wallpaper?.assetId)))
  for (const theme of themes) {
    assert.equal(theme.names.length, 2)
    assert.ok(theme.names.every(Boolean))
    assert.equal(theme.colors.length, 3)
    assert.ok(theme.colors.every((color) => /^#[0-9a-f]{6}$/.test(color)))
  }
})

test('filters combine favorites, category and localized search with or without accents', () => {
  const ids = (filters) => filterThemes(filters).map((theme) => theme.id)
  assert.deepEqual(ids({ query: '  đèn làng ', category: 'anime' }), ['lanterns-after-rain'])
  assert.deepEqual(ids({ query: 'midnight', category: 'sky' }), [])
  assert.deepEqual(ids({ favoritesOnly: true, favorites: new Set(['alpine-air']) }), ['alpine-air'])
  assert.deepEqual(ids({ favoritesOnly: true, favorites: new Set() }), [])
  assert.deepEqual(ids({ query: 'ngo lang', category: 'anime' }), ['village-after-rain'])
  const nature = ids({ category: 'nature' })
  assert.equal(nature.length, 30)
  assert.ok(nature.includes('forest-hour') && nature.includes('strata-shore'))
  assert.ok(!nature.includes('avenue-at-night') && !nature.includes('castle-at-blue-hour'))
  assert.deepEqual(ids({ query: 'bo da tang lop', category: 'nature' }), ['strata-shore'])
  assert.deepEqual(ids({ query: 'bo da tang lop', category: 'anime' }), ['strata-shore'])
  assert.deepEqual(ids({ category: 'sky', favoritesOnly: true, favorites: new Set(['ember-tide']) }), ['ember-tide'])
  assert.deepEqual(ids({ category: 'nostalgia' }), [
    'lanterns-after-rain', 'paper-in-late-light', 'village-after-rain', 'evening-ferry',
  ])
  for (const category of ['anime', 'landscape', 'nature']) {
    assert.deepEqual(ids({ query: 'ruong bac thang', category }), ['terraces-in-the-mist'])
  }
  assert.deepEqual(ids({ query: 'avenue under soft clouds', category: 'landscape' }), ['avenue-under-soft-clouds'])
  assert.deepEqual(ids({ query: 'avenue under soft clouds', category: 'nature' }), [])
  assert.deepEqual(ids({ query: 'paper in late light', category: 'landscape' }), [])
  assert.deepEqual(ids({ query: 'conan coastal', category: 'anime' }), ['conan-coastal-platform'])
  assert.deepEqual(ids({ query: 'conan', category: 'conan' }), [
    'conan-sunlit-kick', 'moonlit-rooftop-rendezvous', 'conan-night-chase', 'conan-coastal-platform',
  ])
  const doraemon = [
    'doraemon-town-and-hill', 'doraemon-paper-planes', 'doraemon-treetop-picnic',
    'doraemon-city-flight', 'doraemon-ocean-adventure',
  ]
  assert.deepEqual(ids({ category: 'doraemon' }), doraemon)
  assert.deepEqual(ids({ query: 'Doraemon', category: 'anime' }), doraemon)
  assert.deepEqual(ids({ query: 'tiec dua hau', category: 'doraemon' }), ['doraemon-treetop-picnic'])
  assert.deepEqual(ids({ query: 'tinh van tim', category: 'sky' }), ['violet-nebula'])
})

test('retired presets are absent from gallery search and favorites but remain valid for saved selections', () => {
  const retired = [...themesById.values()].filter((theme) => !themes.includes(theme))
  assert.equal(retired.length, 37)
  for (const theme of retired) {
    assert.ok(!filterThemes({ query: theme.names[0] }).includes(theme))
    assert.equal(readActiveTheme({ themeId: theme.id, version: 1 }).themeId, theme.id)
  }
  assert.deepEqual(filterThemes({ favoritesOnly: true, favorites: new Set(['midnight-orbit']) }), [])
  for (const id of ['blue-marble', 'martian-dunes', 'cosmic-cliffs']) {
    const preset = themesById.get(id)
    assert.ok(retired.includes(preset))
    assert.ok(bundledById.has(preset.wallpaper.assetId))
    assert.deepEqual(filterThemes({ favoritesOnly: true, favorites: new Set([id]) }), [])
  }
})

test('active preferences recover gracefully and normalize valid custom colors', () => {
  const fallback = { version: 1, themeId: defaultThemeId, overrides: null }
  assert.deepEqual(readActiveTheme(null), fallback)
  assert.deepEqual(readActiveTheme({ version: 1, themeId: 'missing' }), fallback)
  assert.deepEqual(readActiveTheme({ version: 2, themeId: 'alpine-air' }), fallback)
  const selection = { version: 1, themeId: 'alpine-air', overrides: { base: '#AB12CD', accent: '#010203' } }
  assert.deepEqual(readActiveTheme(selection), { ...selection, overrides: { base: '#ab12cd', accent: '#010203' } })
  assert.deepEqual(readActiveTheme({ ...selection, overrides: { base: 'red', accent: '#010203' } }),
    { ...selection, overrides: null })
})
