import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link2, Pencil, Plus, Settings2, Trash2, X } from 'lucide-react'
import { t } from './i18n.js'
import { historyShortcuts, readShortcut, shortcutLimit, shortcutSources } from './widgetModel.js'

const historyAccess = { permissions: ['history'] }
const historyWindow = 90 * 24 * 60 * 60 * 1000

function useHistoryShortcuts(source) {
  const [result, setResult] = useState(null)

  useEffect(() => {
    setResult(null)
    if (source === 'manual') return
    const permissions = globalThis.chrome?.permissions
    let alive = true
    let revision = 0
    let historyApi
    function unsubscribeHistory() {
      historyApi?.onVisited.removeListener(refresh)
      historyApi?.onVisitRemoved.removeListener(refresh)
      historyApi = null
    }
    async function refresh() {
      const current = ++revision
      try {
        const granted = await permissions?.contains(historyAccess)
        if (!alive || revision !== current) return
        if (!granted || !globalThis.chrome?.history) {
          unsubscribeHistory()
          setResult({ source, message: 'shortcutsHistoryPermission' })
          return
        }
        if (!historyApi) {
          historyApi = chrome.history
          historyApi.onVisited.addListener(refresh)
          historyApi.onVisitRemoved.addListener(refresh)
        }
        const recent = source === 'recent'
        const items = await historyApi.search({ text: '', startTime: recent ? 0 : Date.now() - historyWindow,
          maxResults: recent ? 100 : 1000 })
        if (!alive || revision !== current) return
        const links = historyShortcuts(items, source)
        setResult({ source, links, message: links.length ? null : 'shortcutsHistoryEmpty' })
      } catch {
        if (alive && revision === current) setResult({ source, message: 'shortcutsHistoryError' })
      }
    }
    function changed(change) {
      if (!change.permissions?.includes('history')) return
      unsubscribeHistory()
      setResult(null)
      void refresh()
    }
    permissions?.onAdded.addListener(changed)
    permissions?.onRemoved.addListener(changed)
    void refresh()
    return () => {
      alive = false
      unsubscribeHistory()
      permissions?.onAdded.removeListener(changed)
      permissions?.onRemoved.removeListener(changed)
    }
  }, [source])

  return result?.source === source ? result : null
}

function ShortcutMark({ url }) {
  const host = new URL(url).hostname.replace(/^www\./, '')
  const letter = [...host][0]?.toUpperCase()
  const hue = [...host].reduce((sum, char) => (sum * 31 + char.codePointAt(0)) % 360, 0)
  return <span className="shortcut-mark" style={{ '--shortcut-hue': hue }} aria-hidden="true">
    {letter || <Link2 size={16} />}
  </span>
}

