import { useEffect, useState } from 'react'
import { Check, Plus, Trash2 } from 'lucide-react'
import { readThemeDesign } from './studioRepository.js'
import { backdropEffects, effectSpeeds, effectStrengths, entryEffects, readSchedule, scheduleLimit } from './effects.js'
import { localized, themes, themesById } from './themeCatalog.js'
import { Clock, ThemeScene } from './ThemeScene.jsx'
import { motionAttributes } from './SceneEffects.jsx'
import { orderedWidgets } from './widgetLayouts.js'
import { WidgetFlow } from './Widgets.jsx'
import { t } from './i18n.js'

const effectFields = {
  backdrop: backdropEffects, text: entryEffects, widget: entryEffects,
  speed: effectSpeeds, strength: effectStrengths, finish: ['once', 'loop'],
}

function ThemeChoice({ label, value, onChange, language }) {
  const savedTheme = themesById.get(value)
  const savedThemeIsRetired = savedTheme && !themes.includes(savedTheme)
  return <label className="text-field"><span>{label}</span>
    <select value={value} onChange={(event) => onChange(event.target.value)}>
      {savedThemeIsRetired && <option value={value}>{localized(savedTheme.names, language)}</option>}
      {themes.map((theme) => <option value={theme.id} key={theme.id}>{localized(theme.names, language)}</option>)}
    </select>
  </label>
}

function TimeField({ label, value, onChange }) {
  return <label className="text-field"><span>{label}</span>
    <input type="time" required value={value} onChange={(event) => onChange(event.target.value)} />
  </label>
}

function ScheduleForm({ schedule, language, onSave, onResume, tabSelection }) {
  const [draft, setDraft] = useState(schedule)
  const [status, setStatus] = useState(null)
  const [saving, setSaving] = useState(false)
  const mode = draft.mode
  function update(patch) {
    setDraft({ ...draft, ...patch })
    setStatus(null)
  }
  function updateRule(index, patch) {
    update({ rules: draft.rules.map((rule, row) => row === index ? { ...rule, ...patch } : rule) })
  }
  async function save(event) {
    event.preventDefault()
    if (mode === 'dayNight' && draft.day === draft.night
      || mode === 'custom' && draft.rules.some(({ start, end }) => start === end)) {
      setStatus('scheduleSameTime')
      return
    }
    setSaving(true)
    const saved = await onSave(draft)
    setSaving(false)
    if (saved) {
      onResume()
      setStatus('scheduleSaved')
    }
  }
  return <form className="studio-panel effects-panel" onSubmit={save}>
    <h2>{t('scheduleTitle', language)}</h2>
    <label className="text-field"><span>{t('scheduleMode', language)}</span>
      <select value={mode} onChange={(event) => update({ mode: event.target.value })}>
        {['off', 'dayNight', 'custom'].map((key) => <option value={key} key={key}>{t('schedule_' + key, language)}</option>)}
      </select>
    </label>
    {mode === 'dayNight' && <>
      <div className="text-control-pair">
        <TimeField label={t('dayStart', language)} value={draft.day} onChange={(day) => update({ day })} />
        <ThemeChoice label={t('dayTheme', language)} value={draft.dayThemeId} onChange={(dayThemeId) => update({ dayThemeId })} language={language} />
      </div>
      <div className="text-control-pair">
        <TimeField label={t('nightStart', language)} value={draft.night} onChange={(night) => update({ night })} />
        <ThemeChoice label={t('nightTheme', language)} value={draft.nightThemeId} onChange={(nightThemeId) => update({ nightThemeId })} language={language} />
      </div>
    </>}
    {mode === 'custom' && <>
      <p className="studio-muted">{t('scheduleRuleHelp', language)}</p>
      {draft.rules.map((rule, index) => <div className="effects-schedule-row" key={index} role="group" aria-label={t('scheduleSlot', language) + ' ' + (index + 1)}>
        <TimeField label={t('scheduleStart', language)} value={rule.start} onChange={(start) => updateRule(index, { start })} />
        <TimeField label={t('scheduleEnd', language)} value={rule.end} onChange={(end) => updateRule(index, { end })} />
        <ThemeChoice label={t('scheduleTheme', language)} value={rule.themeId} onChange={(themeId) => updateRule(index, { themeId })} language={language} />
        <button type="button" className="secondary-button" aria-label={t('scheduleRemove', language)}
          onClick={() => update({ rules: draft.rules.filter((_, row) => row !== index) })}><Trash2 size={16} aria-hidden="true" /></button>
      </div>)}
      <button type="button" className="secondary-button" disabled={draft.rules.length >= scheduleLimit}
        onClick={() => update({ rules: [...draft.rules, { start: '08:00', end: '18:00', themeId: readSchedule().dayThemeId }] })}>
        <Plus size={16} aria-hidden="true" /> {t('scheduleAdd', language)}
      </button>
    </>}
    {mode !== 'off' && <p className="studio-muted">{t('scheduleSessionHelp', language)}</p>}
    {status && <p role={status === 'scheduleSameTime' ? 'alert' : 'status'}>{t(status, language)}</p>}
    <div className="tab-actions">
      <button type="submit" className="primary-button" disabled={saving}>{t('scheduleSave', language)}</button>
      {tabSelection && <button type="button" className="secondary-button" onClick={onResume}>{t('scheduleResume', language)}</button>}
    </div>
  </form>
}

