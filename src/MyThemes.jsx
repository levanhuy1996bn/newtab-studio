import { useRef, useState } from 'react'
import { Download, FolderOpen, Plus, Upload } from 'lucide-react'
import { t } from './i18n.js'
import { restoreStudioData } from './preferences.js'
import { defaultWorkspaceId, isCustomThemeId } from './studioData.js'
import { createTransfer, readTransfer } from './studioTransfer.js'
import { discardThemeDrafts, removeCustomTheme, removeWorkspace, saveCustomTheme, saveWorkspace, StudioError } from './studioRepository.js'
import { localized, themesById } from './themeCatalog.js'
import { ThemeScene } from './ThemeScene.jsx'

function download(blob, name) {
  const browserUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = browserUrl
  link.download = name
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(browserUrl), 30_000)
}

function studioError(error) {
  return error instanceof StudioError ? error.code : error.name === 'QuotaExceededError' ? 'quotaError' : 'saveError'
}

export function TransferPanel({ language }) {
  const [candidate, setCandidate] = useState(null)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState(null)
  const [confirm, setConfirm] = useState(false)
  const input = useRef(null)

  async function run(operation) {
    setStatus(null)
    setBusy(true)
    try {
      await operation()
    } catch (error) {
      setStatus({ error: true, key: studioError(error) })
    } finally {
      setBusy(false)
    }
  }

  function openFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setCandidate(null)
    setConfirm(false)
    void run(async () => {
      const data = await readTransfer(file, t('phaseImported', language))
      setCandidate({ data, name: file.name })
    })
  }

  function install(mode) {
    const { data } = candidate
    void run(async () => {
      const pending = await restoreStudioData(data, mode, (id) => localized(themesById.get(id)?.names ?? ['', ''], language)
        || t('phaseImported', language))
      setCandidate(null)
      setConfirm(false)
      setStatus({ key: pending && !pending.persisted ? 'phaseRestorePending' : 'phaseImportDone' })
    })
  }

  return <section className="studio-panel phase-panel">
    <h2>{t('phaseTransfer', language)}</h2>
    <div className="phase-actions">
      <button type="button" className="secondary-button" disabled={busy} onClick={() => run(async () => {
        const file = await createTransfer()
        download(file, 'newtab-studio-backup.json')
        setStatus({ key: 'phaseExportDone' })
      })}><Download size={16} aria-hidden="true" /> {t('phaseBackup', language)}</button>
      <button type="button" className="secondary-button" disabled={busy} onClick={() => input.current?.click()}>
        <Upload size={16} aria-hidden="true" /> {t('phaseOpenFile', language)}</button>
      <input ref={input} type="file" accept=".json,application/json" onChange={openFile} hidden />
    </div>
    <p className="studio-muted">{t('phaseBackupHint', language)}</p>
    {candidate && <div className="phase-import-preview">
      <strong>{candidate.name}</strong>
      <ul>
        {[
          ['phaseThemeCount', candidate.data.themes.length], ['phaseAssetCount', candidate.data.assets.length],
          ['phaseWorkspaceCount', candidate.data.workspaces.length], ['phaseDraftCount', candidate.data.drafts.length],
          ['phaseWidgetCount', candidate.data.widgets.length],
        ].map(([key, size]) => <li key={key}>{t(key, language)} <strong>{size}</strong></li>)}
      </ul>
      <p className="studio-muted">{t('phaseMergeHint', language)}</p>
      {confirm && <p role="status">{t('phaseReplaceWarning', language)}</p>}
      <div className="phase-actions">
        <button type="button" className="primary-button" disabled={busy || confirm} onClick={() => install('merge')}>
          {t('phaseMerge', language)}
        </button>
        {candidate.data.full && <button type="button" className="secondary-button" disabled={busy}
          onClick={() => confirm ? install('replace') : setConfirm(true)}>
          {t(confirm ? 'phaseConfirmReplace' : 'phaseReplace', language)}
        </button>}
        <button type="button" className="secondary-button" disabled={busy}
          onClick={() => { setCandidate(null); setConfirm(false) }}>{t('cancel', language)}</button>
      </div>
    </div>}
    {busy && <p role="status">{t('working', language)}</p>}
    {status && <p role={status.error ? 'alert' : 'status'} className={status.error ? 'error-message' : 'studio-muted'}>
      {t(status.key, language)}
    </p>}
  </section>
}

