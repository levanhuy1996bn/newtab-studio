import { create } from 'zustand'
import { defaultThemeId, themesById } from './themeCatalog.js'
import { backupSnapshot, clearPendingPreferences, installStudioData, readActiveSelection, readPendingPreferences,
  saveActiveSelection, StudioError, watchStudio } from './studioRepository.js'
import { readSchedule, scheduledThemeId } from './effects.js'
import { isThemeId, readPalette } from './studioData.js'

const languageKey = 'nts.language'
const activeKey = 'nts.activeTheme'
const scheduleKey = 'nts.schedule'
const focusKey = 'nts.focusMode'
const performanceKey = 'nts.performanceMode'
const tabSelectionKey = 'nts.tabSelection'
const favoritePrefix = 'nts.favorite.'
const introKey = 'nts.introSeen'

export function readActiveTheme(value) {
  if (value?.version !== 1 || !isThemeId(value.themeId)) {
    return { version: 1, themeId: defaultThemeId, overrides: null }
  }
  return {
    version: 1,
    themeId: value.themeId,
    overrides: readPalette(value.overrides),
  }
}

function parseLocal(value) {
  try {
    return JSON.parse(value)
  } catch {
    return undefined
  }
}

function readTabSelection() {
  try {
    const saved = parseLocal(globalThis.sessionStorage?.getItem(tabSelectionKey))
    if (isThemeId(saved?.themeId)) return { ...readActiveTheme(saved), useBackground: saved.useBackground === true }
  } catch {
    // The in-memory choice still works when session storage is unavailable.
  }
  return null
}

function rememberTabSelection(selection) {
  try {
    if (selection) globalThis.sessionStorage?.setItem(tabSelectionKey, JSON.stringify(selection))
    else globalThis.sessionStorage?.removeItem(tabSelectionKey)
  } catch {
    // Keep the session available through the store.
  }
}

function createStorage() {
  const extension = globalThis.chrome?.storage
  if (extension?.local) {
    return {
      read: () => extension.local.get(null),
      write: (key, value) => extension.local.set({ [key]: value }),
      writeMany: (values) => extension.local.set(values),
      watch(callback) {
        const listener = (changes, area) => {
          if (area === 'local') {
            callback(Object.fromEntries(Object.entries(changes).map(([key, change]) => [key, change.newValue])))
          }
        }
        extension.onChanged.addListener(listener)
        return () => extension.onChanged.removeListener(listener)
      },
    }
  }

  let notify
  return {
    async read() {
      const storage = globalThis.localStorage
      return Object.fromEntries(Object.keys(storage).map((key) => [key, parseLocal(storage.getItem(key))]))
    },
    async write(key, value) {
      globalThis.localStorage.setItem(key, JSON.stringify(value))
      notify?.({ [key]: value })
    },
    async writeMany(values) {
      for (const [key, value] of Object.entries(values)) globalThis.localStorage.setItem(key, JSON.stringify(value))
      notify?.(values)
    },
    watch(callback) {
      notify = callback
      const listener = ({ key, newValue, storageArea }) => {
        if (storageArea === globalThis.localStorage) {
          callback(key === null
            ? Object.fromEntries([languageKey, activeKey, scheduleKey, focusKey, performanceKey, introKey,
              ...Array.from(themesById.keys(), (id) => favoritePrefix + id)]
              .map((name) => [name, undefined]))
            : { [key]: parseLocal(newValue) })
        }
      }
      globalThis.addEventListener('storage', listener)
      return () => {
        notify = undefined
        globalThis.removeEventListener('storage', listener)
      }
    },
  }
}

const browserLanguage = globalThis.navigator?.language?.split('-')[0] === 'vi' ? 'vi' : 'en'
const storage = createStorage()
const preferenceLock = (operation) => globalThis.navigator?.locks
  ? navigator.locks.request('newtab-studio-preferences', operation) : operation()

