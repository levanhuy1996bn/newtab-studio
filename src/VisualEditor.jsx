import { useThemeDraft } from './useThemeDraft.js'
import { useEffect, useReducer, useRef, useState } from 'react'
import {
  AlignCenter, ArrowDown, ArrowUp, Check, Circle, Copy, Diamond, Eye, EyeOff, Frame, Grid2X2,
  Download, Group, Image, LayoutTemplate, Lock, Redo2, Square, Trash2, Type, Undo2, Ungroup, Unlock,
} from 'lucide-react'
import { bundledPictures } from './background.js'
import { alignLayers, moveLayers } from './canvasGeometry.js'
import { CanvasInspector, canvasLayerName } from './CanvasInspector.jsx'
import { canvasHistory, canvasLimit, duplicateLayers, makeLayer, readCanvas, reorderLayers, tidyGroups } from './canvasModel.js'
import { t } from './i18n.js'
import { listPictures, readThemeDesign, watchStudio } from './studioRepository.js'
import { localized } from './themeCatalog.js'
import { Clock, ThemeScene } from './ThemeScene.jsx'
import { useCanvasGesture } from './useCanvasGesture.js'
import { exportLayout } from './layoutExport.js'
import { insertPreset, insertWidget, layoutPresets, orderedWidgets } from './widgetLayouts.js'
import { widgetKinds } from './widgetModel.js'
import { WidgetFlow } from './Widgets.jsx'

const typeIcons = { rect: Square, ellipse: Circle, frame: Frame, sticker: Diamond, image: Image, text: Type }
const editable = 'input, textarea, select, [contenteditable]:not([contenteditable="false"])'

function Tool({ icon: Icon, label, action, disabled, pressed, children }) {
  return (
    <button className="canvas-tool" type="button" aria-label={label} aria-pressed={pressed}
      disabled={disabled} title={label} onClick={action}>
      <Icon size={16} aria-hidden="true" /> {children}
    </button>
  )
}

function ImagePicker({ onAdd, language }) {
  const [pictures, setPictures] = useState([])
  const [loadError, setLoadError] = useState(false)
  const [id, setId] = useState(bundledPictures[0].id)
  const options = [
    ...bundledPictures.map((picture) => [picture.id, localized(picture.names, language)]),
    ...pictures.map((picture) => [picture.id, picture.name]),
  ]
  const selected = options.find(([key]) => key === id) ?? options[0]

  useEffect(() => {
    let live = true
    let request = 0
    async function refresh() {
      const last = ++request
      try {
        const next = await listPictures()
        if (live && last === request) {
          setPictures(next)
          setLoadError(false)
        }
      } catch {
        if (live && last === request) setLoadError(true)
      }
    }
    const off = watchStudio((event) => { if (event === 'assets') void refresh() })
    void refresh()
    return () => { live = false; off() }
  }, [])

  return (
    <div className="canvas-image-picker">
      <select value={selected[0]} aria-label={t('assetLibrary', language)} onChange={(event) => setId(event.target.value)}>
        {options.map(([key, name]) => <option key={key} value={key}>{name}</option>)}
      </select>
      <button type="button" className="secondary-button" onClick={() => onAdd({ assetId: selected[0] }, selected[1])}>
        {t('canvasAddImage', language)}
      </button>
      {loadError && <p className="error-message" role="alert">{t('libraryError', language)}</p>}
    </div>
  )
}

function WidgetPicker({ language, onInsert, disabled }) {
  const [kind, setKind] = useState('digital')
  const [preset, setPreset] = useState('minimal')
  return <div className="widget-picker">
    {[
      ['widgets', widgetKinds, kind, setKind, 'widget_', 'addWidget', 'widget'],
      ['layouts', Object.keys(layoutPresets), preset, setPreset, 'layout_', 'addLayout', 'layout'],
    ].map(([label, options, value, select, prefix, action, type]) => (
      <div key={label}>
        <select aria-label={t(label, language)} value={value} disabled={disabled} onChange={(event) => select(event.target.value)}>
          {options.map((id) => <option key={id} value={id}>{t(prefix + id, language)}</option>)}
        </select>
        <button type="button" className="secondary-button" disabled={disabled} onClick={() => onInsert(type, value)}>
          {t(action, language)}
        </button>
      </div>
    ))}
  </div>
}

