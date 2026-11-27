import { useThemeDraft } from './useThemeDraft.js'
import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, Check, Image, Layers, Palette, Square, X } from 'lucide-react'
import { AssetLibrary } from './AssetLibrary.jsx'
import { maxSlides, needsImage, pictureControls, pictureIds, readBackground } from './background.js'
import { t } from './i18n.js'
import { StudioColor as Color, StudioRange as Range } from './StudioFields.jsx'
import { Clock, ThemeScene } from './ThemeScene.jsx'
import { readThemeDesign } from './studioRepository.js'
import { localized, sceneColors } from './themeCatalog.js'

const modes = [
  ['preset', Layers, 'presetBackground'],
  ['solid', Square, 'solidBackground'],
  ['gradient', Palette, 'gradientBackground'],
  ['image', Image, 'imageBackground'],
  ['slideshow', Layers, 'slideshowBackground'],
]
const framing = ['positionX', 'positionY', 'zoom']
const adjustments = ['blur', 'brightness', 'contrast', 'saturation', 'opacity']

function BackgroundControls({ background, setBackground, language }) {
  const ids = pictureIds(background)
  const patch = (values) => setBackground((draft) => ({ ...draft, ...values }))
  const range = (key) => (
    <Range key={key} label={t(key, language)} value={background[key]} limit={pictureControls[key]}
      onChange={(value) => patch({ [key]: value })} />
  )
  const color = (key) => (
    <Color key={key} label={t(key, language)} value={background[key]}
      onChange={(value) => patch({ [key]: value })} />
  )

  function move(index, direction) {
    const next = [...ids]
    next[index] = ids[index + direction]
    next[index + direction] = ids[index]
    patch({ assetIds: next })
  }

  if (background.type === 'preset') return <p className="studio-muted">{t('presetHint', language)}</p>
  if (background.type === 'solid') return color('color')
  if (background.type === 'gradient') {
    return (
      <div className="studio-controls">
        {color('start')}
        {color('end')}
        <Range label={t('angle', language)} value={background.angle} limit={{ min: 0, max: 360, unit: '°' }}
          onChange={(angle) => patch({ angle })} />
      </div>
    )
  }
  return (
    <div className="studio-controls">
      {background.type === 'image' && ids.length > 0 && (
        <button type="button" className="text-button studio-clear" onClick={() => patch({ assetId: null })}>
          {t('clearImage', language)}
        </button>
      )}
      {background.type === 'slideshow' && (
        <>
          <Range label={t('slideInterval', language)} value={background.seconds} limit={{ min: 2, max: 120, unit: ' s' }}
            onChange={(seconds) => patch({ seconds })} />
          {ids.length > 0 && <ol className="slide-order" aria-label={t('slideOrder', language)}>
            {ids.map((id, index) => (
              <li key={id}>
                <span>{t('slide', language)} {index + 1}</span>
                <button type="button" className="icon-button" aria-label={t('moveUp', language) + ' ' + (index + 1)}
                  disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp size={15} aria-hidden="true" /></button>
                <button type="button" className="icon-button" aria-label={t('moveDown', language) + ' ' + (index + 1)}
                  disabled={index === ids.length - 1} onClick={() => move(index, 1)}><ArrowDown size={15} aria-hidden="true" /></button>
                <button type="button" className="icon-button" aria-label={t('removeSlide', language) + ' ' + (index + 1)}
                  onClick={() => patch({ assetIds: ids.filter((item) => item !== id) })}><X size={15} aria-hidden="true" /></button>
              </li>
            ))}
          </ol>}
        </>
      )}
      {ids.length === 0 && <p className="studio-muted">{t('selectImage', language)}</p>}
      {ids.length > 0 && (
        <>
          <label className="text-field">
            <span>{t('imageFit', language)}</span>
            <select value={background.fit} onChange={(event) => patch({ fit: event.target.value })}>
              <option value="cover">{t('imageFitCover', language)}</option>
              <option value="contain">{t('imageFitContain', language)}</option>
            </select>
          </label>
          {background.fit === 'cover' ? <>
            {framing.map(range)}
            <button type="button" className="text-button studio-clear" onClick={() => patch({ positionX: 50, positionY: 50, zoom: 100 })}>
              {t('imageCenter', language)}
            </button>
          </> : <p className="studio-muted">{t('imageFitContainHint', language)}</p>}
          <details className="studio-adjustments">
            <summary>{t('imageAdjustments', language)}</summary>
            <div className="studio-controls">
              {adjustments.map(range)}
              {color('overlayColor')}
              {range('overlayOpacity')}
            </div>
          </details>
        </>
      )}
    </div>
  )
}

