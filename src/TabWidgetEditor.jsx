import { useEffect, useRef, useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { canvasLimit, makeLayer, readCanvas } from './canvasModel.js'
import { moveLayers } from './canvasGeometry.js'
import { t } from './i18n.js'
import { StudioError } from './studioRepository.js'
import { useCanvasGesture } from './useCanvasGesture.js'
import { insertWidget } from './widgetLayouts.js'
import { widgetKinds } from './widgetModel.js'

const directions = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }

function applyWidgetDraft(saved, original, draft, moved) {
  const before = new Map(original.layers.map((layer) => [layer.id, layer]))
  const after = new Map(draft.map((layer) => [layer.id, layer]))
  const additions = draft.filter((layer) => !before.has(layer.id))
  if (saved.layers.length + additions.length > canvasLimit) throw new StudioError('widgetNoSpace')
  const layers = saved.layers.map((layer) => {
    const previous = before.get(layer.id)
    const next = after.get(layer.id)
    if (!previous || !next || previous === next || layer.type !== 'widget') return layer
    const changes = {}
    if (previous.hidden !== next.hidden) changes.hidden = next.hidden
    if (!layer.locked && (previous.x !== next.x || previous.y !== next.y)) {
      changes.x = next.x
      changes.y = next.y
    }
    if (previous.props.surfaceOpacity !== next.props.surfaceOpacity) {
      changes.props = { ...layer.props, surfaceOpacity: next.props.surfaceOpacity }
    }
    return { ...layer, ...changes }
  })
  return {
    ...saved, layers: [...layers, ...additions],
    ...(moved && { widgetLayout: { mode: 'free', order: saved.widgetLayout?.order ?? [] } }),
  }
}

