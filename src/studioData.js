import { localPictureIds, needsImage, readBackground } from './background.js'
import { localCanvasPictures, readCanvas } from './canvasModel.js'
import { readEffects } from './effects.js'
import { defaultThemeId, isCustomThemeId, themesById } from './themeCatalog.js'
import { readTextLayers } from './typography.js'

export const defaultWorkspaceId = 'default'
export const defaultWorkspace = { id: defaultWorkspaceId, name: '' }
export const designParts = ['background', 'textLayers', 'canvas', 'effects']
export { isCustomThemeId, isThemeId } from './themeCatalog.js'
export const isWorkspaceId = (id) => id === defaultWorkspaceId || (typeof id === 'string' && /^workspace:[\w-]{1,64}$/.test(id))
export const cleanName = (value) => typeof value === 'string' ? value.trim().slice(0, 60) : ''

export function readPalette(value) {
  const { base, accent } = value ?? {}
  return [base, accent].every((color) => typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color))
    ? { base: base.toLowerCase(), accent: accent.toLowerCase() } : null
}

export function readDesignPart(key, value) {
  switch (key) {
    case 'background': return value ? readBackground(value) : null
    case 'textLayers': return readTextLayers(value)
    case 'canvas': return readCanvas(value)
    case 'effects': return readEffects(value)
    default: return undefined
  }
}

export function readDesign(value) {
  return Object.fromEntries(designParts.map((key) => [key, readDesignPart(key, value?.[key])]))
}

export function assetReferences({ background, canvas }) {
  return [...new Set([...localPictureIds(background), ...localCanvasPictures(canvas)])]
}

export function remapDesign(design, assets, layers = new Map()) {
  const { background, canvas } = design
  const asset = (id) => assets.get(id) ?? id
  const layerId = (id) => layers.get(id) ?? id
  return {
    ...design,
    background: background?.type === 'image' ? { ...background, assetId: asset(background.assetId) }
      : background?.type === 'slideshow' ? { ...background, assetIds: background.assetIds.map(asset) } : background,
    canvas: {
      layers: (canvas?.layers ?? []).map((layer) => ({
        ...layer, id: layerId(layer.id),
        props: layer.type === 'image' ? { ...layer.props, assetId: asset(layer.props.assetId) } : layer.props,
      })),
      ...(canvas?.widgetLayout && { widgetLayout: { ...canvas.widgetLayout, order: canvas.widgetLayout.order.map(layerId) } }),
    },
  }
}

export function catalogTheme(theme) {
  const preset = themesById.get(theme.presetId) ?? themesById.get(defaultThemeId)
  return { ...preset, ...theme, names: [theme.name, theme.name] }
}

// Old records stored only the parts present at the time. Their defaults are read on demand.
export function themeRecord(input, id = input.id) {
  const design = readDesign(input)
  const background = !design.background || design.background.type === 'preset' ? null : design.background
  if (background && needsImage(background)) return null
  return {
    ...design, background, id,
    schemaVersion: isCustomThemeId(id) ? 6 : 5,
    updatedAt: Number.isFinite(input.updatedAt) ? input.updatedAt : Date.now(),
    ...(isCustomThemeId(id) && {
      presetId: themesById.has(input.presetId) ? input.presetId : defaultThemeId,
      name: cleanName(input.name),
      workspaceId: isWorkspaceId(input.workspaceId) ? input.workspaceId : defaultWorkspaceId,
      overrides: readPalette(input.overrides),
    }),
  }
}
