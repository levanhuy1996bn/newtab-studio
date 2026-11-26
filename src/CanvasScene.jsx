import { Move, RotateCw } from 'lucide-react'
import { usePictureUrl } from './backgroundRendering.jsx'
import { bounds } from './canvasGeometry.js'
import { canvasSize } from './canvasModel.js'
import { t } from './i18n.js'
import { textFonts } from './typography.js'
import { Widget } from './Widgets.jsx'

function CanvasImage({ id, name }) {
  const url = usePictureUrl(id)
  return url ? <img src={url} alt={name} draggable={false} /> : null
}

function artwork(layer, language, live) {
  const { type, props, name } = layer
  if (type === 'image') return <CanvasImage id={props.assetId} name={name} />
  if (type === 'widget') return <Widget layer={layer} language={language} live={live} />
  if (type === 'sticker') return <span className="canvas-symbol" aria-hidden="true">{props.symbol}</span>
  if (type === 'text') return <span className="canvas-lettering" style={{
    fontFamily: textFonts[props.font].stack, fontSize: props.size / 12 + 'cqw',
  }}>{props.text}</span>
  return <div className="canvas-shape" data-shape={type} style={{ '--frame-width': (props.stroke ?? 0) / 12 + 'cqw' }} aria-hidden="true" />
}

function boxStyle(box) {
  return {
    left: box.x / canvasSize.width * 100 + '%',
    top: box.y / canvasSize.height * 100 + '%',
    width: box.width / canvasSize.width * 100 + '%',
    height: box.height / canvasSize.height * 100 + '%',
    rotate: (box.rotation ?? 0) + 'deg',
  }
}

export function SceneCanvas({ canvas, editor, language, liveWidgets = false, dockWidgets = false }) {
  const layers = (canvas?.layers ?? []).filter((layer) => !dockWidgets || layer.type !== 'widget')
  if (!editor && !layers.some((layer) => !layer.hidden)) return null
  const selected = editor ? layers.filter((layer) => editor.selected.includes(layer.id) && !layer.hidden && !layer.locked) : []
  const selection = selected.length === 1 ? selected[0] : selected.length > 1 ? bounds(selected) : null

  return (
    <div className="canvas-overlay" data-editing={Boolean(editor)} data-widget-editing={editor?.widgetsOnly || undefined}>
      <div className="canvas-plane" ref={editor?.planeRef} tabIndex={editor ? 0 : undefined}
        aria-label={editor ? t('canvasArea', language) : undefined}
        data-grid={editor?.grid || undefined}
        onPointerDown={editor?.onBlank} onLostPointerCapture={editor?.onLostCapture} onKeyDown={editor?.onKeyDown}>
        {layers.filter((layer) => !layer.hidden).map((layer) => (
          <div className="canvas-artwork" key={layer.id} data-layer-id={layer.id} data-layer-type={layer.type}
            data-locked={editor && layer.locked || undefined}
            data-widget-live={liveWidgets && layer.type === 'widget' || undefined}
            style={{
              ...boxStyle(layer), opacity: layer.opacity / 100, color: layer.props.color,
              '--sticker-size': Math.min(layer.width, layer.height) * 0.78 / 12 + 'cqw',
            }}
            onPointerDown={editor && ((event) => editor.onLayer(event, layer.id))}
            onContextMenu={editor && ((event) => editor.onMenu(event, layer.id))}>
            {artwork(layer, language, liveWidgets)}
            {editor?.widgetsOnly && layer.type === 'widget' && !layer.locked &&
              <span className="canvas-widget-grip" aria-hidden="true"><Move size={14} /></span>}
          </div>
        ))}
        {editor?.guides.x !== undefined && <span className="canvas-guide vertical" aria-hidden="true"
          style={{ left: editor.guides.x / canvasSize.width * 100 + '%' }} />}
        {editor?.guides.y !== undefined && <span className="canvas-guide horizontal" aria-hidden="true"
          style={{ top: editor.guides.y / canvasSize.height * 100 + '%' }} />}
        {selection && <div className="canvas-selection" style={boxStyle(selection)}>
          {!editor.widgetsOnly && <><button type="button" className="canvas-rotate" aria-label={t('rotateHandle', language)}
            title={t('rotateHandle', language)} onPointerDown={(event) => editor.onHandle(event, 'rotate')}>
            <RotateCw size={12} aria-hidden="true" />
          </button>
          <button type="button" className="canvas-resize" aria-label={t('resizeHandle', language)}
            title={t('resizeHandle', language)} onPointerDown={(event) => editor.onHandle(event, 'resize')} /></>}
        </div>}
      </div>
    </div>
  )
}
