import { useEffect, useRef, useState } from 'react'
import { CalendarDays, Check, Plus, Shuffle, Trash2, Type } from 'lucide-react'
import { t } from './i18n.js'
import { StudioColor, StudioRange } from './StudioFields.jsx'
import { readThemeDesign } from './studioRepository.js'
import { localized } from './themeCatalog.js'
import { Clock, ThemeScene } from './ThemeScene.jsx'
import {
  maxTextLayers, maxTextLength, newTextLayer, randomQuote, textEntries,
  textFonts, textPresets, textRanges,
} from './typography.js'

const groups = { greeting: 'greetings', poem: 'poems', quote: 'quotes' }

function TextLibrary({ language, disabled, insert, insertRandom, insertDaily }) {
  const [category, setCategory] = useState('greeting')

  return (
    <section className="studio-panel text-library" aria-labelledby="text-library-label">
      <div className="asset-library-heading">
        <h2 id="text-library-label">{t('textLibrary', language)}</h2>
        <div className="asset-tabs" role="group" aria-label={t('textLibrary', language)}>
          {Object.entries(groups).map(([key, label]) => (
            <button key={key} type="button" className="chip" aria-pressed={category === key}
              onClick={() => setCategory(key)}>{t(label, language)}</button>
          ))}
        </div>
      </div>
      {category === 'quote' && <div className="text-library-actions">
        <button type="button" className="secondary-button" disabled={disabled} onClick={insertRandom}>
          <Shuffle size={16} aria-hidden="true" /> {t('randomQuote', language)}
        </button>
        <button type="button" className="secondary-button" disabled={disabled} onClick={insertDaily}>
          <CalendarDays size={16} aria-hidden="true" /> {t('dailyQuote', language)}
        </button>
      </div>}
      <div className="text-template-grid">
        {textEntries.filter((entry) => entry.kind === category).map((entry) => (
          <button key={entry.id} type="button" className="text-template" disabled={disabled}
            onClick={() => insert({ entry })} aria-label={t('insertText', language) + ' · ' + localized(entry.titles, language)}>
            <span className="template-heading"><strong>{localized(entry.titles, language)}</strong><Plus size={15} aria-hidden="true" /></span>
            <span className="template-copy">{localized(entry.texts, language)}</span>
          </button>
        ))}
      </div>
      <p className="template-source">{t('originalTextSource', language)}</p>
    </section>
  )
}

