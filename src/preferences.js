import { create } from 'zustand'
import { defaultThemeId, themesById } from './themeCatalog.js'
import { readActiveSelection, saveActiveSelection, StudioError, watchStudio } from './studioRepository.js'
import { readSchedule, scheduledThemeId } from './effects.js'

const languageKey = 'nts.language'
const activeKey = 'nts.activeTheme'
const scheduleKey = 'nts.schedule'
const focusKey = 'nts.focusMode'
const performanceKey = 'nts.performanceMode'
const tabSelectionKey = 'nts.tabSelection'
const favoritePrefix = 'nts.favorite.'
const colorPattern = /^#[0-9a-f]{6}$/i

export function readActiveTheme(value) {
  if (value?.version !== 1 || !themesById.has(value.themeId)) {
    return { version: 1, themeId: defaultThemeId, overrides: null }
  }
  const { base, accent } = value.overrides ?? {}
  const valid = [base, accent].every((color) => typeof color === 'string' && colorPattern.test(color))
  return {
    version: 1,
    themeId: value.themeId,
    overrides: valid ? { base: base.toLowerCase(), accent: accent.toLowerCase() } : null,
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
    if (themesById.has(saved?.themeId)) return { ...readActiveTheme(saved), useBackground: saved.useBackground === true }
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
    watch(callback) {
      notify = callback
      const listener = ({ key, newValue, storageArea }) => {
        if (storageArea === globalThis.localStorage) {
          callback(key === null
            ? Object.fromEntries([languageKey, activeKey, scheduleKey, focusKey, performanceKey,
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
    favorites: new Set(),
    error: null,
    setLanguage: (language) => write(languageKey, () => storage.write(languageKey, language)),
    toggleFavorite: (id) => write(favoritePrefix + id, () => storage.write(favoritePrefix + id, !get().favorites.has(id))),
    setSchedule: (schedule) => write(scheduleKey, () => storage.write(scheduleKey, readSchedule(schedule))),
    setFocusMode: (value) => write(focusKey, () => storage.write(focusKey, value)),
    setPerformanceMode: (value) => write(performanceKey, () => storage.write(performanceKey, value)),
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
    const requested = lastScheduledId && (tabSelection ?? { version: 1, themeId: lastScheduledId, overrides: null, useBackground: true })
    try {
      const baseline = await readActiveSelection()
      const next = requested && (tabSelection || baseline?.themeId !== requested.themeId)
        ? await readActiveSelection(requested) : baseline
      if (!cancelled && read === selectionRead) {
        usePreferences.setState({ active: next ? { ...next, ...readActiveTheme(next) } : legacyActive })
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

  storage.read().then((values) => {
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