export function portablePreferences(values) {
  return {
    [languageKey]: values?.[languageKey] === 'vi' || values?.[languageKey] === 'en' ? values[languageKey] : null,
    [activeKey]: values?.[activeKey] ? readActiveTheme(values[activeKey]) : null,
    [scheduleKey]: readSchedule(values?.[scheduleKey]),
    [focusKey]: values?.[focusKey] === true,
    [performanceKey]: values?.[performanceKey] === true,
    [introKey]: values?.[introKey] === true,
    ...Object.fromEntries([...themesById.keys()].map((id) => [favoritePrefix + id, values?.[favoritePrefix + id] === true])),
  }
}

async function restoredPreferences() {
  const pending = await readPendingPreferences()
  if (!pending) return null
  try {
    await storage.writeMany(pending.values)
    await clearPendingPreferences()
  } catch {
    return pending
  }
  return { ...pending, persisted: true }
}

export function exportStudioSnapshot() {
  return preferenceLock(async () => {
    const pending = await restoredPreferences()
    return { ...await backupSnapshot(), preferences: portablePreferences(pending?.values ?? await storage.read()) }
  })
}

export function restoreStudioData(data, mode, copyName) {
  return preferenceLock(async () => {
    await installStudioData(data, mode, copyName)
    if (mode !== 'replace') return null
    return restoredPreferences()
  })
}

function writePreference(key, value) {
  return preferenceLock(async () => {
    const pending = await restoredPreferences()
    if (pending && !pending.persisted) throw new StudioError('saveError')
    await storage.write(key, value)
  })
}

function mergePreferences(values, state) {
  const updates = {}
  if (Object.hasOwn(values, languageKey)) {
    const language = values[languageKey]
    updates.language = language === 'en' || language === 'vi' ? language : browserLanguage
  }
  if (Object.hasOwn(values, activeKey)) updates.active = readActiveTheme(values[activeKey])
  if (Object.hasOwn(values, scheduleKey)) updates.schedule = readSchedule(values[scheduleKey])
  if (Object.hasOwn(values, focusKey)) updates.focusMode = values[focusKey] === true
  if (Object.hasOwn(values, performanceKey)) updates.performanceMode = values[performanceKey] === true
  if (Object.hasOwn(values, introKey)) updates.introSeen = values[introKey] === true
  const favorites = new Set(state.favorites)
  for (const [key, value] of Object.entries(values)) {
    if (!key.startsWith(favoritePrefix)) continue
    const id = key.slice(favoritePrefix.length)
    if (!themesById.has(id)) continue
    if (value === true) favorites.add(id)
    else favorites.delete(id)
    updates.favorites = favorites
  }
  return updates
}

export const usePreferences = create((set, get) => {
  const pending = new Set()
  async function write(key, operation) {
    if (pending.has(key)) return false
    pending.add(key)
    set({ error: null })
    try {
      await operation()
      return true
    } catch (error) {
      set({ error: error instanceof StudioError ? error.code
        : error?.name === 'QuotaExceededError' ? 'quotaError' : 'saveError' })
      return false
    } finally {
      pending.delete(key)
    }
  }

  return {
    ready: false,
    language: browserLanguage,
    active: readActiveTheme(),
    schedule: readSchedule(),
    tabSelection: readTabSelection(),
    focusMode: false,
    performanceMode: false,
    introSeen: false,
    restoreEpoch: 0,
    favorites: new Set(),
    error: null,
    setLanguage: (language) => write(languageKey, () => writePreference(languageKey, language)),
    toggleFavorite: (id) => write(favoritePrefix + id, () => writePreference(favoritePrefix + id, !get().favorites.has(id))),
    setSchedule: (schedule) => write(scheduleKey, () => writePreference(scheduleKey, readSchedule(schedule))),
    setFocusMode: (value) => write(focusKey, () => writePreference(focusKey, value)),
    setPerformanceMode: (value) => write(performanceKey, () => writePreference(performanceKey, value)),
    dismissIntro: () => write(introKey, () => writePreference(introKey, true)),
    resumeSchedule() {
      rememberTabSelection(null)
      set({ tabSelection: null })
    },
    applyTheme: (themeId, overrides, changes) => write(activeKey, async () => {
      const state = get()
      const sessionOnly = state.schedule.mode !== 'off'
      const selection = await saveActiveSelection(readActiveTheme({ version: 1, themeId, overrides }), {
        ...changes, sessionOnly, previousSelection: state.active,
      })
      if (sessionOnly && get().schedule.mode !== 'off') {
        rememberTabSelection(selection)
        set({ tabSelection: selection })
      }
    }),
  }
})