export function BackgroundStudio({ theme, overrides, language, onApply, onApplied, error }) {
  const [draft, setDraft] = useState(null)
  const [textLayers, setTextLayers] = useState([])
  const [canvas, setCanvas] = useState(null)
  const [failedToRead, setFailedToRead] = useState(false)
  const [saving, setSaving] = useState(false)
  const draftStatus = useThemeDraft(theme.id, 'background', draft)
  const palette = sceneColors(theme, overrides)

  useEffect(() => {
    let alive = true
    readThemeDesign(theme.id, 'background').then((saved) => {
      if (alive) {
        setDraft(saved.background ?? { type: 'preset' })
        setTextLayers(saved.textLayers)
        setCanvas(saved.canvas)
      }
    }).catch(() => {
      if (alive) setFailedToRead(true)
    })
    return () => { alive = false }
  }, [theme.id])

  function setMode(type) {
    setDraft((current) => {
      if (current.type === type) return current
      const ids = pictureIds(current)
      return readBackground({ ...current, type, assetId: ids[0], assetIds: ids }, palette)
    })
  }

  function chooseImage(id) {
    setDraft((current) => {
      if (current.type === 'slideshow') {
        const kept = current.assetIds.filter((item) => item !== id)
        const assetIds = kept.length !== current.assetIds.length ? kept : [...kept, id].slice(0, maxSlides)
        return { ...current, assetIds }
      }
      const frame = current.assetId === id ? {} : { positionX: 50, positionY: 50, zoom: 100 }
      return readBackground({ ...current, ...frame, type: 'image', assetId: id }, palette)
    })
  }

  async function apply() {
    setSaving(true)
    if (await onApply(theme.id, overrides, { background: draft, draftPart: 'background' })) onApplied()
    else setSaving(false)
  }

  return (
    <main id="main" tabIndex={-1} className="background-studio content-width">
      <div className="studio-heading">
        <div>
          <h1>{t('studio', language)}</h1>
          <p>{localized(theme.names, language)}</p>
        </div>
        <button className="primary-button" type="button" disabled={!draft || saving || needsImage(draft)} onClick={apply}>
          <Check size={17} aria-hidden="true" /> {t(saving ? 'working' : 'applyBackground', language)}
        </button>
        {draftStatus && <p className="studio-muted" role="status">{t(draftStatus, language)}</p>}
      </div>
      {failedToRead && <p className="error-message" role="alert">{t('libraryError', language)}</p>}
      {!failedToRead && !draft && <p className="studio-muted" role="status">{t('libraryLoading', language)}</p>}
      {error && <p className="error-message" role="alert">{t(error, language)}</p>}
      {draft && <div className="studio-workspace">
        <ThemeScene theme={theme} overrides={overrides} background={draft} textLayers={textLayers} canvas={canvas}
          language={language} className="studio-scene">
          <Clock language={language} />
        </ThemeScene>
        <fieldset className="studio-panel studio-settings" disabled={saving} aria-label={t('backgroundType', language)}>
          <h2>{t('backgroundType', language)}</h2>
          <div className="background-modes" role="group" aria-label={t('backgroundType', language)}>
            {modes.map(([mode, Icon, label]) => (
              <button type="button" key={mode} aria-pressed={draft.type === mode} onClick={() => setMode(mode)}>
                <Icon size={17} aria-hidden="true" /> {t(label, language)}
              </button>
            ))}
          </div>
          <BackgroundControls background={draft} setBackground={setDraft} language={language} />
        </fieldset>
        <AssetLibrary background={draft} onSelect={chooseImage} disabled={saving} language={language} />
      </div>}
    </main>
  )
}
