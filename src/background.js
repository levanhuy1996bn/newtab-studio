import { animeWallpapers } from './animeWallpapers.js'

export const imageTypes = ['image/jpeg', 'image/png', 'image/webp']
export const maxImageBytes = 15 * 1024 * 1024
export const maxImagePixels = 32_000_000
export const maxSlides = 12

export const pictureControls = {
  positionX: { min: 0, max: 100, value: 50, unit: '%' },
  positionY: { min: 0, max: 100, value: 50, unit: '%' },
  zoom: { min: 100, max: 300, value: 100, unit: '%' },
  blur: { min: 0, max: 24, value: 0, unit: 'px' },
  brightness: { min: 30, max: 170, value: 100, unit: '%' },
  contrast: { min: 50, max: 180, value: 100, unit: '%' },
  saturation: { min: 0, max: 200, value: 100, unit: '%' },
  opacity: { min: 0, max: 100, value: 100, unit: '%' },
  overlayOpacity: { min: 0, max: 100, value: 0, unit: '%' },
}

export const bundledPictures = [
  { id: 'bundled:blue-marble', names: ['Blue Marble', 'Trái Đất xanh'], file: 'blue-marble.jpg', credit: 'NASA Earth Observatory' },
  { id: 'bundled:mars-dunes', names: ['Martian Dunes', 'Cồn cát sao Hỏa'], file: 'mars-dunes.jpg', credit: 'NASA/JPL-Caltech/University of Arizona' },
  { id: 'bundled:cosmic-cliffs', names: ['Cosmic Cliffs', 'Vách đá vũ trụ'], file: 'cosmic-cliffs.jpg', credit: 'NASA, ESA, CSA, STScI' },
  { id: 'bundled:forest-road', names: ['Forest Road', 'Đường xuyên rừng'], file: 'forest-road.webp', credit: 'NewTab Studio · ImageGen' },
  { id: 'bundled:summit-view', names: ['Summit View', 'Nhìn từ đỉnh núi'], file: 'summit-view.webp', credit: 'NewTab Studio · ImageGen' },
  { id: 'bundled:cedar-path', names: ['Cedar Path', 'Lối mòn rừng tuyết tùng'], file: 'cedar-path.webp', credit: 'NewTab Studio · ImageGen' },
  { id: 'bundled:summit-of-clouds', names: ['Summit of Clouds', 'Đỉnh núi trên biển mây'], file: 'summit-of-clouds.webp', credit: 'NewTab Studio · ImageGen' },
  { id: 'bundled:coastal-train', names: ['Coastal Train', 'Chuyến tàu ven biển'], file: 'coastal-train.webp', credit: 'NewTab Studio · ImageGen' },
  { id: 'bundled:village-after-rain', names: ['Village After Rain', 'Ngõ làng sau mưa'], file: 'village-after-rain.webp', credit: 'NewTab Studio · ImageGen' },
  { id: 'bundled:evening-ferry', names: ['Evening Ferry', 'Bến đò chiều muộn'], file: 'evening-ferry.webp', credit: 'NewTab Studio · ImageGen' },
  { id: 'bundled:lanterns-after-rain', names: ['Lanterns After Rain', 'Đèn làng sau mưa'], file: 'lanterns-after-rain.webp', credit: 'NewTab Studio · ImageGen' },
  ...animeWallpapers.map(([id, en, vi]) => ({
    id: 'bundled:' + id, names: [en, vi], file: id + '.webp', credit: 'NewTab Studio · ImageGen',
  })),
]
export const bundledById = new Map(bundledPictures.map((picture) => [picture.id, picture]))
export const bundledUrl = (picture, thumbnail = false) =>
  thumbnail ? './backgrounds/thumbs/' + picture.file.replace(/\.[^.]+$/, '.webp') : './backgrounds/' + picture.file

const assetIdPattern = /^asset:[0-9a-f-]{36}$/
const hex = /^#[0-9a-f]{6}$/i

function bounded(value, min, max, fallback) {
  return Number.isFinite(value) ? Math.max(min, Math.min(max, Math.round(value))) : fallback
}

function color(value, fallback) {
  return typeof value === 'string' && hex.test(value) ? value.toLowerCase() : fallback
}

function validId(id) {
  return typeof id === 'string' && (bundledById.has(id) || assetIdPattern.test(id))
}

export function readBackground(value, palette = ['#112f2d', '#52786c', '#eed2a0']) {
  switch (value?.type) {
    case 'solid':
      return { type: 'solid', color: color(value.color, palette[0]) }
    case 'gradient':
      return {
        type: 'gradient',
        start: color(value.start, palette[0]),
        end: color(value.end, palette[2]),
        angle: bounded(value.angle, 0, 360, 140),
      }
    case 'image':
    case 'slideshow': {
      const settings = Object.fromEntries(Object.entries(pictureControls).map(([key, limit]) =>
        [key, bounded(value[key], limit.min, limit.max, limit.value)],
      ))
      const shared = { ...settings, fit: value.fit === 'contain' ? 'contain' : 'cover', overlayColor: color(value.overlayColor, '#10211b') }
      return value.type === 'image'
        ? { type: 'image', assetId: validId(value.assetId) ? value.assetId : null, ...shared }
        : {
          type: 'slideshow',
          assetIds: Array.isArray(value.assetIds) ? [...new Set(value.assetIds.filter(validId))].slice(0, maxSlides) : [],
          seconds: bounded(value.seconds, 2, 120, 10),
          ...shared,
        }
    }
    default:
      return { type: 'preset' }
  }
}

export function pictureIds(background) {
  if (background?.type === 'image' && background.assetId) return [background.assetId]
  if (background?.type === 'slideshow') return background.assetIds
  return []
}

export function localPictureIds(background) {
  return pictureIds(background).filter((id) => !bundledById.has(id))
}

export function needsImage(background) {
  return (background.type === 'image' || background.type === 'slideshow') && pictureIds(background).length === 0
}

export function imageStyle(background) {
  const { positionX, positionY, zoom, blur, brightness, contrast, saturation, opacity } = background
  const fit = background.fit === 'contain'
  const position = fit ? '50% 50%' : positionX + '% ' + positionY + '%'
  // Overscan keeps the blurred edge outside the frame as the focal point moves.
  const overscan = fit ? 0 : blur * 2
  return {
    objectFit: fit ? 'scale-down' : 'cover',
    objectPosition: position,
    transformOrigin: position,
    transform: fit ? 'none' : 'scale(' + zoom / 100 + ')',
    inset: overscan ? -overscan : 0,
    width: 'calc(100% + ' + overscan * 2 + 'px)',
    height: 'calc(100% + ' + overscan * 2 + 'px)',
    filter: `blur(${blur}px) brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
    opacity: opacity / 100,
  }
}