export function connectPreferences() {
  let cancelled = false
  let hydrationChanges = {}
  let legacyActive = readActiveTheme()
  let selectionRead = 0
  let lastScheduledId
  let timer

  function applyPreferences(values) {
    usePreferences.setState((state) => {
      const { active, ...rest } = mergePreferences(values, state)
      if (active) legacyActive = active
      if (rest.schedule?.mode === 'off') {
        rememberTabSelection(null)
        rest.tabSelection = null
      }
      return rest
    })
    if (Object.hasOwn(values, activeKey) && !hydrationChanges) void refreshSelection()
  }

  async function refreshSelection() {
    const read = ++selectionRead
    const { schedule, tabSelection } = usePreferences.getState()
    lastScheduledId = scheduledThemeId(schedule)
    const requested = lastScheduledId && (tabSelection ?? { version: 1, themeId: lastScheduledId, useBackground: true })
    try {
      const baseline = await readActiveSelection()
      const next = requested && (tabSelection || baseline?.themeId !== requested.themeId)
        ? await readActiveSelection(requested) : baseline
      if (!cancelled && read === selectionRead) {
        const effective = next ?? baseline
        usePreferences.setState({ active: effective ? { ...effective, ...readActiveTheme(effective) } : legacyActive })
      }
    } catch {
      if (!cancelled && read === selectionRead) {
        lastScheduledId = undefined
        usePreferences.setState({ error: 'readError' })
      }
    }
  }

  function watchClock() {
    window.clearInterval(timer)
    const { schedule, tabSelection } = usePreferences.getState()
    if (document.hidden || tabSelection || schedule.mode === 'off') return
    timer = window.setInterval(() => {
      if (scheduledThemeId(schedule) !== lastScheduledId) void refreshSelection()
    }, 1000)
  }

  const unsubscribe = storage.watch((values) => {
    if (hydrationChanges) Object.assign(hydrationChanges, values)
    applyPreferences(values)
  })
  const unwatchStudio = watchStudio((kind) => {
    if (kind === 'selection') void refreshSelection()
    if (kind === 'restore') {
      rememberTabSelection(null)
      usePreferences.setState((state) => ({ tabSelection: null, restoreEpoch: state.restoreEpoch + 1 }))
      void preferenceLock(restoredPreferences).then(async (pending) => {
        if (!cancelled) applyPreferences(pending?.values ?? await storage.read())
        if (!cancelled) await refreshSelection()
      }).catch(() => { if (!cancelled) usePreferences.setState({ error: 'readError' }) })
    }
  })
  const unsubscribeSchedule = usePreferences.subscribe((current, previous) => {
    if (!hydrationChanges && (current.schedule !== previous.schedule || current.tabSelection !== previous.tabSelection)) {
      void refreshSelection()
      watchClock()
    }
  })
  const refreshWhenVisible = () => {
    if (!document.hidden) void refreshSelection()
    watchClock()
  }
  document.addEventListener('visibilitychange', refreshWhenVisible)

  preferenceLock(async () => (await restoredPreferences())?.values ?? storage.read()).then((values) => {
    if (!cancelled) applyPreferences({ ...values, ...hydrationChanges })
  }).catch(() => {
    if (!cancelled) usePreferences.setState({ error: 'readError' })
  }).then(async () => {
    hydrationChanges = null
    if (!cancelled) {
      await refreshSelection()
      watchClock()
    }
    if (!cancelled) usePreferences.setState({ ready: true })
  })
  return () => {
    cancelled = true
    unsubscribe()
    unwatchStudio()
    unsubscribeSchedule()
    window.clearInterval(timer)
    document.removeEventListener('visibilitychange', refreshWhenVisible)
  }
}