export function MyThemes({ activeTheme, active, library, language, onPreview, onEditor, applyTheme, navigate }) {
  const [workspace, setWorkspace] = useState(defaultWorkspaceId)
  const [form, setForm] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [deletion, setDeletion] = useState(null)

  const workspaceName = (item) => item.name || t('phaseDefaultWorkspace', language)
  const selected = library.workspaces.find(({ id }) => id === workspace) ?? library.workspaces[0]
  const saved = new Set([...library.saved.map(({ id }) => id), ...library.drafts])
  const designs = new Map(library.saved.map((theme) => [theme.id, theme]))
  const records = [
    ...library.custom.filter((theme) => theme.workspaceId === selected.id),
    ...(selected.id === defaultWorkspaceId ? [...saved].map((id) => themesById.get(id)).filter(Boolean) : []),
  ]

  function chooseForm(kind, theme) {
    setError(null)
    setDeletion(null)
    setForm({
      kind, theme,
      name: theme ? localized(theme.names, language) : '',
      workspaceId: theme?.workspaceId ?? selected.id,
    })
  }

  async function run(operation) {
    setBusy(true)
    setError(null)
    try {
      await operation()
    } catch (problem) {
      setError(studioError(problem))
    } finally {
      setBusy(false)
    }
  }

  function save(event) {
    event.preventDefault()
    void run(async () => {
      if (form.kind === 'workspace') {
        setWorkspace(await saveWorkspace(form.name, form.id))
      } else {
        await saveCustomTheme({
          ...(form.kind === 'rename' ? { id: form.theme.id } : { sourceId: form.theme.id }),
          workspaceId: form.workspaceId, name: form.name,
          overrides: active.themeId === form.theme.id ? active.overrides : form.theme.overrides,
        })
        setWorkspace(form.workspaceId)
      }
      setForm(null)
    })
  }

  function remove(target) {
    if (deletion !== target.id) {
      setDeletion(target.id)
      return
    }
    void run(async () => {
      if (isCustomThemeId(target.id)) await removeCustomTheme(target.id)
      else {
        await removeWorkspace(target.id)
        setWorkspace(defaultWorkspaceId)
      }
      setDeletion(null)
    })
  }

  return <main id="main" tabIndex={-1} className="content-width background-studio phase-studio">
    <header className="studio-heading">
      <div><h1>{t('phaseThemes', language)}</h1><p>{t('phaseThemesHint', language)}</p></div>
      <button type="button" className="primary-button" disabled={busy}
        onClick={() => chooseForm('copy', activeTheme)}><Plus size={17} aria-hidden="true" /> {t('phaseCopyCurrent', language)}</button>
    </header>

    <section className="studio-panel phase-panel">
      <div className="phase-actions">
        <label className="text-field"><span>{t('phaseWorkspace', language)}</span>
          <select value={selected.id} onChange={(event) => { setWorkspace(event.target.value); setDeletion(null); setForm(null) }}>
            {library.workspaces.map((item) => <option key={item.id} value={item.id}>{workspaceName(item)}</option>)}
          </select>
        </label>
        <button type="button" className="secondary-button" disabled={busy}
          onClick={() => chooseForm('workspace')}><FolderOpen size={16} aria-hidden="true" /> {t('phaseNewWorkspace', language)}</button>
        {selected.id !== defaultWorkspaceId && <>
          <button type="button" className="secondary-button" disabled={busy} onClick={() => {
            setForm({ kind: 'workspace', id: selected.id, name: selected.name })
            setDeletion(null)
          }}>{t('phaseRename', language)}</button>
          <button type="button" className="secondary-button" disabled={busy} onClick={() => remove(selected)}>
            {t(deletion === selected.id ? 'phaseConfirmDelete' : 'phaseDeleteWorkspace', language)}
          </button>
        </>}
      </div>
      {deletion === selected.id && <p role="status">{t('phaseWorkspaceWarning', language)}</p>}
      {form && <form className="phase-edit-form" onSubmit={save}>
        <label className="text-field">{t('phaseName', language)}
          <input required value={form.name} maxLength={60} autoFocus
            onChange={(event) => setForm({ ...form, name: event.target.value })} />
        </label>
        {form.kind !== 'workspace' && <label className="text-field">{t('phaseWorkspace', language)}
          <select value={form.workspaceId} onChange={(event) => setForm({ ...form, workspaceId: event.target.value })}>
            {library.workspaces.map((item) => <option key={item.id} value={item.id}>{workspaceName(item)}</option>)}
          </select>
        </label>}
        <div className="phase-actions">
          <button className="primary-button" disabled={busy}>{t('widgetSaveTab', language)}</button>
          <button type="button" className="secondary-button" disabled={busy} onClick={() => setForm(null)}>{t('cancel', language)}</button>
        </div>
      </form>}
      {(error || library.error) && <p className="error-message" role="alert">{t(error || library.error, language)}</p>}
    </section>

    {records.length ? <div className="phase-theme-list">
      {records.map((theme) => <article key={theme.id} className="studio-panel phase-panel">
        <div aria-hidden="true">
          <ThemeScene theme={theme} background={(designs.get(theme.id) ?? theme).background} overrides={theme.overrides}
            className="phase-theme-preview" language={language} still />
        </div>
        <h2>{localized(theme.names, language)}</h2>
        {active.themeId === theme.id && <p className="studio-muted">{t('active', language)}</p>}
        {library.drafts.has(theme.id) && <p className="studio-muted">{t('phaseDraftSaved', language)}</p>}
        <div className="phase-actions">
          <button type="button" className="secondary-button" onClick={() => onPreview(theme)}>{t('preview', language)}</button>
          <label className="phase-editor-select"><span className="sr-only">{t('customize', language)}</span>
            <select value="" onChange={(event) => onEditor(theme.id, event.target.value)}>
              <option value="" disabled>{t('customize', language)}</option>
              {Object.entries({ studio: 'studio', text: 'textEditor', canvas: 'visualEditor', effects: 'effectTitle' })
                .map(([id, label]) => <option key={id} value={id}>{t(label, language)}</option>)}
            </select>
          </label>
          <button type="button" className="secondary-button" disabled={busy} onClick={() => run(async () => {
            if (await applyTheme(theme.id, theme.overrides ?? (active.themeId === theme.id ? active.overrides : null),
              { keepBackground: true })) navigate('tab')
            else throw new Error('apply failed')
          })}>{t('apply', language)}</button>
          <button type="button" className="secondary-button" disabled={busy}
            onClick={() => chooseForm('copy', theme)}>{t('phaseDuplicate', language)}</button>
          {library.drafts.has(theme.id) && <button type="button" className="secondary-button" disabled={busy} onClick={() => {
            if (deletion === 'draft:' + theme.id) void run(async () => { await discardThemeDrafts(theme.id); setDeletion(null) })
            else setDeletion('draft:' + theme.id)
          }}>{t(deletion === 'draft:' + theme.id ? 'phaseConfirmDelete' : 'phaseDiscardDrafts', language)}</button>}
          <button type="button" className="secondary-button" disabled={busy} onClick={() => run(async () => {
            const file = await createTransfer(theme.id, localized(theme.names, language),
              active.themeId === theme.id ? active.overrides : theme.overrides)
            download(file, 'newtab-studio-theme.json')
          })}>{t('phaseExportTheme', language)}</button>
          {isCustomThemeId(theme.id) && <>
            <button type="button" className="secondary-button" disabled={busy}
              onClick={() => chooseForm('rename', theme)}>{t('phaseEditTheme', language)}</button>
            <button type="button" className="secondary-button" disabled={busy}
              onClick={() => remove(theme)}>{t(deletion === theme.id ? 'phaseConfirmDelete' : 'phaseDeleteTheme', language)}</button>
          </>}
        </div>
        {deletion === theme.id && <p role="status">{t('phaseThemeWarning', language)}</p>}
        {deletion === 'draft:' + theme.id && <p role="status">{t('phaseDraftWarning', language)}</p>}
      </article>)}
    </div> : <p className="studio-muted">{t('phaseThemesEmpty', language)}</p>}
  </main>
}