function ShortcutEditor({ section, links, source, language, mutate, config, error, onClose }) {
  const dialog = useRef(null)
  const heading = useId()
  const [form, setForm] = useState(section === 'add' ? { url: '', label: '' } : null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const historyAvailable = Boolean(globalThis.chrome?.permissions && globalThis.chrome?.runtime?.id)

  useEffect(() => {
    const modal = dialog.current
    modal.showModal()
    return () => { if (modal.open) modal.close() }
  }, [])

  async function setSource(next) {
    setSaving(true)
    setMessage(null)
    try {
      // The permission request must start in the user's click handler.
      if (next !== 'manual' && !await chrome.permissions.request(historyAccess)) {
        setMessage('shortcutsHistoryPermission')
        return
      }
      if (await mutate((current) => ({ ...current, source: next }))) onClose()
    } catch {
      setMessage('shortcutsHistoryError')
    } finally {
      setSaving(false)
    }
  }

  async function saveShortcut(event) {
    event.preventDefault()
    if (saving) return
    const raw = form.url.trim()
    const url = /^[a-z][a-z\d+.-]*:/i.test(raw) ? raw : 'https://' + raw
    const link = readShortcut({ ...form, url })
    if (!link) {
      setMessage('shortcutsInvalid')
      return
    }
    setSaving(true)
    setMessage(null)
    let issue = null
    const saved = await mutate((current) => {
      const stored = current.links ?? config.links
      if (stored.some(({ url }) => url === link.url && url !== form.original)) {
        issue = 'shortcutsDuplicate'
        return current
      }
      if (form.original && !stored.some(({ url }) => url === form.original)) {
        issue = 'shortcutsMissing'
        return current
      }
      if (!form.original && stored.length >= shortcutLimit) {
        issue = 'shortcutsFull'
        return current
      }
      const links = form.original
        ? stored.map((item) => item.url === form.original ? link : item)
        : [...stored, link]
      return { ...current, links }
    })
    setSaving(false)
    if (issue) setMessage(issue)
    else if (saved) onClose()
  }

  async function remove(url) {
    setSaving(true)
    setMessage(null)
    await mutate((current) => ({
      ...current, links: (current.links ?? config.links).filter((link) => link.url !== url),
    }))
    setSaving(false)
  }

  return <dialog ref={dialog} className="shortcut-dialog" aria-labelledby={heading} onCancel={(event) => {
    event.preventDefault()
    if (!saving) onClose()
  }}>
    <header>
      <h2 id={heading}>{t(form ? form.original ? 'shortcutsEdit' : 'shortcutsAdd' : 'shortcutsSettings', language)}</h2>
      <button type="button" disabled={saving} onClick={onClose} aria-label={t('cancel', language)}>
        <X size={19} aria-hidden="true" />
      </button>
    </header>
    {form ? <form className="shortcut-form" onSubmit={saveShortcut}>
      <label>{t('widgetLinkLabel', language)}
        <input value={form.label} maxLength={40} autoFocus onChange={(event) => setForm({ ...form, label: event.target.value })} />
      </label>
      <label>{t('widgetLinkAddress', language)}
        <input inputMode="url" value={form.url} required maxLength={2048} placeholder="https://example.com"
          onChange={(event) => setForm({ ...form, url: event.target.value })} />
      </label>
      <button className="primary-button" disabled={saving}>{t('widgetSaveTab', language)}</button>
    </form> : <>
      <div className="shortcut-sources" role="group" aria-label={t('shortcutsSource', language)}>
        {shortcutSources.map((mode) => <button type="button" key={mode} aria-pressed={mode === source}
          disabled={saving || (mode !== 'manual' && !historyAvailable)} onClick={() => setSource(mode)}>
          {t('shortcuts_' + mode, language)}
        </button>)}
      </div>
      <p className="shortcut-hint">{t(historyAvailable ? 'shortcutsHistoryHint' : 'shortcutsChromeOnly', language)}</p>
      <ul className="shortcut-manage">
        {links.map((link) => <li key={link.url}>
          <span>{link.label}</span>
          <button type="button" disabled={saving} aria-label={t('shortcutsEdit', language) + ' · ' + link.label}
            onClick={() => { setMessage(null); setForm({ ...link, original: link.url }) }}><Pencil size={15} aria-hidden="true" /></button>
          <button type="button" disabled={saving} aria-label={t('shortcutsRemove', language) + ' · ' + link.label}
            onClick={() => remove(link.url)}><Trash2 size={15} aria-hidden="true" /></button>
        </li>)}
      </ul>
      <button type="button" className="secondary-button" disabled={saving || links.length >= shortcutLimit}
        onClick={() => { setMessage(null); setForm({ url: '', label: '' }) }}>{t('shortcutsAdd', language)}</button>
    </>}
    {(message || error) && <p role="alert" className="shortcut-message">{t(message || error, language)}</p>}
  </dialog>
}

export function Shortcuts({ config, language, live, personal }) {
  const { value, mutate, error } = personal
  const [editing, setEditing] = useState(null)
  const opener = useRef(null)
  const source = value?.source ?? 'manual'
  const manual = value?.links ?? config.links
  const history = useHistoryShortcuts(live ? source : 'manual')
  const links = source === 'manual' ? manual : history?.links ?? []
  function open(event, section) {
    opener.current = event.currentTarget
    setEditing(section)
  }
  function close() {
    setEditing(null)
    opener.current?.focus()
  }

  return <>
    <div className="shortcut-strip">
      <ul className="shortcut-tiles" aria-label={t('shortcuts_' + source, language)}>
        {links.map(({ url, label }, index) => {
          const content = <><ShortcutMark url={url} /><span className="shortcut-label">{label}</span></>
          return <li key={url + index}>{live
            ? <a className="shortcut-tile" href={url} title={label} target="_blank" rel="noopener noreferrer">{content}</a>
            : <span className="shortcut-tile">{content}</span>}
          </li>
        })}
        {source === 'manual' && manual.length < shortcutLimit && <li>
          <button className="shortcut-tile" type="button" disabled={!live || !value} onClick={(event) => open(event, 'add')}>
            <span className="shortcut-mark shortcut-add" aria-hidden="true"><Plus size={17} /></span>
            <span className="shortcut-label">{t('shortcutsAdd', language)}</span>
          </button>
        </li>}
      </ul>
      {live && <button type="button" className="shortcut-settings" disabled={!value}
        title={t('shortcutsSettings', language)} aria-label={t('shortcutsSettings', language)}
        onClick={(event) => open(event, 'settings')}><Settings2 size={15} aria-hidden="true" /></button>}
    </div>
    {live && source !== 'manual' && (!history || history.message) &&
      <p role="status" className="widget-muted">{t(history?.message ?? 'widgetLoading', language)}</p>}
    {live && error && !editing && <p className="widget-error" role="alert">{t(error, language)}</p>}
    {editing && createPortal(<ShortcutEditor section={editing} links={manual} {...{ source, language, mutate, config, error }}
      onClose={close} />, document.body)}
  </>
}
