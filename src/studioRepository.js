import { localPictureIds, needsImage, readBackground } from './background.js'
import { readTextLayers } from './typography.js'
import { localCanvasPictures, readCanvas } from './canvasModel.js'
import { personalTypes, readWidgetData } from './widgetModel.js'
import { hasEffects, readEffects } from './effects.js'
import { assetReferences, catalogTheme, cleanName, defaultWorkspace, defaultWorkspaceId, designParts,
  isCustomThemeId, isThemeId, readDesign, readDesignPart, remapDesign, themeRecord } from './studioData.js'

const databaseName = 'newtab-studio'
const activeId = 'activeTheme'
const pendingPreferencesId = 'restoredPreferences'
const backupTables = ['themes', 'assets', 'assetPreviews', 'studioSettings', 'widgetData', 'drafts', 'workspaces']
let databasePromise
let channel
const listeners = new Set()

export class StudioError extends Error {
  constructor(code) {
    super(code)
    this.code = code
  }
}

function openDatabase() {
  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(databaseName, 3)
      request.onupgradeneeded = ({ oldVersion }) => {
        const database = request.result
        if (oldVersion === 0) {
          for (const table of ['themes', 'assets', 'assetPreviews', 'studioSettings']) {
            database.createObjectStore(table, { keyPath: 'id' })
          }
        }
        if (oldVersion < 2) database.createObjectStore('widgetData', { keyPath: 'id' })
        if (oldVersion < 3) {
          database.createObjectStore('drafts', { keyPath: 'id' })
          database.createObjectStore('workspaces', { keyPath: 'id' })
        }
      }
      request.onerror = () => reject(request.error)
      let blocked = false
      request.onblocked = () => {
        blocked = true
        reject(new StudioError('libraryError'))
      }
      request.onsuccess = () => {
        const database = request.result
        if (blocked) {
          database.close()
          return
        }
        database.onversionchange = () => {
          database.close()
          databasePromise = undefined
        }
        database.onclose = () => { databasePromise = undefined }
        resolve(database)
      }
    }).catch((error) => {
      databasePromise = undefined
      throw error
    })
  }
  return databasePromise
}

