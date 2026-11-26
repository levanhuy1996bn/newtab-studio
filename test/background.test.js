import assert from 'node:assert/strict'
import test from 'node:test'
import { imageStyle, localPictureIds, maxSlides, needsImage, pictureIds, readBackground } from '../src/background.js'

const localId = 'asset:11111111-1111-4111-8111-111111111111'

test('normalizes photo controls and rejects unsupported background sources', () => {
  const photo = readBackground({
    type: 'image', assetId: 'https://example.test/photo.jpg', positionX: -20, positionY: 42.7,
    zoom: 999, brightness: Infinity, overlayColor: '#AABBCC', opacity: 70,
  })
  assert.ok(needsImage(photo))
  assert.equal(photo.positionX, 0)
  assert.equal(photo.positionY, 43)
  assert.equal(photo.zoom, 300)
  assert.equal(photo.brightness, 100)
  assert.equal(photo.overlayColor, '#aabbcc')
  assert.equal(imageStyle(photo).objectPosition, '0% 43%')
  assert.equal(imageStyle(photo).opacity, 0.7)
})

test('preserves slideshow order and limits selection to valid unique IDs', () => {
  const bundledId = 'bundled:cosmic-cliffs'
  const extra = Array.from({ length: maxSlides }, (_, index) =>
    'asset:22222222-2222-4222-8222-' + String(index).padStart(12, '0'))
  const background = readBackground({
    type: 'slideshow', assetIds: [localId, bundledId, localId, 'bundled:missing', ...extra], seconds: 0,
  })
  assert.deepEqual(pictureIds(background), [localId, bundledId, ...extra.slice(0, maxSlides - 2)])
  assert.deepEqual(localPictureIds(background), [localId, ...extra.slice(0, maxSlides - 2)])
  assert.equal(background.seconds, 2)
})

test('whole-image framing ignores crop offsets and never scales a small original up', () => {
  const photo = readBackground({ type: 'image', assetId: localId, fit: 'contain', zoom: 240, positionX: 8, blur: 9 })
  const style = imageStyle(photo)
  assert.equal(style.objectFit, 'scale-down')
  assert.equal(style.objectPosition, '50% 50%')
  assert.equal(style.transform, 'none')
  assert.equal(style.inset, 0)
  const legacyPhoto = readBackground({ ...photo, fit: undefined })
  assert.equal(legacyPhoto.fit, 'cover')
  assert.equal(imageStyle(legacyPhoto).objectPosition, '8% 50%')
  assert.equal(imageStyle(legacyPhoto).transform, 'scale(2.4)')
})

test('normalizes gradients and falls back to preset art when the type is unknown', () => {
  assert.deepEqual(readBackground({ type: 'gradient', start: '#FF0000', end: 'red', angle: 400 }),
    { type: 'gradient', start: '#ff0000', end: '#eed2a0', angle: 360 })
  assert.deepEqual(readBackground({ type: 'unknown' }), { type: 'preset' })
})