function LayerList({ layers, selected, language, select, toggle, menu, disabled }) {
  return (
    <section className="studio-panel canvas-layer-panel" aria-labelledby="canvas-layers">
      <h2 id="canvas-layers">{t('canvasLayers', language)}</h2>
      {!layers.length && <p className="studio-muted">{t('canvasEmpty', language)}</p>}
      <ul className="canvas-layer-list">
        {layers.slice().reverse().map((layer) => {
          const Icon = typeIcons[layer.type] ?? LayoutTemplate
          const name = canvasLayerName(layer, language)
          return (
            <li key={layer.id} data-canvas-row={layer.id} data-grouped={Boolean(layer.groupId)}>
              <button className="canvas-layer-pick" type="button" aria-pressed={selected.includes(layer.id)} disabled={disabled}
                onClick={(event) => select(layer.id, event.shiftKey)}
                onContextMenu={(event) => menu(event, layer.id)}
                onKeyDown={(event) => {
                  if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) menu(event, layer.id)
                }}>
                <Icon size={15} aria-hidden="true" /><span title={name}>{name}</span>
                {layer.groupId && <Group size={13} aria-label={t('canvasGrouped', language)} />}
              </button>
              <Tool icon={layer.hidden ? EyeOff : Eye} label={t(layer.hidden ? 'showLayer' : 'hideLayer', language) + ' · ' + name}
                action={() => toggle(layer.id, 'hidden')} pressed={layer.hidden} disabled={disabled} />
              <Tool icon={layer.locked ? Lock : Unlock} label={t(layer.locked ? 'unlockLayer' : 'lockLayer', language) + ' · ' + name}
                action={() => toggle(layer.id, 'locked')} pressed={layer.locked} disabled={disabled} />
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function CanvasWorkspace({ theme, current, design, language, error, onApply, onApplied }) {
  const [history, dispatch] = useReducer(canvasHistory, { past: [], layers: design.canvas.layers, future: [] })
  const [widgetMode, setWidgetMode] = useState(design.canvas.widgetLayout?.mode ?? 'free')
  const [widgetOrder, setWidgetOrder] = useState(design.canvas.widgetLayout?.order ?? [])
  const [selection, setSelection] = useState([])
  const [grid, setGrid] = useState(false)
  const [preview, setPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [addingImage, setAddingImage] = useState(false)
  const [addingWidgets, setAddingWidgets] = useState(false)
  const [placementIssue, setPlacementIssue] = useState(false)
  const [context, setContext] = useState(null)
  const contextRef = useRef(null)

  const { layers } = history
  const canvas = { layers, widgetLayout: { mode: widgetMode, order: widgetOrder } }
  const draftStatus = useThemeDraft(theme.id, 'canvas', canvas)
  const widgetLayers = orderedWidgets(canvas)
  const widgets = widgetLayers.filter((layer) => !layer.hidden)
  const flowPreview = preview && widgetMode === 'auto'
  const selected = selection.filter((id) => layers.some((layer) => layer.id === id))
  const selectionLayers = layers.filter((layer) => selected.includes(layer.id))
  const editableLayers = selectionLayers.filter((layer) => !layer.locked)
  const movable = editableLayers.filter((layer) => !layer.hidden)
  const editableIds = editableLayers.map(({ id }) => id)
  const full = layers.length >= canvasLimit
  const primary = selectionLayers.length === 1 ? selectionLayers[0] : null
  const canGroup = editableIds.length > 1 && (
    new Set(editableLayers.map((layer) => layer.groupId)).size > 1 || !editableLayers[0].groupId
  )
  const canUngroup = editableLayers.some((layer) => layer.groupId)
  const commit = (next) => dispatch({ type: 'commit', next: () => next })
  const gesture = useCanvasGesture(commit)
  const busy = saving || Boolean(gesture.preview)

  function choose(id, multiple = false) {
    const layer = layers.find((item) => item.id === id)
    if (!layer) return []
    const linked = layers.filter((item) => item.id === id || (layer.groupId && layer.groupId === item.groupId))
      .map((item) => item.id)
    const next = multiple ? selected.includes(id)
      ? selected.filter((item) => !linked.includes(item))
      : [...new Set([...selected, ...linked])]
      : linked
    setSelection(next)
    return next
  }

  function update(id, patch) {
    commit(layers.map((layer) => {
      if (layer.id !== id) return layer
      const next = readCanvas({ layers: [{ ...layer, ...patch }] }).layers[0]
      if (!next) return layer
      next.groupId = layer.groupId
      return JSON.stringify(next) === JSON.stringify(layer) ? layer : next
    }))
  }

  function toggle(id, key) {
    const layer = layers.find((item) => item.id === id)
    if (layer) update(id, { [key]: !layer[key] })
  }

  function add(type, props, name = '') {
    if (full || preview || busy) return
    const layer = makeLayer(type, layers.length, props ?? (type === 'text'
      ? { text: t('canvasNewText', language), color: '#fffdf4' } : undefined))
    commit([...layers, { ...layer, name }])
    setSelection([layer.id])
    setAddingImage(false)
  }

  function addWidgets(type, id) {
    const added = type === 'layout' ? insertPreset(layers, id) : insertWidget(layers, id)
    setPlacementIssue(!added)
    if (!added) return
    commit([...layers, ...added])
    setSelection(added.map((layer) => layer.id))
  }

  function duplicate(ids = editableIds) {
    if (full || !ids.length) return
    const copies = duplicateLayers(layers, ids, () => crypto.randomUUID())
    commit([...layers, ...copies])
    setSelection(copies.map((layer) => layer.id))
  }

  function remove(ids = editableIds) {
    if (!ids.length) return
    commit(tidyGroups(layers.filter((layer) => !ids.includes(layer.id))))
    setSelection(selected.filter((id) => !ids.includes(id)))
  }

  function group(ungroup = false) {
    if (ungroup ? !canUngroup : !canGroup) return
    const groupId = ungroup ? null : crypto.randomUUID()
    commit(tidyGroups(layers.map((layer) =>
      editableIds.includes(layer.id) ? { ...layer, groupId } : layer)))
  }

  function replaceItems(items) {
    const byId = new Map(items.map((layer) => [layer.id, layer]))
    commit(layers.map((layer) => {
      const next = byId.get(layer.id)
      return next && (next.x !== layer.x || next.y !== layer.y) ? next : layer
    }))
  }

  function align(value) {
    if (!movable.length) return
    const [axis, edge] = value.split(':')
    replaceItems(alignLayers(movable, axis, Number(edge)))
  }

  function openMenu(event, id) {
    event.preventDefault()
    event.stopPropagation()
    if (busy) return
    if (!selected.includes(id)) choose(id)
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.type === 'keydown' ? rect.left : event.clientX
    const y = event.type === 'keydown' ? rect.bottom : event.clientY
    setContext({ id, x: Math.max(8, Math.min(x, window.innerWidth - 204)), y: Math.max(8, Math.min(y, window.innerHeight - 145)) })
  }

  useEffect(() => {
    if (!context) return
    const closeOutside = (event) => { if (!contextRef.current?.contains(event.target)) setContext(null) }
    window.addEventListener('pointerdown', closeOutside)
    return () => window.removeEventListener('pointerdown', closeOutside)
  }, [context])

  useEffect(() => {
    function keydown(event) {
      if (event.defaultPrevented || event.target instanceof Element && event.target.closest(editable)) return
      if (event.key === 'Escape') {
        if (!gesture.cancel()) {
          if (context) setContext(null)
          else if (preview) setPreview(false)
          else setSelection([])
        }
        return
      }
      if (preview || busy) return
      const key = event.key.toLowerCase()
      const modified = event.metaKey || event.ctrlKey
      if (modified && (key === 'z' || key === 'y')) {
        event.preventDefault()
        dispatch({ type: key === 'y' || event.shiftKey ? 'redo' : 'undo' })
      } else if (modified && (key === 'd' || key === 'g')) {
        event.preventDefault()
        if (key === 'd') duplicate()
        else group(event.shiftKey)
      } else if (key === 'delete' || key === 'backspace') {
        if (editableIds.length) event.preventDefault()
        remove()
      } else if (key.startsWith('arrow') && movable.length && !modified && !context) {
        event.preventDefault()
        const n = event.shiftKey ? 10 : 1
        const dx = key === 'arrowleft' ? -n : key === 'arrowright' ? n : 0
        const dy = key === 'arrowup' ? -n : key === 'arrowdown' ? n : 0
        replaceItems(moveLayers(movable, dx, dy).items)
      }
    }
    window.addEventListener('keydown', keydown)
    return () => window.removeEventListener('keydown', keydown)
  })

  const editor = preview || saving ? undefined : {
    planeRef: gesture.planeRef,
    selected, grid, guides: gesture.preview?.guides ?? {},
    onBlank(event) {
      if (event.button === 0 && event.target === event.currentTarget) {
        setSelection([])
        event.currentTarget.focus({ preventScroll: true })
      }
    },
    onLayer(event, id) {
      if (event.button !== 0 || busy) return
      event.stopPropagation()
      if (event.shiftKey) {
        choose(id, true)
        gesture.planeRef.current?.focus({ preventScroll: true })
        return
      }
      const next = selected.includes(id) ? selected : choose(id)
      if (layers.find((layer) => layer.id === id)?.locked) return
      gesture.begin(event, 'move', layers, next, grid)
    },
    onHandle(event, mode) {
      event.stopPropagation()
      gesture.begin(event, mode, layers, selected, grid)
    },
    onLostCapture: gesture.lostCapture, onMenu: openMenu,
  }

  async function apply() {
    if (busy) return
    setSaving(true)
    if (await onApply(theme.id, current?.overrides ?? theme.overrides ?? null, { canvas, draftPart: 'canvas' })) onApplied()
    else setSaving(false)
  }

  const display = { layers: gesture.preview?.layers ?? layers }
  const contextLayer = layers.find((layer) => layer.id === context?.id)
  const background = current ? current.background : design.background

  function moveWidget(index, direction) {
    const earlier = widgets[index].id
    const later = widgets[index + direction].id
    setWidgetOrder(widgetLayers.map(({ id }) => id === earlier ? later : id === later ? earlier : id))
  }

  function downloadLayout() {
    const payload = exportLayout({
      themeId: theme.id, presetId: theme.presetId, overrides: current?.overrides ?? theme.overrides, background,
      textLayers: current?.textLayers ?? design.textLayers, canvas, effects: design.effects,
    })
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2) + '\n'], { type: 'application/json' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'newtab-studio-' + theme.id.replace(':', '-') + '.layout.json'
    anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <>
      <div className="studio-heading">
        <div><h1>{t('visualEditor', language)}</h1><p>{localized(theme.names, language)}</p></div>
        <div className="canvas-heading-actions">
        <button className="secondary-button" type="button" disabled={busy} onClick={downloadLayout}>
          <Download size={16} aria-hidden="true" /> {t('exportLayout', language)}
        </button>
        <button className="primary-button" type="button" disabled={busy} onClick={apply}>
          <Check size={17} aria-hidden="true" /> {t(saving ? 'working' : 'applyCanvas', language)}
        </button>
        {draftStatus && <p className="studio-muted" role="status">{t(draftStatus, language)}</p>}
        </div>
      </div>
      {error && <p role="alert" className="error-message">{t(error, language)}</p>}
      <div className="canvas-workspace" data-preview={preview}>
        <section className="canvas-stage-panel studio-panel" aria-label={t('canvasArea', language)}>
          <div className="canvas-toolbar">
            {!preview && <div className="canvas-tools" role="group" aria-label={t('canvasTools', language)}>
              {Object.entries(typeIcons).map(([type, Icon]) => (
                <Tool key={type} icon={Icon} label={t('canvasAdd', language) + ' · ' + t('layer_' + type, language)}
                  disabled={full || busy} pressed={type === 'image' ? addingImage : undefined}
                  action={() => type === 'image' ? setAddingImage(!addingImage) : add(type)}>
                  <span>{t('layer_' + type, language)}</span>
                </Tool>
              ))}
              <Tool icon={LayoutTemplate} label={t('widgetPicker', language)} disabled={busy}
                pressed={addingWidgets} action={() => { setAddingWidgets(!addingWidgets); setPlacementIssue(false) }}>
                <span>{t('widgetPicker', language)}</span>
              </Tool>
            </div>}
            <div className="canvas-tools" role="group" aria-label={t('canvasViewTools', language)}>
              <Tool icon={Undo2} label={t('undoCanvas', language)} disabled={preview || busy || !history.past.length}
                action={() => dispatch({ type: 'undo' })} />
              <Tool icon={Redo2} label={t('redoCanvas', language)} disabled={preview || busy || !history.future.length}
                action={() => dispatch({ type: 'redo' })} />
              <Tool icon={Grid2X2} label={t('canvasGrid', language)} disabled={preview || busy} pressed={grid}
                action={() => setGrid(!grid)} />
              <Tool icon={preview ? EyeOff : Eye} label={t(preview ? 'endCanvasPreview' : 'previewCanvas', language)}
                pressed={preview} disabled={busy} action={() => { setPreview(!preview); setContext(null) }}>
                <span>{t(preview ? 'endCanvasPreview' : 'preview', language)}</span>
              </Tool>
            </div>
          </div>
          <fieldset className="widget-layout-options" disabled={busy || preview}>
            <label className="text-field">
              <span>{t('widgetLayoutMode', language)}</span>
              <select value={widgetMode} onChange={(event) => setWidgetMode(event.target.value)}>
                <option value="free">{t('widgetLayoutFree', language)}</option>
                <option value="auto">{t('widgetLayoutAuto', language)}</option>
              </select>
            </label>
            {widgetMode === 'auto' && <p className="studio-muted">{t('widgetLayoutHint', language)}</p>}
            {widgetMode === 'auto' && !preview && widgets.length > 0 &&
              <ol className="widget-layout-order" aria-label={t('widgetLayoutOrder', language)}>
                {widgets.map((layer, index) => {
                  const name = canvasLayerName(layer, language)
                  return <li key={layer.id}>
                    <span>{name}</span>
                    <Tool icon={ArrowUp} label={`${t('widgetMoveEarlier', language)} · ${name}`} disabled={index === 0}
                      action={() => moveWidget(index, -1)} />
                    <Tool icon={ArrowDown} label={`${t('widgetMoveLater', language)} · ${name}`} disabled={index === widgets.length - 1}
                      action={() => moveWidget(index, 1)} />
                  </li>
                })}
              </ol>}
          </fieldset>
          {addingImage && !preview && !full && !saving && <ImagePicker onAdd={(props, name) => add('image', props, name)} language={language} />}
          {addingWidgets && !preview && <WidgetPicker language={language} onInsert={addWidgets} disabled={busy} />}
          {addingWidgets && placementIssue && !preview && <p role="status" className="widget-placement-issue">{t('widgetNoSpace', language)}</p>}
          <ThemeScene theme={theme} overrides={current?.overrides} background={background}
            textLayers={current?.textLayers ?? design.textLayers} canvas={display} canvasEditor={editor}
            dockWidgets={flowPreview} language={language} className="canvas-workscene">
            <Clock language={language} />
          </ThemeScene>
          {flowPreview && <WidgetFlow layers={widgets} language={language} />}
          {!preview && <p className="studio-muted canvas-instructions">
            {t(full ? 'canvasLimit' : 'canvasInstructions', language)}
          </p>}
        </section>
        {!preview && <aside className="canvas-sidebar">
          <fieldset className="canvas-sidebar-tools studio-panel" disabled={busy}
            aria-label={t('canvasLayerActions', language)}>
            <div className="canvas-tools">
              <Tool icon={ArrowUp} label={t('bringForward', language)} disabled={!editableIds.length}
                action={() => commit(reorderLayers(layers, editableIds, 1))} />
              <Tool icon={ArrowDown} label={t('sendBackward', language)} disabled={!editableIds.length}
                action={() => commit(reorderLayers(layers, editableIds, -1))} />
              <Tool icon={Group} label={t('groupLayers', language)} disabled={!canGroup} action={() => group()} />
              <Tool icon={Ungroup} label={t('ungroupLayers', language)} disabled={!canUngroup} action={() => group(true)} />
              <Tool icon={Copy} label={t('duplicateLayer', language)} disabled={!editableIds.length || full} action={() => duplicate()} />
              <Tool icon={Trash2} label={t('deleteLayer', language)} disabled={!editableIds.length} action={() => remove()} />
            </div>
            <label className="canvas-align"><AlignCenter size={16} aria-hidden="true" />
              <select aria-label={t('alignLayers', language)} disabled={!movable.length} value=""
                onChange={(event) => align(event.target.value)}>
                <option value="">{t('alignLayers', language)}</option>
                {[['x:0', 'text_left'], ['x:0.5', 'text_center'], ['x:1', 'text_right'],
                  ['y:0', 'alignTop'], ['y:0.5', 'alignMiddle'], ['y:1', 'alignBottom']].map(([value, label]) =>
                  <option key={value} value={value}>{t(label, language)}</option>)}
              </select>
            </label>
          </fieldset>
          <LayerList layers={layers} selected={selected} language={language} select={choose}
            toggle={toggle} menu={openMenu} disabled={busy} />
          <CanvasInspector key={primary?.id} layer={primary} language={language}
            update={(patch) => update(primary.id, patch)} disabled={busy} />
        </aside>}
      </div>
      {contextLayer && !preview && <div className="canvas-menu" ref={contextRef} style={{ left: context.x, top: context.y }}
        role="group" aria-label={t('canvasLayerActions', language)}>
        {[
          [contextLayer.hidden ? 'showLayer' : 'hideLayer', () => toggle(context.id, 'hidden')],
          [contextLayer.locked ? 'unlockLayer' : 'lockLayer', () => toggle(context.id, 'locked')],
          ['duplicateLayer', () => duplicate([context.id]), contextLayer.locked || full],
          ['deleteLayer', () => remove([context.id]), contextLayer.locked],
        ].map(([label, action, disabled], index) => (
          <button key={label} type="button" autoFocus={index === 0} disabled={disabled}
            onClick={() => { action(); setContext(null) }}>{t(label, language)}</button>
        ))}
      </div>}
    </>
  )
}

export function VisualEditor(props) {
  const { theme, language } = props
  const [design, setDesign] = useState(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let alive = true
    readThemeDesign(theme.id, 'canvas').then((saved) => { if (alive) setDesign(saved) })
      .catch(() => { if (alive) setFailed(true) })
    return () => { alive = false }
  }, [theme.id])

  return (
    <main id="main" tabIndex={-1} className="background-studio visual-editor content-width">
      {design ? <CanvasWorkspace {...props} design={design} /> : <>
        <div className="studio-heading"><h1>{t('visualEditor', language)}</h1></div>
        <p role={failed ? 'alert' : 'status'} className={failed ? 'error-message' : 'studio-muted'}>
          {t(failed ? 'readError' : 'canvasLoading', language)}
        </p>
      </>}
    </main>
  )
}
