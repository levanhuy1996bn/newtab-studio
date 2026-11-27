import { useEffect, useState } from 'react'
import { canvasSize, clamp, minLayerSize, stickers } from './canvasModel.js'
import { t } from './i18n.js'
import { StudioColor, StudioRange } from './StudioFields.jsx'
import { textFonts } from './typography.js'
import { httpUrl, searchEngines } from './widgetModel.js'
import { AnalogOptions } from './AnalogClock.jsx'

export function canvasLayerName(layer, language) {
  if (layer.name) return layer.name
  if (layer.type === 'widget') return layer.props.config.title || t('widget_' + layer.props.kind, language)
  if (layer.type === 'sticker') return t('layer_sticker', language) + ' ' + layer.props.symbol
  if (layer.type === 'text' && layer.props.text.trim()) return layer.props.text.trim().split('\n')[0].slice(0, 60)
  return t('layer_' + layer.type, language)
}

function LinkFields({ links, update, language }) {
  const [url, setUrl] = useState('')
  const [label, setLabel] = useState('')
  const [invalid, setInvalid] = useState(false)
  function add(event) {
    event.preventDefault()
    const address = httpUrl(url.trim())
    if (!address) {
      setInvalid(true)
      return
    }
    update([...links, { label, url: address }])
    setUrl('')
    setLabel('')
    setInvalid(false)
  }
  return <div className="widget-config">
    <ul className="widget-link-config">{links.map((link, index) => <li key={link.url + index}>
      <span>{link.label}</span><button type="button" className="text-button"
        onClick={() => update(links.filter((_, position) => position !== index))}>
        {t('widgetRemoveLink', language)}
      </button>
    </li>)}</ul>
    {links.length < 8 && <form className="widget-config" onSubmit={add} noValidate>
      <label className="text-field">{t('widgetLinkLabel', language)}
        <input type="text" value={label} maxLength={40} onChange={(event) => setLabel(event.target.value)} />
      </label>
      <label className="text-field">{t('widgetLinkAddress', language)}
        <input type="url" value={url} maxLength={2048} onChange={(event) => { setUrl(event.target.value); setInvalid(false) }} />
      </label>
      {invalid && <p className="error-message" role="alert">{t('widgetInvalidLink', language)}</p>}
      <button type="submit" className="secondary-button">{t('widgetAddLink', language)}</button>
    </form>}
  </div>
}

function WidgetSettings({ props, update, language }) {
  const { kind, config } = props
  const patch = (values) => update({ config: { ...config, ...values } })
  function field(key, values) {
    return <label className="text-field">{t('widgetField_' + key, language)}
      <select value={key === 'surface' ? props.surface : config[key]} onChange={(event) => {
        const value = event.target.value
        if (key === 'surface') {
          const color = props.surface === 'paper' ? '#202a25' : '#fffdf4'
          update({ surface: value, ...(props.color === color && { color: value === 'paper' ? '#202a25' : '#fffdf4' }) })
        } else patch({ [key]: value })
      }}>
        {values.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
      </select>
    </label>
  }
  return <div className="widget-config">
    <Field text label={t('widgetHeading', language)} value={config.title} update={(title) => patch({ title })} />
    {field('surface', ['glass', 'paper', 'clear'].map((id) => [id, t('widgetSurface_' + id, language)]))}
    {kind === 'digital' && field('hourCycle', [['24', '24h'], ['12', '12h']])}
    {kind === 'analog' && <AnalogOptions config={config} language={language} onChange={patch} />}
    {kind === 'digital' && <label className="text-checkbox">
      <input type="checkbox" checked={config.seconds} onChange={(event) => patch({ seconds: event.target.checked })} />
      {t('widgetSeconds', language)}
    </label>}
    {kind === 'greeting' && <Field text label={t('widgetDisplayName', language)} value={config.name}
      update={(name) => patch({ name })} />}
    {kind === 'search' && field('engine', Object.entries(searchEngines).map(([id, [name]]) => [id, name]))}
    {kind === 'links' && <LinkFields links={config.links} update={(links) => patch({ links })} language={language} />}
    {(kind === 'pomodoro' || kind === 'countdown') && <Field label={t('widgetMinutes', language)} value={config.minutes}
      min={1} max={720} update={(minutes) => patch({ minutes })} />}
    {kind === 'pomodoro' && <Field label={t('widgetBreakMinutes', language)} value={config.breakMinutes}
      min={1} max={120} update={(breakMinutes) => patch({ breakMinutes })} />}
  </div>
}

function Field({ label, value, update, min, max, text = false }) {
  const initial = String(text ? value : Math.round(value * 10) / 10)
  const [draft, setDraft] = useState(initial)
  useEffect(() => { setDraft(initial) }, [initial])

  function commit() {
    if (draft === initial) return
    if (!text && (!draft.trim() || !Number.isFinite(Number(draft)))) {
      setDraft(initial)
      return
    }
    const next = text ? draft.trim() : clamp(Number(draft), min, max)
    setDraft(String(text ? next : Math.round(next * 10) / 10))
    update(next)
  }

  return (
    <label className="text-field">
      <span>{label}</span>
      <input type={text ? 'text' : 'number'} aria-label={label} value={draft} min={min} max={max}
        maxLength={text ? 60 : undefined} step={text ? undefined : 'any'}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit} onKeyDown={(event) => {
          if (event.key === 'Enter') event.currentTarget.blur()
          if (event.key === 'Escape') setDraft(initial)
        }} />
    </label>
  )
}