function EffectControls({ theme, design, current, motion, language, onApply, onApplied }) {
  const [effects, setEffects] = useState(design.effects)
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(0)
  const auto = design.canvas.widgetLayout?.mode === 'auto'

  async function apply() {
    setSaving(true)
    if (await onApply(theme.id, current?.overrides ?? null, { effects })) onApplied()
    else setSaving(false)
  }

  return <div className="effects-workspace">
    <section className="effects-preview" key={preview} aria-label={t('preview', language)} {...motionAttributes(effects, motion)}>
      <ThemeScene theme={theme} background={current ? current.background : design.background} overrides={current?.overrides}
        textLayers={design.textLayers} canvas={design.canvas} dockWidgets={auto}
        effects={effects} motion={motion} language={language} className="effects-scene">
        <Clock language={language} />
      </ThemeScene>
      {auto && <WidgetFlow layers={orderedWidgets(design.canvas).filter((layer) => !layer.hidden)} language={language} />}
    </section>
    <fieldset className="studio-panel effects-panel" disabled={saving} aria-label={t('effectTitle', language)}>
      {Object.entries(effectFields).map(([key, items]) => <label key={key} className="text-field">
        <span>{t('effectField_' + key, language)}</span>
        <select value={effects[key]} onChange={(event) => { setEffects({ ...effects, [key]: event.target.value }); setPreview(preview + 1) }}>
          {items.map((value) => <option value={value} key={value}>{t('effect_' + value, language)}</option>)}
        </select>
      </label>)}
      {motion.disabled && <p role="status" className="studio-muted">{t('motionDisabled', language)}</p>}
      <div className="tab-actions">
        <button type="button" className="secondary-button" disabled={motion.disabled} onClick={() => setPreview(preview + 1)}>{t('effectReplay', language)}</button>
        <button type="button" className="primary-button" onClick={apply}>
          <Check size={16} aria-hidden="true" /> {t(saving ? 'working' : 'effectApply', language)}
        </button>
      </div>
    </fieldset>
  </div>
}

export function EffectsStudio({ theme, current, motion, language, onApply, onApplied, preferences }) {
  const [design, setDesign] = useState(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let cancel = false
    readThemeDesign(theme.id).then((value) => { if (!cancel) setDesign(value) })
      .catch(() => { if (!cancel) setFailed(true) })
    return () => { cancel = true }
  }, [theme.id])
  const {
    error, schedule, setSchedule, tabSelection, resumeSchedule,
    focusMode, performanceMode, setFocusMode, setPerformanceMode,
  } = preferences
  return <main id="main" tabIndex={-1} className="background-studio content-width">
    <div className="studio-heading"><div><h1>{t('effectTitle', language)}</h1><p>{localized(theme.names, language)}</p></div></div>
    {(failed || error) && <p role="alert" className="error-message">{t(failed ? 'readError' : error, language)}</p>}
    {design ? <EffectControls {...{ theme, design, current, motion, language, onApply, onApplied }} />
      : !failed && <p role="status">{t('loading', language)}</p>}
    <div className="effects-settings">
      <ScheduleForm {...{ schedule, tabSelection, language }} onSave={setSchedule} onResume={resumeSchedule} />
      <section className="studio-panel effects-panel">
        <h2>{t('effectModes', language)}</h2>
        <label className="text-checkbox"><input type="checkbox" checked={focusMode} onChange={(event) => setFocusMode(event.target.checked)} />{t('focusMode', language)}</label>
        <label className="text-checkbox"><input type="checkbox" checked={performanceMode} onChange={(event) => setPerformanceMode(event.target.checked)} />{t('performanceMode', language)}</label>
        <p className="studio-muted">{t('performanceHelp', language)}</p>
      </section>
    </div>
  </main>
}
