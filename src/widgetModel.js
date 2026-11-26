const heading = { title: '' }

export const widgetRegistry = {
  digital: { size: [320, 142], defaults: { ...heading, hourCycle: '24', seconds: false } },
  analog: { size: [210, 210], defaults: { ...heading, seconds: true } },
  greeting: { size: [360, 156], defaults: { ...heading, name: '' } },
  search: { size: [460, 114], defaults: { ...heading, engine: 'google' } },
  links: { size: [330, 160], defaults: { ...heading, links: [] } },
  calendar: { size: [335, 300], defaults: heading },
  todo: { size: [340, 250], defaults: heading },
  notes: { size: [340, 228], defaults: heading },
  quote: { size: [350, 144], defaults: heading },
  pomodoro: { size: [302, 192], defaults: { ...heading, minutes: 25, breakMinutes: 5 } },
  countdown: { size: [285, 174], defaults: { ...heading, minutes: 10 } },
}

export const widgetKinds = Object.keys(widgetRegistry)
export const searchEngines = {
  google: ['Google', 'https://www.google.com/search', 'q'],
  duckduckgo: ['DuckDuckGo', 'https://duckduckgo.com/', 'q'],
  bing: ['Bing', 'https://www.bing.com/search', 'q'],
}

const trim = (value, max) => typeof value === 'string' ? value.trim().slice(0, max) : ''
const integer = (value, max, fallback) => Number.isFinite(value) ? Math.max(1, Math.min(max, Math.round(value))) : fallback
export const shortcutLimit = 12
export const shortcutSources = ['manual', 'frequent', 'recent']

export function httpUrl(value) {
  if (typeof value !== 'string' || value.length > 2048) return null
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : null
  } catch {
    return null
  }
}

export function searchUrl(engine, query) {
  const value = trim(query, 300)
  if (!value) return null
  const [, address, key] = searchEngines[Object.hasOwn(searchEngines, engine) ? engine : 'google']
  const url = new URL(address)
  url.searchParams.set(key, value)
  return url.href
}

export function readShortcut(link) {
  const url = httpUrl(link?.url)
  return url ? { url, label: trim(link.label, 40) || new URL(url).hostname } : null
}

function readShortcuts(links, limit) {
  const byUrl = new Map()
  for (const entry of links) {
    const link = readShortcut(entry)
    if (link && !byUrl.has(link.url)) byUrl.set(link.url, link)
    if (byUrl.size === limit) break
  }
  return [...byUrl.values()]
}

export function historyShortcuts(items, source) {
  const recentFirst = (a, b) => (b.lastVisitTime ?? 0) - (a.lastVisitTime ?? 0)
  const sorted = [...items].sort(source === 'frequent'
    ? (a, b) => (b.visitCount ?? 0) - (a.visitCount ?? 0) || recentFirst(a, b)
    : recentFirst)
  return readShortcuts(sorted.map(({ url, title }) => ({ url, label: title })), 8)
}

export function readWidget(kind, input) {
  if (!Object.hasOwn(widgetRegistry, kind)) return null
  const defaults = widgetRegistry[kind].defaults
  const value = input ?? {}
  const title = trim(value.title, 60)
  const config = { ...defaults, title }
  if (kind === 'digital') config.hourCycle = value.hourCycle === '12' ? '12' : '24'
  if (kind === 'digital' || kind === 'analog') config.seconds = typeof value.seconds === 'boolean' ? value.seconds : defaults.seconds
  if (kind === 'greeting') config.name = trim(value.name, 36)
  if (kind === 'search' && Object.hasOwn(searchEngines, value.engine)) config.engine = value.engine
  if (kind === 'links' && Array.isArray(value.links)) {
    config.links = value.links.slice(0, 8).flatMap((link) => {
      const url = httpUrl(link?.url)
      return url ? [{ url, label: trim(link.label, 40) || new URL(url).hostname }] : []
    })
  }
  if (kind === 'pomodoro' || kind === 'countdown') config.minutes = integer(value.minutes, 720, defaults.minutes)
  if (kind === 'pomodoro') config.breakMinutes = integer(value.breakMinutes, 120, defaults.breakMinutes)
  return config
}

export function hasClockWidget(canvas) {
  return Boolean(canvas?.layers.some((layer) => layer.type === 'widget' && !layer.hidden
    && ['digital', 'analog'].includes(layer.props.kind)))
}

export function calendarModel(date, mondayFirst) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const weekday = new Date(year, month, 1, 12).getDay()
  const offset = (weekday + (mondayFirst ? 6 : 0)) % 7
  const days = new Date(year, month + 1, 0, 12).getDate()
  return { year, month, offset, days }
}

export const personalTypes = new Set(['links', 'todo', 'notes', 'pomodoro', 'countdown'])

export function readWidgetData(kind, data) {
  if (kind === 'links') return {
    source: shortcutSources.includes(data?.source) ? data.source : 'manual',
    links: Array.isArray(data?.links) ? readShortcuts(data.links, shortcutLimit) : null,
  }
  if (kind === 'notes') return { text: typeof data?.text === 'string' ? data.text.slice(0, 4000) : '' }
  if (kind === 'todo') {
    const seen = new Set()
    return { tasks: (Array.isArray(data?.tasks) ? data.tasks : []).slice(0, 80).flatMap((task) => {
      const text = trim(task?.text, 160)
      if (!text || typeof task.id !== 'string' || seen.has(task.id)) return []
      seen.add(task.id)
      return [{ id: task.id, text, done: task.done === true }]
    }) }
  }
  return {
    deadline: Number.isSafeInteger(data?.deadline) && data.deadline > 0 ? data.deadline : null,
    remaining: Number.isSafeInteger(data?.remaining) && data.remaining >= 0 ? data.remaining : null,
    phase: kind === 'pomodoro' && data?.phase === 'break' ? 'break' : 'focus',
  }
}

export function timerRemaining(config, state, now) {
  if (state.deadline !== null) return Math.max(0, state.deadline - now)
  if (state.remaining !== null) return state.remaining
  return (state.phase === 'break' ? config.breakMinutes : config.minutes) * 60_000
}

export function timerAction(state, config, action, now) {
  const remaining = timerRemaining(config, state, now)
  if (action === 'pause') return state.deadline === null ? state : { ...state, deadline: null, remaining }
  if (action === 'reset') return { ...state, deadline: null, remaining: null }
  if (action === 'switch') return { phase: state.phase === 'focus' ? 'break' : 'focus', deadline: null, remaining: null }
  if (state.deadline !== null && remaining > 0) return state
  const duration = remaining || timerRemaining(config, { ...state, remaining: null, deadline: null }, now)
  return { ...state, deadline: now + duration, remaining: null }
}
