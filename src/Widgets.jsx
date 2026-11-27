import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Plus, Search, Trash2 } from 'lucide-react'
import { t } from './i18n.js'
import { loadWidgetData, saveWidgetData, watchStudio } from './studioRepository.js'
import { dailyQuote, localDay } from './typography.js'
import { calendarModel, readWidgetData, searchUrl, timerAction, timerRemaining } from './widgetModel.js'
import { Shortcuts } from './Shortcuts.jsx'
import { AnalogDial } from './AnalogClock.jsx'

const localeFor = (language) => language === 'vi' ? 'vi-VN' : 'en-US'

function useNow(interval = 1000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    let timer
    function schedule() {
      window.clearInterval(timer)
      if (!document.hidden) {
        setNow(new Date())
        timer = window.setInterval(() => setNow(new Date()), interval)
      }
    }
    schedule()
    document.addEventListener('visibilitychange', schedule)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', schedule)
    }
  }, [interval])
  return now
}

function usePersonal(id, kind, live) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  useEffect(() => {
    if (!live) return
    let alive = true
    let generation = 0
    async function refresh() {
      const read = ++generation
      try {
        const value = await loadWidgetData(id, kind)
        if (alive && read === generation) {
          setData(value)
          setError((problem) => problem === 'widgetReadError' ? null : problem)
        }
      } catch {
        if (alive && read === generation) setError('widgetReadError')
      }
    }
    const stop = watchStudio((event) => { if (event === 'widget:' + id) void refresh() })
    const refreshOnReturn = () => { if (!document.hidden) void refresh() }
    document.addEventListener('visibilitychange', refreshOnReturn)
    void refresh()
    return () => {
      alive = false
      stop()
      document.removeEventListener('visibilitychange', refreshOnReturn)
    }
  }, [id, kind, live])
  async function mutate(operation) {
    if (!live || !data) return false
    setError(null)
    try {
      await saveWidgetData(id, kind, operation)
      return true
    } catch {
      setError('widgetSaveError')
      return false
    }
  }
  return { value: live ? data : readWidgetData(kind), mutate, error }
}

function Digital({ config, language }) {
  const now = useNow(config.seconds ? 1000 : 10000)
  const text = now.toLocaleTimeString(localeFor(language), {
    hour: '2-digit', minute: '2-digit', ...(config.seconds && { second: '2-digit' }),
    hourCycle: config.hourCycle === '12' ? 'h12' : 'h23',
  })
  return <time className="widget-time" dateTime={now.toISOString()}>{text}</time>
}

function Analog({ config, language }) {
  const now = useNow(config.seconds ? 1000 : 10000)
  return <AnalogDial config={config} now={now} locale={localeFor(language)} />
}

function Greeting({ config, language }) {
  const now = useNow(10000)
  const hour = now.getHours()
  const greeting = t(hour < 12 ? 'widgetMorning' : hour < 18 ? 'widgetAfternoon' : 'widgetEvening', language)
  return <><strong className="widget-greeting">{greeting}{config.name && ', ' + config.name}</strong>
    <time dateTime={now.toISOString()}>{now.toLocaleDateString(localeFor(language), { dateStyle: 'full' })}</time></>
}

function SearchBox({ config, language, live }) {
  const [query, setQuery] = useState('')
  return (
    <form className="widget-form" onSubmit={(event) => {
      event.preventDefault()
      const url = searchUrl(config.engine, query)
      if (live && url) window.location.assign(url)
    }}>
      <input type="search" value={query} disabled={!live} aria-label={t('widget_search', language)} maxLength={300}
        onChange={(event) => setQuery(event.target.value)} placeholder={t('widgetSearchHint', language)} />
      <button type="submit" disabled={!live} aria-label={t('widget_search', language)}><Search size={16} aria-hidden="true" /></button>
    </form>
  )
}

function Links({ id, config, language, live }) {
  const personal = usePersonal(id, 'links', live)
  return <Shortcuts {...{ config, language, live, personal }} />
}

