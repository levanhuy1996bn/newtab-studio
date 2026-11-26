import { localPictureIds, needsImage, readBackground } from './background.js'
import { readTextLayers } from './typography.js'
import { localCanvasPictures, readCanvas } from './canvasModel.js'
import { personalTypes, readWidgetData } from './widgetModel.js'
import { hasEffects, readEffects } from './effects.js'

const databaseName = 'newtab-studio'
const activeId = 'activeTheme'
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
      const request = indexedDB.open(databaseName, 2)
      request.onupgradeneeded = ({ oldVersion }) => {
        const database = request.result
        if (oldVersion === 0) {
          for (const table of ['themes', 'assets', 'assetPreviews', 'studioSettings']) {
            database.createObjectStore(table, { keyPath: 'id' })
          }
        }
        if (oldVersion < 2) database.createObjectStore('widgetData', { keyPath: 'id' })
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
    return {
      ...selection,
      background: selection.useBackground && document?.background ? readBackground(document.background) : null,
      textLayers: readTextLayers(document?.textLayers),
      canvas: readCanvas(document?.canvas),
      effects: readEffects(document?.effects),
    }
  })
}

export function readThemeDesign(themeId) {
  return transaction(['themes'], 'readonly', async (store) => {
    const theme = await result(store('themes').get(themeId))
    return {
      background: theme?.background ? readBackground(theme.background) : null,
      textLayers: readTextLayers(theme?.textLayers),
      canvas: readCanvas(theme?.canvas),
      effects: readEffects(theme?.effects),
    }
  })
}

export async function saveActiveSelection(selection, {
  background, textLayers, canvas, effects, keepBackground = false, sessionOnly = false, previousSelection,
} = {}) {
  const editingBackground = background !== undefined
  const editingText = textLayers !== undefined
  const editingCanvas = canvas !== undefined
  const editingEffects = effects !== undefined
  const editingDesign = editingText || editingCanvas || editingEffects
  const editedBackground = editingBackground ? readBackground(background) : null
  if (editedBackground && needsImage(editedBackground)) throw new StudioError('selectImage')

  const applied = await transaction(['studioSettings', 'themes', 'assets'], 'readwrite', async (store) => {
    const settings = store('studioSettings')
    const themes = store('themes')
    const current = sessionOnly ? previousSelection : await result(settings.get(activeId))
    const saved = await result(themes.get(selection.themeId))
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
      if (nextBackground || nextText.length > 0 || nextCanvas.layers.length > 0 || nextCanvas.widgetLayout || withEffects) {
        const phase4 = editingCanvas || saved?.schemaVersion >= 3
        const phase5 = saved?.schemaVersion >= 4 || Boolean(nextCanvas.widgetLayout) || nextCanvas.layers.some((layer) => layer.type === 'widget')
        const phase6 = saved?.schemaVersion >= 5 || withEffects
        await result(themes.put({
          ...saved, ...(phase4 ? { canvas: nextCanvas } : {}),
          ...(phase6 ? { effects: withEffects ? nextEffects : null } : {}),
          id: selection.themeId, schemaVersion: phase6 ? 5 : phase5 ? 4 : phase4 ? 3 : 2, background: nextBackground,
          textLayers: nextText, updatedAt: Date.now(),
        }))
      } else {
        await result(themes.delete(selection.themeId))
      }
    }
    const useBackground = Boolean(nextBackground && (editingBackground
      || (sameTheme ? current.useBackground && (keepBackground || editingDesign) : keepBackground || editingDesign)))
    const overrides = sameTheme && (editingBackground || editingDesign) ? current.overrides : selection.overrides
    const applied = { ...selection, id: activeId, overrides, useBackground }
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
  await transaction(['themes', 'assets', 'assetPreviews'], 'readwrite', async (store) => {
    const documents = await result(store('themes').getAll())
    if (documents.some((document) => localPictureIds(readBackground(document.background)).includes(id))) {
      throw new StudioError('assetInUse')
    }
    if (documents.some((document) => localCanvasPictures(document.canvas).includes(id))) {
      throw new StudioError('assetInCanvas')
    }
    await result(store('assets').delete(id))
    await result(store('assetPreviews').delete(id))
  })
  publish('assets')
}
