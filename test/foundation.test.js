import assert from 'node:assert/strict'
import test from 'node:test'
import { readActiveTheme } from '../src/preferences.js'
import { defaultThemeId, filterThemes, galleryCategories, themes, themesById } from '../src/themeCatalog.js'
import { bundledById } from '../src/background.js'

test('gallery has 33 bilingual presets with wallpaper assets', () => {
  assert.equal(themes.length, 33)
  assert.equal(themesById.size, 67)
  assert.ok(themesById.has(defaultThemeId))
  assert.deepEqual(galleryCategories.map(([id]) => id), ['nature', 'anime', 'nostalgia', 'sky'])
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
  assert.equal(nature.length, 21)
  assert.ok(nature.includes('forest-hour') && nature.includes('strata-shore'))
  assert.ok(!nature.includes('avenue-at-night') && !nature.includes('castle-at-blue-hour'))
  assert.deepEqual(ids({ query: 'bo da tang lop', category: 'nature' }), ['strata-shore'])
  assert.deepEqual(ids({ query: 'bo da tang lop', category: 'anime' }), ['strata-shore'])
  assert.deepEqual(ids({ category: 'sky', favoritesOnly: true, favorites: new Set(['ember-tide']) }), ['ember-tide'])
  assert.deepEqual(ids({ category: 'nostalgia' }), ['lanterns-after-rain', 'village-after-rain', 'evening-ferry'])
})

test('retired presets are absent from gallery search and favorites but remain valid for saved selections', () => {
  const retired = [...themesById.values()].filter((theme) => !themes.includes(theme))
  assert.equal(retired.length, 34)
  for (const theme of retired) {
    assert.ok(!filterThemes({ query: theme.names[0] }).includes(theme))
    assert.equal(readActiveTheme({ themeId: theme.id, version: 1 }).themeId, theme.id)
  }
  assert.deepEqual(filterThemes({ favoritesOnly: true, favorites: new Set(['midnight-orbit']) }), [])
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