function Calendar({ language, live }) {
  const now = useNow(10000)
  const [shift, setShift] = useState(0)
  const date = new Date(now.getFullYear(), now.getMonth() + shift, 1, 12)
  const monday = language === 'vi'
  const model = calendarModel(date, monday)
  const sameMonth = model.year === now.getFullYear() && model.month === now.getMonth()
  const locale = localeFor(language)
  const title = date.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
  return <>
    <div className="widget-calendar-head">
      <button type="button" disabled={!live} aria-label={t('widgetPrevMonth', language)} onClick={() => setShift(shift - 1)}>
        <ArrowLeft size={14} aria-hidden="true" />
      </button>
      <strong>{title}</strong>
      <button type="button" disabled={!live} aria-label={t('widgetNextMonth', language)} onClick={() => setShift(shift + 1)}>
        <ArrowRight size={14} aria-hidden="true" />
      </button>
    </div>
    <div className="widget-calendar" aria-label={title}>
      {Array.from({ length: 7 }, (_, index) => (
        <span key={'d' + index} className="widget-muted">{new Date(2024, 0, 7 + index + Number(monday), 12)
          .toLocaleDateString(locale, { weekday: 'short' })}</span>
      ))}
      {Array.from({ length: model.offset }, (_, index) => <span key={'s' + index} aria-hidden="true" />)}
      {Array.from({ length: model.days }, (_, index) => (
        <span key={index} aria-current={sameMonth && index + 1 === now.getDate() ? 'date' : undefined}>{index + 1}</span>
      ))}
    </div>
  </>
}

function Feedback({ error, value, language }) {
  if (error) return <p role="alert" className="widget-error">{t(error, language)}</p>
  if (!value) return <p className="widget-muted" role="status">{t('widgetLoading', language)}</p>
  return null
}

function Todo({ id, language, live }) {
  const { value, error, mutate } = usePersonal(id, 'todo', live)
  const [input, setInput] = useState('')
  const adding = useRef(false)
  async function add(event) {
    event.preventDefault()
    const text = input.trim()
    if (!text || adding.current) return
    adding.current = true
    const task = { id: crypto.randomUUID(), text, done: false }
    if (await mutate((state) => {
      if (state.tasks.length >= 80) throw new Error('Task limit')
      return { tasks: [...state.tasks, task] }
    })) setInput((current) => current.trim() === text ? '' : current)
    adding.current = false
  }
  return <>
    <Feedback {...{ error, value, language }} />
    <form className="widget-form" onSubmit={add}>
      <input value={input} maxLength={160} disabled={!live || !value || value.tasks.length >= 80}
        onChange={(event) => setInput(event.target.value)} placeholder={t('widgetAddTask', language)} aria-label={t('widgetAddTask', language)} />
      <button type="submit" disabled={!live || !value || value.tasks.length >= 80} aria-label={t('widgetAddTask', language)}><Plus size={16} aria-hidden="true" /></button>
    </form>
    <ul className="widget-tasks">{value?.tasks.map((task) => <li key={task.id}>
      <label><input type="checkbox" checked={task.done} disabled={!live} onChange={(event) => {
        const done = event.target.checked
        void mutate((state) => ({ tasks: state.tasks.map((item) => item.id === task.id ? { ...item, done } : item) }))
      }} />
        <span>{task.text}</span></label>
      <button type="button" disabled={!live} aria-label={t('widgetRemoveTask', language) + ' · ' + task.text}
        onClick={() => void mutate((state) => ({ tasks: state.tasks.filter((item) => item.id !== task.id) }))}>
        <Trash2 size={13} aria-hidden="true" />
      </button>
    </li>)}</ul>
  </>
}