export function TabWidgetEditor({ active, language, onApply, onClose, children }) {
  const [original] = useState(() => readCanvas(active.canvas))
  const [layers, setLayers] = useState(original.layers)
  const [selectedId, select] = useState('')
  const [pickerOpen, showPicker] = useState(true)
  const [moved, setMoved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const savingRef = useRef(false)
  const pickerButton = useRef(null)

  useEffect(() => { pickerButton.current?.focus() }, [])

  function commitMove(next) {
    if (next.every((layer, index) => layer === layers[index])) return
    setLayers(next)
    setMoved(true)
  }
  const gesture = useCanvasGesture(commitMove)
  const widgets = layers.filter((layer) => layer.type === 'widget')
  const visible = widgets.filter((layer) => !layer.hidden)
  const selected = visible.find((layer) => layer.id === selectedId)
  const dirty = layers.some((layer, index) => layer !== original.layers[index])

  function chooseWidget(kind, id, show) {
    setError('')
    if (!id) {
      if (layers.length >= canvasLimit) {
        setError('widgetNoSpace')
        return
      }
      const layer = insertWidget(layers, kind)?.[0] ?? makeLayer('widget', widgets.length, { kind })
      setLayers([...layers, layer])
      select(layer.id)
      return
    }
    setLayers(layers.map((layer) => layer.id === id ? { ...layer, hidden: !show } : layer))
    if (show) select(id)
    else if (selectedId === id) select('')
  }

  async function save() {
    if (savingRef.current || gesture.preview || !dirty) return
    setError('')
    savingRef.current = true
    setSaving(true)
    const saved = await onApply(active.themeId, active.overrides, {
      keepBackground: true,
      canvas: (latest) => applyWidgetDraft(latest, original, layers, moved),
    })
    savingRef.current = false
    setSaving(false)
    if (saved) onClose()
  }

  function onLayer(event, id) {
    const layer = visible.find((item) => item.id === id)
    if (event.button !== 0 || !layer || savingRef.current) return
    showPicker(false)
    select(id)
    gesture.begin(event, 'move', layers, [id], false)
  }

  function onKeyDown(event) {
    if (event.key === 'Escape' && !savingRef.current) {
      if (!gesture.cancel()) onClose()
      return
    }
    if (!selected || selected.locked || savingRef.current || gesture.preview || !Object.hasOwn(directions, event.key)) return
    event.preventDefault()
    const [x, y] = directions[event.key]
    const step = event.shiftKey ? 24 : 4
    const { items: [next] } = moveLayers([selected], x * step, y * step, { tolerance: 0 })
    if (next.x !== selected.x || next.y !== selected.y) {
      commitMove(layers.map((layer) => layer.id === selected.id ? next : layer))
    }
  }

  const editor = {
    widgetsOnly: true, planeRef: gesture.planeRef, selected: selected ? [selected.id] : [],
    guides: gesture.preview?.guides ?? {}, onLayer, onKeyDown, onLostCapture: gesture.lostCapture,
  }
  const name = (layer) => layer.props.config.title || t('widget_' + layer.props.kind, language)
  const canvas = { ...original, layers: gesture.preview?.layers ?? layers }

  return children(canvas, editor, <section id="tab-widget-editor" className="tab-widget-editor"
    aria-label={t('widgetEditTab', language)} onKeyDown={(event) => {
      if (event.key === 'Escape' && !savingRef.current) {
        event.stopPropagation()
        if (pickerOpen) {
          showPicker(false)
          pickerButton.current?.focus()
        } else onClose()
      }
    }}>
    <div className="tab-widget-tools">
      <div className="tab-widget-picker">
        <button type="button" ref={pickerButton} className="tab-widget-tool" aria-expanded={pickerOpen}
          aria-controls="tab-widget-options" disabled={saving} onClick={() => showPicker(!pickerOpen)}>
          {t('widgets', language)} <ChevronDown size={15} aria-hidden="true" />
        </button>
        <div id="tab-widget-options" className="tab-widget-options" hidden={!pickerOpen}>
          {widgetKinds.map((kind) => {
            const existing = widgets.filter((layer) => layer.props.kind === kind)
            const options = existing.length ? existing : [null]
            return options.map((layer, index) => <label key={layer?.id ?? kind}>
              <input type="checkbox" checked={Boolean(layer && !layer.hidden)} disabled={saving || Boolean(gesture.preview)}
                onChange={(event) => chooseWidget(kind, layer?.id, event.target.checked)} />
              <span>{layer ? name(layer) : t('widget_' + kind, language)}{existing.length > 1 && ` (${index + 1})`}</span>
            </label>)
          })}
        </div>
      </div>
      {visible.length > 0 && <select className="tab-widget-tool tab-widget-select" value={selected?.id ?? ''}
        aria-label={t('widgetSelectTab', language)} disabled={saving || Boolean(gesture.preview)} onChange={(event) => {
          select(event.target.value)
          showPicker(false)
          gesture.planeRef.current?.focus()
        }}>
        <option value="">{t('widgetSelectTab', language)}</option>
        {visible.map((layer, index) => <option key={layer.id} value={layer.id}>{index + 1}. {name(layer)}</option>)}
      </select>}
      {selected?.props.surface === 'glass' && <label className="tab-widget-opacity">
        <span>{t('widgetSurfaceOpacity', language)}</span>
        <input type="range" min="0" max="100" value={selected.props.surfaceOpacity} disabled={saving || Boolean(gesture.preview)}
          onChange={(event) => {
            const surfaceOpacity = event.target.valueAsNumber
            setLayers(layers.map((layer) => layer.id === selected.id ? {
              ...layer, props: { ...layer.props, surfaceOpacity },
            } : layer))
          }} />
        <output>{selected.props.surfaceOpacity}%</output>
      </label>}
      <button type="button" className="tab-widget-tool tab-widget-save" disabled={!dirty || saving || Boolean(gesture.preview)}
        onClick={save}>{t(saving ? 'widgetSavingTab' : 'widgetSaveTab', language)}</button>
      <button type="button" className="tab-widget-tool" aria-label={t('cancel', language)} title={t('cancel', language)}
        onClick={onClose} disabled={saving}><X size={17} aria-hidden="true" /></button>
    </div>
    <p className="tab-widget-hint">{t(moved && original.widgetLayout?.mode === 'auto' ? 'widgetFreeAfterMove' : 'widgetDragHelp', language)}</p>
    {error && <p className="tab-widget-hint" role="alert">{t(error, language)}</p>}
  </section>)
}