export function CanvasInspector({ layer, update, language, disabled }) {
  if (!layer) return null
  const { type, props } = layer
  const setProps = (values) => update({ props: { ...props, ...values } })
  return (
    <fieldset className="studio-panel canvas-inspector" disabled={disabled || layer.locked} aria-label={t('layerProperties', language)}>
      <h2>{t('layerProperties', language)}</h2>
      <Field text label={t('layerName', language)} value={layer.name} update={(name) => update({ name })} />
      <div className="canvas-fields">
        {[
          ['x', 'X', 0, canvasSize.width - layer.width], ['y', 'Y', 0, canvasSize.height - layer.height],
          ['width', t('layerWidth', language), minLayerSize, canvasSize.width],
          ['height', t('layerHeight', language), minLayerSize, canvasSize.height],
          ['rotation', t('text_rotation', language), -180, 180],
          ['opacity', t('layerOpacity', language), 0, 100],
        ].map(([key, label, min, max]) => (
          <Field key={key} label={label} value={layer[key]} min={min} max={max} update={(value) => update({ [key]: value })} />
        ))}
      </div>
      {type !== 'image' && <StudioColor label={t('layerColor', language)} value={props.color} onChange={(color) => setProps({ color })} />}
      {type === 'widget' && <WidgetSettings props={props} update={setProps} language={language} />}
      {type === 'frame' && <StudioRange label={t('frameStroke', language)} value={props.stroke}
        limit={{ min: 1, max: 32, unit: 'px' }} onChange={(stroke) => setProps({ stroke })} />}
      {type === 'sticker' && <div className="canvas-stickers" role="group" aria-label={t('layer_sticker', language)}>
        {stickers.map((symbol) => (
          <button key={symbol} type="button" className="chip" aria-pressed={props.symbol === symbol}
            onClick={() => setProps({ symbol })}>{symbol}</button>
        ))}
      </div>}
      {type === 'text' && <>
        <label className="text-field">{t('textContent', language)}
          <textarea rows={2} aria-label={t('textContent', language)} maxLength={480} value={props.text}
            onChange={(event) => setProps({ text: event.target.value })} />
        </label>
        <label className="text-field">{t('text_font', language)}
          <select value={props.font} onChange={(event) => setProps({ font: event.target.value })}>
            {Object.entries(textFonts).map(([id, font]) => <option key={id} value={id}>
              {id === 'mono' ? t('fontMono', language) : font.name}
            </option>)}
          </select>
        </label>
        <StudioRange label={t('text_size', language)} value={props.size} limit={{ min: 12, max: 120, unit: 'px' }}
          onChange={(size) => setProps({ size })} />
      </>}
    </fieldset>
  )
}