export function StudioSettings({ preferences }) {
  const { language, introSeen, dismissIntro, setLanguage, focusMode, setFocusMode, performanceMode, setPerformanceMode } = preferences
  const [showGuide, setShowGuide] = useState(!introSeen)
  return <main id="main" tabIndex={-1} className="content-width background-studio phase-studio">
    <header className="studio-heading"><h1>{t('phaseSettings', language)}</h1></header>
    <section className="studio-panel phase-panel">
      {showGuide ? <>
        <h2>{t('phaseGuide', language)}</h2>
        <ol className="phase-guide">
          {['phaseGuideGallery', 'phaseGuideWidgets', 'phaseGuideBackup'].map((key) => <li key={key}>{t(key, language)}</li>)}
        </ol>
        <button type="button" className="secondary-button" onClick={async () => {
          if (await dismissIntro()) setShowGuide(false)
        }}>{t('phaseDismissGuide', language)}</button>
      </> : <button type="button" className="secondary-button" onClick={() => setShowGuide(true)}>{t('phaseGuide', language)}</button>}
    </section>
    <section className="studio-panel phase-panel">
      <label className="text-field">{t('phaseLanguage', language)}
        <select value={language} onChange={(event) => setLanguage(event.target.value)}>
          <option value="en">English</option><option value="vi">Tiếng Việt</option>
        </select>
      </label>
      <label className="text-checkbox"><input type="checkbox" checked={focusMode}
        onChange={(event) => setFocusMode(event.target.checked)} />{t('focusMode', language)}</label>
      <label className="text-checkbox"><input type="checkbox" checked={performanceMode}
        onChange={(event) => setPerformanceMode(event.target.checked)} />{t('performanceMode', language)}</label>
    </section>
    <TransferPanel language={language} />
  </main>
}