function Notes({ id, language, live }) {
  const { value, error, mutate } = usePersonal(id, 'notes', live)
  const [draft, setDraft] = useState(null)
  const [saving, setSaving] = useState(false)
  async function save(event) {
    event.preventDefault()
    if (draft === null || saving) return
    setSaving(true)
    if (await mutate(() => ({ text: draft }))) setDraft(null)
    setSaving(false)
  }
  return <>
    <Feedback {...{ error, value, language }} />
    <form className="widget-notes" onSubmit={save}>
      <textarea rows={3} maxLength={4000} disabled={!live || !value || saving} value={draft ?? value?.text ?? ''}
        onChange={(event) => setDraft(event.target.value)} placeholder={t('widgetNotesHint', language)} aria-label={t('widget_notes', language)} />
      <button type="submit" disabled={!live || !value || saving || draft === null}>{t('widgetSave', language)}</button>
    </form>
  </>
}

function Quote({ language, live }) {
  const now = useNow(10000)
  const entry = dailyQuote(localDay(now))
  const locale = language === 'vi' ? 1 : 0
  return <div key={entry.id} className="widget-quote-body" tabIndex={live ? 0 : undefined} role="region"
    aria-label={t('widget_quote', language)}>
    {entry.references && <cite>{entry.references[locale]}{language === 'en' && ' · WEB'}</cite>}
    <blockquote>{entry.texts[locale]}</blockquote>
  </div>
}

function Timer({ id, kind, config, language, live }) {
  const now = useNow()
  const { value, error, mutate } = usePersonal(id, kind, live)
  const state = value ?? readWidgetData(kind)
  const remaining = timerRemaining(config, state, Math.max(now.getTime(), Date.now()))
  const seconds = Math.ceil(remaining / 1000)
  const running = state.deadline !== null && seconds > 0
  const done = state.deadline !== null && seconds === 0
  const disabled = !live || !value
  const act = (action) => void mutate((previous) => timerAction(previous, config, action, Date.now()))
  return <>
    <Feedback {...{ error, value, language }} />
    {kind === 'pomodoro' && <span className="widget-muted">{t(state.phase === 'break' ? 'widgetRest' : 'widgetFocus', language)}</span>}
    <span className="widget-time" role="timer">{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</span>
    {done && <span role="status">{t('widgetTimeUp', language)}</span>}
    <div className="widget-timer-controls">
      <button type="button" disabled={disabled} onClick={() => act(running ? 'pause' : 'start')}>
        {t(running ? 'widgetPause' : 'widgetStart', language)}
      </button>
      <button type="button" disabled={disabled} onClick={() => act('reset')}>{t('widgetReset', language)}</button>
      {kind === 'pomodoro' && <button type="button" disabled={disabled} onClick={() => act('switch')}>
        {t(state.phase === 'break' ? 'widgetFocus' : 'widgetRest', language)}
      </button>}
    </div>
  </>
}

const views = {
  digital: Digital, analog: Analog, greeting: Greeting, search: SearchBox, links: Links,
  calendar: Calendar, todo: Todo, notes: Notes, quote: Quote, pomodoro: Timer, countdown: Timer,
}

export function Widget({ layer, language, live = false }) {
  const { id, props: { kind, config, surface, color, surfaceOpacity } } = layer
  const View = views[kind]
  return <section className="widget-card" data-widget-kind={kind} data-surface={surface} data-live={live}
    style={{ '--widget-color': color, '--widget-surface-opacity': surfaceOpacity === undefined ? undefined : `${surfaceOpacity}%` }}
    aria-label={config.title || t('widget_' + kind, language)}>
    {(config.title || !['analog', 'greeting', 'digital'].includes(kind)) &&
      <h3>{config.title || t('widget_' + kind, language)}</h3>}
    <View {...{ id, kind, config, language, live }} />
  </section>
}

export function WidgetFlow({ layers, language, live = false, visibleIds, className = '' }) {
  if (!layers.length) return null
  return <section className={`widget-flow ${className}`} aria-label={t('widgets', language)}>
    {layers.map((layer) => <div key={layer.id} data-widget-id={layer.id} hidden={visibleIds && !visibleIds.has(layer.id)}
      style={{ opacity: layer.opacity / 100 }}>
      <Widget layer={layer} language={language} live={live} />
    </div>)}
  </section>
}