function TextControls({ layer, language, update, contentRef }) {
  const range = (key) => (
    <StudioRange key={key} label={t('text_' + key, language)} limit={textRanges[key]} value={layer[key]}
      onChange={(value) => update({ [key]: value })} />
  )

  function options(key, values) {
    return (
      <label className="text-field">
        <span>{t('text_' + key, language)}</span>
        <select value={layer[key]} aria-label={t('text_' + key, language)}
          onChange={(event) => update({ [key]: event.target.value })}>
          {values.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
    )
  }

  return (
    <div className="text-properties">
      {layer.mode === 'daily'
        ? <div className="daily-note"><CalendarDays size={17} aria-hidden="true" /><p>{t('dailyHint', language)}</p></div>
        : <label className="text-field">
          <span>{t('textContent', language)} <output>{layer.text.length}/{maxTextLength}</output></span>
          <textarea ref={contentRef} aria-label={t('textContent', language)} rows={4} maxLength={maxTextLength}
            placeholder={t('textPlaceholder', language)} value={layer.text}
            onChange={(event) => update({ text: event.target.value, entryId: null })} />
        </label>}
      {options('font', Object.entries(textFonts).map(([id, font]) =>
        [id, id === 'mono' ? t('fontMono', language) : font.name]))}
      <div className="text-control-pair">
        {options('placement', ['above', 'below'].map((key) => [key, t('text_' + key, language)]))}
        {options('alignment', ['left', 'center', 'right'].map((key) => [key, t('text_' + key, language)]))}
      </div>
      <StudioColor label={t('text_color', language)} value={layer.color} onChange={(color) => update({ color })} />
      {range('size')}
      {range('weight')}
      <details className="studio-adjustments text-advanced">
        <summary>{t('advancedTypography', language)}</summary>
        <div className="studio-controls">
          <div className="typography-preset-row" role="group" aria-label={t('typographyPresets', language)}>
            {Object.entries(textPresets).map(([id, settings]) => (
              <button key={id} type="button" className="chip" onClick={() => update(settings)}>
                {t('style_' + id, language)}
              </button>
            ))}
          </div>
          {['lineHeight', 'spacing', 'opacity', 'rotation'].map(range)}
          <label className="text-checkbox">
            <input type="checkbox" checked={layer.shadow} onChange={(event) => update({ shadow: event.target.checked })} />
            {t('text_shadow', language)}
          </label>
        </div>
      </details>
    </div>
  )
}

export function TextEditor({ theme, current, language, error, onApply, onApplied }) {
  const [design, setDesign] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [failed, setFailed] = useState(false)
  const [saving, setSaving] = useState(false)
  const contentRef = useRef(null)
  const layers = design?.textLayers ?? []
  const selected = layers.find((layer) => layer.id === selectedId)
  const full = layers.length >= maxTextLayers

  useEffect(() => {
    let alive = true
    readThemeDesign(theme.id).then((saved) => {
      if (alive) {
        setDesign(saved)
        setSelectedId(saved.textLayers[0]?.id ?? null)
      }
    }).catch(() => {
      if (alive) setFailed(true)
    })
    return () => { alive = false }
  }, [theme.id])

  function insert(options) {
    if (!design || full || saving) return
    const layer = newTextLayer({ ...options, language })
    setDesign((value) => ({ ...value, textLayers: [...value.textLayers, layer] }))
    setSelectedId(layer.id)
    if (!options.entry && !options.daily) window.requestAnimationFrame(() => contentRef.current?.focus())
  }

  function update(values) {
    setDesign((value) => ({
      ...value,
      textLayers: value.textLayers.map((layer) => layer.id === selectedId ? { ...layer, ...values } : layer),
    }))
  }

  function removeSelected() {
    const index = layers.findIndex((layer) => layer.id === selectedId)
    const remaining = layers.filter((layer) => layer.id !== selectedId)
    setDesign((value) => ({ ...value, textLayers: remaining }))
    setSelectedId(remaining[Math.min(index, remaining.length - 1)]?.id ?? null)
  }

  async function apply() {
    setSaving(true)
    if (await onApply(theme.id, current?.overrides ?? null, { textLayers: layers })) onApplied()
    else setSaving(false)
  }

  const background = current ? current.background : design?.background
  return (
    <main id="main" tabIndex={-1} className="background-studio text-editor content-width">
      <div className="studio-heading">
        <div>
          <h1>{t('textEditor', language)}</h1>
          <p>{localized(theme.names, language)}</p>
        </div>
        <button className="primary-button" type="button" disabled={!design || saving} onClick={apply}>
          <Check size={17} aria-hidden="true" /> {t(saving ? 'working' : 'applyText', language)}
        </button>
      </div>
      {failed && <p role="alert" className="error-message">{t('readError', language)}</p>}
      {!failed && !design && <p role="status" className="studio-muted">{t('textLoading', language)}</p>}
      {error && <p role="alert" className="error-message">{t(error, language)}</p>}
      {design && <div className="studio-workspace text-workspace">
        <ThemeScene theme={theme} overrides={current?.overrides} background={background} canvas={current?.canvas ?? design.canvas}
          textLayers={layers} language={language} className="studio-scene typography-scene">
          <Clock language={language} />
        </ThemeScene>
        <fieldset className="studio-panel studio-settings text-settings" disabled={saving} aria-label={t('textBlocks', language)}>
          <div className="asset-library-heading">
            <h2>{t('textBlocks', language)}</h2>
            <button className="secondary-button" type="button" disabled={full} onClick={() => insert({})}>
              <Plus size={16} aria-hidden="true" /> {t('addText', language)}
            </button>
          </div>
          {full && <p role="status" className="studio-muted">{t('textLimit', language)}</p>}
          {layers.length > 0 ? (
            <div className="text-block-list" role="group" aria-label={t('textBlocks', language)}>
              {layers.map((layer, index) => {
                const title = layer.mode === 'daily' ? t('dailyQuote', language)
                  : layer.text.trim().split('\n')[0] || t('untitledText', language)
                return (
                  <button key={layer.id} type="button" aria-pressed={selectedId === layer.id}
                    onClick={() => setSelectedId(layer.id)} title={title}>
                    <Type size={15} aria-hidden="true" /><span>{title}</span><span className="block-index">{index + 1}</span>
                  </button>
                )
              })}
            </div>
          ) : <p className="studio-muted">{t('emptyText', language)}</p>}
          {selected && (
            <>
              <TextControls key={selected.id} layer={selected} language={language} update={update} contentRef={contentRef} />
              <button className="text-button remove-text" type="button" onClick={removeSelected}>
                <Trash2 size={15} aria-hidden="true" /> {t('removeText', language)}
              </button>
            </>
          )}
        </fieldset>
        <TextLibrary language={language} disabled={saving || full} insert={insert}
          insertRandom={() => insert({ entry: randomQuote(layers.findLast((layer) => layer.entryId)?.entryId) })}
          insertDaily={() => insert({ daily: true })} />
      </div>}
    </main>
  )
}