function result(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function transaction(tables, mode, work) {
  const database = await openDatabase()
  const tx = database.transaction(tables, mode)
  const committed = new Promise((resolve, reject) => {
    tx.oncomplete = resolve
    tx.onabort = () => reject(tx.error ?? new StudioError('studioSaveError'))
  })
  try {
    const [value] = await Promise.all([work((name) => tx.objectStore(name)), committed])
    return value
  } catch (error) {
    try {
      tx.abort()
    } catch {
      // The failed request may have already aborted the transaction.
    }
    throw error
  }
}

function notify(kind) {
  for (const callback of listeners) callback(kind)
}

function publish(kind) {
  notify(kind)
  channel?.postMessage(kind)
}

export function watchStudio(callback) {
  if (!channel) {
    channel = new BroadcastChannel('newtab-studio-db')
    channel.onmessage = (event) => notify(event.data)
  }
  listeners.add(callback)
  return () => {
    listeners.delete(callback)
    if (listeners.size === 0) {
      channel.close()
      channel = undefined
    }
  }
}

export function readActiveSelection(requestedSelection) {
  return transaction(['studioSettings', 'themes'], 'readonly', async (store) => {
    const selection = requestedSelection ?? await result(store('studioSettings').get(activeId))
    if (!selection) return null
    const document = await result(store('themes').get(selection.themeId))
    if (isCustomThemeId(selection.themeId) && !document) return null
    return {
      ...selection,
      overrides: selection.overrides === undefined ? document?.overrides ?? null : selection.overrides,
      background: selection.useBackground && document?.background ? readBackground(document.background) : null,
      textLayers: readTextLayers(document?.textLayers),
      canvas: readCanvas(document?.canvas),
      effects: readEffects(document?.effects),
    }
  })
}

export function readThemeDesign(themeId, part) {
  return transaction(part ? ['themes', 'drafts'] : ['themes'], 'readonly', async (store) => {
    const theme = await result(store('themes').get(themeId))
    const design = readDesign(theme)
    const draft = part && await result(store('drafts').get(draftId(themeId, part)))
    return draft ? { ...design, [part]: draft.value } : design
  })
}

export async function saveActiveSelection(selection, {
  background, textLayers, canvas, effects, draftPart, keepBackground = false, sessionOnly = false, previousSelection,
} = {}) {
  const editingBackground = background !== undefined
  const editingText = textLayers !== undefined
  const editingCanvas = canvas !== undefined
  const editingEffects = effects !== undefined
  const editingDesign = editingText || editingCanvas || editingEffects
  const editedBackground = editingBackground ? readBackground(background) : null
  if (editedBackground && needsImage(editedBackground)) throw new StudioError('selectImage')

  const applied = await transaction(['studioSettings', 'themes', 'assets', 'drafts'], 'readwrite', async (store) => {
    const settings = store('studioSettings')
    const themes = store('themes')
    const current = sessionOnly ? previousSelection : await result(settings.get(activeId))
    const saved = await result(themes.get(selection.themeId))
    const custom = isCustomThemeId(selection.themeId)
    if (custom && !saved) throw new StudioError('readError')
    const sameTheme = current?.themeId === selection.themeId
    const nextBackground = editingBackground
      ? editedBackground.type === 'preset' ? null : editedBackground
      : saved?.background ?? null

    const canvasInput = typeof canvas === 'function' ? canvas(readCanvas(saved?.canvas)) : canvas
    const nextCanvas = readCanvas(editingCanvas ? canvasInput : saved?.canvas)
    const referenced = new Set([
      ...localPictureIds(editedBackground),
      ...(editingCanvas ? localCanvasPictures(nextCanvas) : []),
    ])
    for (const id of referenced) {
      if (!await result(store('assets').getKey(id))) throw new StudioError('missingImage')
    }
    if (editingBackground || editingDesign) {
      const nextText = readTextLayers(editingText ? textLayers : saved?.textLayers)
      const nextEffects = readEffects(editingEffects ? effects : saved?.effects)
      const withEffects = hasEffects(nextEffects)
      if (custom || nextBackground || nextText.length > 0 || nextCanvas.layers.length > 0 || nextCanvas.widgetLayout || withEffects) {
        const phase4 = editingCanvas || saved?.schemaVersion >= 3
        const phase5 = saved?.schemaVersion >= 4 || Boolean(nextCanvas.widgetLayout) || nextCanvas.layers.some((layer) => layer.type === 'widget')
        const phase6 = saved?.schemaVersion >= 5 || withEffects
        await result(themes.put({
          ...saved, ...(phase4 ? { canvas: nextCanvas } : {}),
          ...(phase6 ? { effects: withEffects ? nextEffects : null } : {}),
          id: selection.themeId, schemaVersion: custom ? 6 : phase6 ? 5 : phase5 ? 4 : phase4 ? 3 : 2, background: nextBackground,
          textLayers: nextText, updatedAt: Date.now(),
        }))
      } else {
        await result(themes.delete(selection.themeId))
      }
    }
    const useBackground = Boolean(nextBackground && (editingBackground
      || (sameTheme ? current.useBackground && (keepBackground || editingDesign) : keepBackground || editingDesign)))
    const overrides = sameTheme && (editingBackground || editingDesign) ? current.overrides : selection.overrides
    if (custom && !editingBackground && !editingDesign) await result(themes.put({ ...saved, overrides }))
    const applied = { ...selection, id: activeId, overrides, useBackground }
    if (designParts.includes(draftPart)) await result(store('drafts').delete(draftId(selection.themeId, draftPart)))
    if (!sessionOnly) await result(settings.put(applied))
    return applied
  })
  publish('selection')
  return applied
}

export function listPictures() {
  return transaction(['assetPreviews'], 'readonly', async (store) => {
    const records = await result(store('assetPreviews').getAll())
    return records.sort((a, b) => b.createdAt - a.createdAt)
  })
}

export function loadWidgetData(id, kind) {
  return transaction(['widgetData'], 'readonly', async (store) => {
    const record = await result(store('widgetData').get(id))
    return readWidgetData(kind, record?.kind === kind ? record.value : undefined)
  })
}

export async function saveWidgetData(id, kind, mutate) {
  if (!personalTypes.has(kind)) throw new StudioError('widgetSaveError')
  await transaction(['widgetData'], 'readwrite', async (store) => {
    const data = store('widgetData')
    const current = await result(data.get(id))
    const previous = readWidgetData(kind, current?.kind === kind ? current.value : undefined)
    await result(data.put({ id, kind, value: readWidgetData(kind, mutate(previous)) }))
  })
  publish('widget:' + id)
}

export function readPicture(id) {
  return transaction(['assets'], 'readonly', async (store) => {
    const asset = await result(store('assets').get(id))
    return asset?.blob ?? null
  })
}

export async function savePicture(metadata, blob, thumbnail) {
  await transaction(['assets', 'assetPreviews'], 'readwrite', async (store) => {
    await result(store('assets').add({ ...metadata, blob }))
    await result(store('assetPreviews').add({ ...metadata, thumbnail }))
  })
  publish('assets')
}

export async function deletePicture(id) {
  await transaction(['themes', 'assets', 'assetPreviews', 'drafts'], 'readwrite', async (store) => {
    const documents = await result(store('themes').getAll())
    if (documents.some((document) => localPictureIds(readBackground(document.background)).includes(id))) {
      throw new StudioError('assetInUse')
    }
    if (documents.some((document) => localCanvasPictures(document.canvas).includes(id))) {
      throw new StudioError('assetInCanvas')
    }
    const drafts = await result(store('drafts').getAll())
    if (drafts.some(({ part, value }) => assetReferences({ [part]: value }).includes(id))) throw new StudioError('assetInUse')
    await result(store('assets').delete(id))
    await result(store('assetPreviews').delete(id))
  })
  publish('assets')
}

const draftId = (themeId, part) => themeId + '|' + part
const newThemeId = () => 'theme:' + crypto.randomUUID()
const newWorkspaceId = () => 'workspace:' + crypto.randomUUID()

export async function saveThemeDraft(themeId, part, value) {
  if (!isThemeId(themeId) || !designParts.includes(part)) throw new StudioError('saveError')
  const created = await transaction(['drafts', 'themes', 'assets'], 'readwrite', async (store) => {
    if (isCustomThemeId(themeId) && !await result(store('themes').getKey(themeId))) return
    const normalized = readDesignPart(part, value)
    for (const id of assetReferences({ [part]: normalized })) {
      if (!await result(store('assets').getKey(id))) throw new StudioError('missingImage')
    }
    const id = draftId(themeId, part)
    const exists = await result(store('drafts').getKey(id))
    await result(store('drafts').put({ id, themeId, part, value: normalized }))
    return !exists
  })
  if (created) publish('draft')
}

export async function discardThemeDrafts(themeId) {
  await transaction(['drafts'], 'readwrite', (store) => Promise.all(designParts.map((part) =>
    result(store('drafts').delete(draftId(themeId, part))))))
  publish('draft')
}

export function readThemeLibrary() {
  return transaction(['themes', 'workspaces', 'drafts'], 'readonly', async (store) => {
    const [themes, workspaces, drafts] = await Promise.all(['themes', 'workspaces', 'drafts'].map((name) => result(store(name).getAll())))
    return {
      custom: themes.filter(({ id }) => isCustomThemeId(id)).map(catalogTheme),
      saved: themes.filter(({ id }) => !isCustomThemeId(id)),
      workspaces: [defaultWorkspace, ...workspaces],
      drafts: new Set(drafts.map(({ themeId }) => themeId)),
    }
  })
}

export async function saveWorkspace(name, id = newWorkspaceId()) {
  const workspace = { id, name: cleanName(name) }
  if (!workspace.name || id === defaultWorkspaceId) throw new StudioError('phaseNameRequired')
  await transaction(['workspaces'], 'readwrite', (store) => result(store('workspaces').put(workspace)))
  publish('library')
  return id
}

export async function removeWorkspace(id) {
  if (id === defaultWorkspaceId) return
  await transaction(['workspaces', 'themes'], 'readwrite', async (store) => {
    const themes = store('themes')
    const records = await result(themes.getAll())
    await Promise.all(records.filter((theme) => theme.workspaceId === id)
      .map((theme) => result(themes.put({ ...theme, workspaceId: defaultWorkspaceId }))))
    await result(store('workspaces').delete(id))
  })
  publish('library')
}

export async function saveCustomTheme({ id, sourceId, workspaceId, name, overrides }) {
  const record = await transaction(['themes', 'studioSettings', 'workspaces'], 'readwrite', async (store) => {
    const themes = store('themes')
    const input = id ?? sourceId
    if (!isThemeId(input) || (id && !isCustomThemeId(id))) throw new StudioError('readError')
    if (workspaceId !== defaultWorkspaceId && !await result(store('workspaces').getKey(workspaceId))) {
      throw new StudioError('readError')
    }
    const saved = await result(themes.get(input))
    if (isCustomThemeId(input) && !saved) throw new StudioError('readError')
    const active = !id && await result(store('studioSettings').get(activeId))
    const colors = id ? saved.overrides : overrides ?? (active?.themeId === input ? active.overrides : saved?.overrides)
    const design = readDesign(saved)
    const layers = id ? new Map() : new Map(design.canvas.layers.map((layer) => [layer.id, crypto.randomUUID()]))
    const theme = themeRecord({
      ...remapDesign(design, new Map(), layers), presetId: saved?.presetId ?? input, workspaceId,
      name, overrides: colors,
    }, id ?? newThemeId())
    if (!theme?.name) throw new StudioError('phaseNameRequired')
    await result(themes.put(theme))
    return catalogTheme(theme)
  })
  publish('library')
  return record
}

export async function removeCustomTheme(id) {
  if (!isCustomThemeId(id)) return
  await transaction(['themes', 'drafts', 'studioSettings', 'widgetData'], 'readwrite', async (store) => {
    const saved = await result(store('themes').get(id))
    const active = await result(store('studioSettings').get(activeId))
    if (active?.themeId === id) await result(store('studioSettings').delete(activeId))
    for (const part of designParts) await result(store('drafts').delete(draftId(id, part)))
    for (const layer of readCanvas(saved?.canvas).layers) {
      if (layer.type === 'widget') await result(store('widgetData').delete(layer.id))
    }
    await result(store('themes').delete(id))
  })
  publish('library')
  publish('selection')
}

export function backupSnapshot() {
  return transaction(backupTables, 'readonly', async (store) => {
    const sets = await Promise.all(backupTables.map((table) => result(store(table).getAll())))
    return Object.fromEntries(backupTables.map((table, index) => [table, sets[index]]))
  })
}

export function readPendingPreferences() {
  return transaction(['studioSettings'], 'readonly', (store) =>
    result(store('studioSettings').get(pendingPreferencesId)))
}

export function clearPendingPreferences() {
  return transaction(['studioSettings'], 'readwrite', (store) =>
    result(store('studioSettings').delete(pendingPreferencesId)))
}

export async function installStudioData(data, mode, copyName) {
  await transaction(backupTables, 'readwrite', async (store) => {
    const replace = mode === 'replace'
    if (replace) await Promise.all(backupTables.map((table) => result(store(table).clear())))
    const assets = new Map(data.assets.map(({ id }) => [id, replace ? id : 'asset:' + crypto.randomUUID()]))
    const workspaces = new Map(data.workspaces.map(({ id }) => [id, replace ? id : newWorkspaceId()]))
    const themes = new Map(data.themes.map(({ id }) => [id, replace ? id : newThemeId()]))
    const layers = new Map()
    if (!replace) {
      for (const layer of [
        ...data.themes.flatMap((theme) => theme.canvas.layers),
        ...data.drafts.filter((draft) => draft.part === 'canvas').flatMap((draft) => draft.value.layers),
      ]) {
        if (!layers.has(layer.id)) layers.set(layer.id, crypto.randomUUID())
      }
    }
    const jobs = data.assets.flatMap(({ thumbnail, blob, ...asset }) => {
      const metadata = { ...asset, id: assets.get(asset.id) }
      return [
        ['assets', { ...metadata, blob }],
        ['assetPreviews', { ...metadata, thumbnail }],
      ]
    })
    for (const workspace of data.workspaces) {
      jobs.push(['workspaces', { ...workspace, id: workspaces.get(workspace.id) }])
    }
    const draftThemes = new Set(data.drafts.map(({ themeId }) => themeId))
    if (!replace) {
      for (const id of draftThemes) {
        if (themes.has(id)) continue
        const customId = newThemeId()
        themes.set(id, customId)
        jobs.push(['themes', themeRecord({ presetId: id, name: copyName(id) }, customId)])
      }
    }
    for (const theme of data.themes) {
      const id = themes.get(theme.id)
      const normalized = themeRecord({
        ...theme, ...remapDesign(theme, assets, layers),
        name: theme.name || copyName(theme.id), presetId: theme.presetId ?? theme.id,
        workspaceId: workspaces.get(theme.workspaceId) ?? defaultWorkspaceId,
      }, id)
      jobs.push(['themes', normalized])
    }
    for (const draft of data.drafts) {
      const themeId = themes.get(draft.themeId) ?? draft.themeId
      const { part, value } = draft
      const remapped = ['canvas', 'background'].includes(part) ? remapDesign({ [part]: value }, assets, layers)[part] : value
      jobs.push(['drafts', { id: draftId(themeId, part), themeId, part, value: remapped }])
    }
    for (const widget of data.widgets) {
      if (replace || layers.has(widget.id)) {
        jobs.push(['widgetData', { ...widget, id: layers.get(widget.id) ?? widget.id }])
      }
    }
    if (replace) {
      if (data.active) jobs.push(['studioSettings', { ...data.active, id: activeId }])
      jobs.push(['studioSettings', { id: pendingPreferencesId, values: data.preferences }])
    }
    await Promise.all(jobs.map(async ([table, record]) => result(store(table).add(record))))
  })
  publish(mode === 'replace' ? 'restore' : 'library')
  if (mode !== 'replace' && data.assets.length) publish('assets')
}
