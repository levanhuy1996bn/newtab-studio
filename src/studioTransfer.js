import { preparePicture } from './assetUpload.js'
import { bundledById, imageTypes, maxImageBytes } from './background.js'
import { canvasLimit } from './canvasModel.js'
import { exportStudioSnapshot, portablePreferences, readActiveTheme } from './preferences.js'
import { StudioError } from './studioRepository.js'
import { assetReferences, cleanName, defaultWorkspaceId, designParts, isCustomThemeId, isThemeId, isWorkspaceId,
  readDesignPart, themeRecord } from './studioData.js'
import { themesById } from './themeCatalog.js'
import { personalTypes, readWidgetData } from './widgetModel.js'

const portableTheme = 'newtab-studio.theme'
const backupFormat = 'newtab-studio.backup'
const layoutFormat = 'newtab-studio.layout'
const maxTransferBytes = 160 * 1024 * 1024
const layerId = (id) => typeof id === 'string' && /^[\w-]{1,64}$/.test(id)
const assetId = (id) => typeof id === 'string' && /^asset:[\w-]{1,64}$/.test(id)
const fail = (code = 'phaseInvalidFile') => { throw new StudioError(code) }

async function digest(buffer) {
  const hash = await crypto.subtle.digest('SHA-256', buffer)
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function uniqueRecords(value, max, check) {
  if (!Array.isArray(value) || value.length > max) fail()
  const ids = new Set()
  for (const item of value) {
    if (!item || !check(item) || ids.has(item.id)) fail()
    ids.add(item.id)
  }
  return ids
}

function validateDesign(input, pictures) {
  const { background, canvas } = input
  if (background != null) {
    if (!['preset', 'solid', 'gradient', 'image', 'slideshow'].includes(background.type)) fail()
    if (background.type === 'image') checkPicture(background.assetId, pictures)
    if (background.type === 'slideshow') {
      if (!Array.isArray(background.assetIds) || background.assetIds.length > 12) fail()
      for (const id of background.assetIds) checkPicture(id, pictures)
    }
  }
  if (canvas != null) {
    uniqueRecords(canvas.layers, canvasLimit, ({ id }) => layerId(id))
    for (const layer of canvas.layers) {
      if (layer.type === 'image') checkPicture(layer.props?.assetId, pictures)
    }
  }
}

function checkPicture(id, pictures) {
  if (!bundledById.has(id) && !pictures.has(id)) fail('missingImage')
}

async function encodePicture(asset) {
  const buffer = await asset.blob.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  const blocks = []
  for (let i = 0; i < bytes.length; i += 24_576) {
    blocks.push(btoa(String.fromCharCode(...bytes.subarray(i, i + 24_576))))
  }
  return { id: asset.id, name: asset.name, mime: asset.mime, hash: await digest(buffer), data: blocks.join('') }
}

async function decodePicture(asset) {
  if (!imageTypes.includes(asset.mime) || typeof asset.data !== 'string'
    || asset.data.length > Math.ceil(maxImageBytes / 3) * 4 || typeof asset.hash !== 'string'
    || !/^[a-f\d]{64}$/.test(asset.hash)) fail()
  let bytes
  try {
    bytes = Uint8Array.from(atob(asset.data), (byte) => byte.charCodeAt(0))
  } catch {
    fail()
  }
  if (!bytes.length || await digest(bytes) !== asset.hash) fail()
  const decoded = await preparePicture(new File([bytes], cleanName(asset.name) || 'image', { type: asset.mime }))
  return { ...decoded, id: asset.id }
}

export async function createTransfer(themeId, name, overrides) {
  const snapshot = await exportStudioSnapshot()
  const active = snapshot.studioSettings.find(({ id }) => id === 'activeTheme')
  let records = snapshot.themes
  let pictures = snapshot.assets
  if (themeId) {
    const original = records.find(({ id }) => id === themeId)
    if (!original && !themesById.has(themeId)) fail('readError')
    const record = themeRecord({
      ...original, name, presetId: original?.presetId ?? themeId, workspaceId: defaultWorkspaceId,
      overrides: overrides ?? (active?.themeId === themeId ? active.overrides : original?.overrides),
    }, 'theme:portable')
    if (!record) fail()
    const refs = assetReferences(record)
    pictures = pictures.filter(({ id }) => refs.includes(id))
    if (refs.length !== pictures.length) fail('missingImage')
    records = [record]
  }
  if (pictures.reduce((bytes, asset) => bytes + Math.ceil(asset.blob.size / 3) * 4, 0) > maxTransferBytes) fail('phaseFileLarge')
  const assets = []
  for (const picture of pictures) assets.push(await encodePicture(picture))
  const backup = !themeId
  const document = {
    format: backup ? backupFormat : portableTheme, schemaVersion: 1, themes: records, assets,
    ...(backup && {
      active: active ?? null, preferences: snapshot.preferences,
      drafts: snapshot.drafts, workspaces: snapshot.workspaces, widgets: snapshot.widgetData,
    }),
  }
  const blob = new Blob([JSON.stringify(document)], { type: 'application/json' })
  if (blob.size > maxTransferBytes) fail('phaseFileLarge')
  return blob
}

export async function readTransfer(file, fallbackName) {
  if (file.size > maxTransferBytes) fail('phaseFileLarge')
  let input
  try {
    input = JSON.parse(await file.text())
  } catch {
    fail()
  }
  if (input?.schemaVersion !== 1) fail()
  const presetId = input.presetId ?? input.themeId
  if (input.format === layoutFormat && isThemeId(input.themeId) && themesById.has(presetId)) {
    input = {
      format: portableTheme, assets: [],
      themes: [{ ...input, id: 'theme:legacy', presetId, name: fallbackName, schemaVersion: 6 }],
    }
  }
  const full = input.format === backupFormat
  if (!full && input.format !== portableTheme) fail()
  const pictures = uniqueRecords(input.assets, 2048, ({ id }) => assetId(id))
  const themes = uniqueRecords(input.themes, 2048, ({ id, schemaVersion, presetId, name }) => isThemeId(id)
    && Number.isInteger(schemaVersion) && schemaVersion >= 1 && schemaVersion <= 6
    && (!isCustomThemeId(id) || (schemaVersion === 6 && themesById.has(presetId) && cleanName(name))))
  if (!full && (themes.size !== 1 || !isCustomThemeId(input.themes[0].id))) fail()
  const workspaces = full ? input.workspaces : []
  const workspaceIds = uniqueRecords(workspaces, 1024, ({ id, name }) =>
    id !== defaultWorkspaceId && isWorkspaceId(id) && Boolean(cleanName(name)))
  const documents = input.themes.map((entry) => {
    validateDesign(entry, pictures)
    if (entry.workspaceId && entry.workspaceId !== defaultWorkspaceId && !workspaceIds.has(entry.workspaceId)) fail()
    return themeRecord(entry) ?? fail()
  })
  const rawDrafts = full ? input.drafts : []
  uniqueRecords(rawDrafts, 8192, ({ id, themeId, part }) => (themes.has(themeId) || themesById.has(themeId))
    && designParts.includes(part) && id === themeId + '|' + part)
  const drafts = rawDrafts.map((entry) => {
    // A background draft may intentionally have no selected image yet.
    if (entry.part !== 'background' || entry.value?.assetId || entry.value?.assetIds?.length) {
      validateDesign({ [entry.part]: entry.value }, pictures)
    }
    return { id: entry.id, themeId: entry.themeId, part: entry.part, value: readDesignPart(entry.part, entry.value) }
  })
  const widgetsByTheme = new Map()
  for (const [id, canvas] of [
    ...documents.map((theme) => [theme.id, theme.canvas]),
    ...drafts.filter(({ part }) => part === 'canvas').map(({ themeId, value }) => [themeId, value]),
  ]) {
    for (const layer of canvas.layers) {
      if (layer.type !== 'widget') continue
      if (widgetsByTheme.has(layer.id) && widgetsByTheme.get(layer.id) !== id) fail()
      widgetsByTheme.set(layer.id, id)
    }
  }
  const widgets = full ? input.widgets : []
  uniqueRecords(widgets, 16384, ({ id, kind }) => layerId(id) && personalTypes.has(kind))
  const active = full && input.active
  if (active && (active.version !== 1 || (!themes.has(active.themeId) && !themesById.has(active.themeId)))) fail()
  const assets = []
  for (const picture of input.assets) assets.push(await decodePicture(picture))
  return {
    full, assets, themes: documents, drafts,
    widgets: widgets.map(({ id, kind, value }) => ({ id, kind, value: readWidgetData(kind, value) })),
    workspaces: workspaces.map(({ id, name }) => ({ id, name: cleanName(name) })),
    active: active ? { ...readActiveTheme(active), useBackground: active.useBackground === true } : null,
    preferences: full ? portablePreferences(input.preferences) : null,
  }
}
