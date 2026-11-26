import { useEffect, useRef, useState } from 'react'
import { Check, ImagePlus, Trash2, X } from 'lucide-react'
import { uploadPicture } from './assetUpload.js'
import { bundledPictures, bundledUrl, imageTypes, maxSlides, pictureIds } from './background.js'
import { useBlobUrl } from './backgroundRendering.jsx'
import { t } from './i18n.js'
import { deletePicture, listPictures, StudioError, watchStudio } from './studioRepository.js'
import { localized } from './themeCatalog.js'

function AssetCard({ picture, selected, order, onSelect, onDelete, language, disabled }) {
  const thumbnail = useBlobUrl(picture.thumbnail)
  const name = picture.names ? localized(picture.names, language) : picture.name
  const src = picture.file ? bundledUrl(picture, true) : thumbnail
  return (
    <article className="asset-card">
      <button className="asset-select" type="button" aria-pressed={selected} onClick={onSelect} disabled={disabled}>
        <span className="asset-image">
          {src && <img src={src} alt="" loading="lazy" />}
          {selected && (order
            ? <span className="asset-order">{order}</span>
            : <Check className="asset-check" size={24} aria-hidden="true" />)}
        </span>
        <span className="asset-name" title={name}>{name}</span>
      </button>
      {onDelete && (
        <button className="icon-button asset-delete" type="button" disabled={selected || disabled}
          title={t(selected ? 'removeSelectionFirst' : 'deleteImage', language)}
          aria-label={t('deleteImage', language) + ' · ' + name} onClick={onDelete}>
          <Trash2 size={15} aria-hidden="true" />
        </button>
      )}
    </article>
  )
}

export function AssetLibrary({ background, onSelect, language, disabled }) {
  const fileInput = useRef(null)
  const operation = useRef(false)
  const [tab, setTab] = useState('bundled')
  const [library, setLibrary] = useState(null)
  const [problem, setProblem] = useState(null)
  const [busy, setBusy] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)
  const ids = pictureIds(background)
  const selected = new Set(ids)
  const records = tab === 'bundled' ? bundledPictures : library
  const selectionFull = background.type === 'slideshow' && ids.length >= maxSlides

  useEffect(() => {
    let alive = true
    let generation = 0
    async function refresh() {
      const request = ++generation
      try {
        const list = await listPictures()
        if (!alive || request !== generation) return
        setLibrary((current) => {
          const byId = new Map(current?.map((picture) => [picture.id, picture]))
          return list.map((picture) => byId.get(picture.id) ?? picture)
        })
      } catch {
        if (alive && request === generation) setProblem('libraryError')
      }
    }
    const unsubscribe = watchStudio((kind) => {
      if (kind === 'assets') void refresh()
    })
    void refresh()
    return () => {
      alive = false
      unsubscribe()
    }
  }, [])

  async function run(task, fallback) {
    if (operation.current || disabled) return
    operation.current = true
    setBusy(true)
    setProblem(null)
    try {
      await task()
    } catch (error) {
      setProblem(error instanceof StudioError ? error.code
        : error?.name === 'QuotaExceededError' ? 'quotaError' : fallback)
    } finally {
      operation.current = false
      setBusy(false)
    }
  }

  function upload(file) {
    if (!file) return
    void run(async () => {
      const id = await uploadPicture(file)
      setTab('uploads')
      if (!selectionFull) onSelect(id)
    }, 'uploadError')
  }

  async function remove() {
    const id = pendingDelete.id
    setPendingDelete(null)
    await run(() => deletePicture(id), 'deleteError')
  }

  return (
    <section className="studio-panel asset-library" aria-labelledby="asset-library-title">
      <div className="asset-library-heading">
        <h2 id="asset-library-title">{t('assetLibrary', language)}</h2>
        <div className="asset-tabs" role="group" aria-label={t('assetLibrary', language)}>
          {['bundled', 'uploads'].map((key) => (
            <button key={key} className="chip" type="button" aria-pressed={tab === key}
              onClick={() => { setTab(key); setProblem(null); setPendingDelete(null) }}>
              {t(key, language)}
            </button>
          ))}
        </div>
      </div>
      <div className="upload-zone" data-dragging={dragging}
        onDragOver={(event) => { event.preventDefault(); setDragging(true) }}
        onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false) }}
        onDrop={(event) => { event.preventDefault(); setDragging(false); upload(event.dataTransfer.files[0]) }}>
        <input className="sr-only" ref={fileInput} type="file" tabIndex={-1} accept={imageTypes.join(',')}
          aria-label={t('uploadImage', language)} disabled={busy || disabled}
          onChange={(event) => { const [file] = event.target.files; event.target.value = ''; upload(file) }} />
        <button className="secondary-button" type="button" disabled={busy || disabled}
          onClick={() => fileInput.current.click()}>
          <ImagePlus size={17} aria-hidden="true" /> {t(busy ? 'working' : 'uploadImage', language)}
        </button>
        <span>{t('uploadHint', language)}</span>
      </div>
      {problem && <p className="error-message" role="alert">{t(problem, language)}</p>}
      {selectionFull && <p className="studio-muted" role="status">{t('slideLimit', language)}</p>}
      {pendingDelete && (
        <div className="delete-confirm">
          <span>{t('confirmDelete', language)} <strong>{pendingDelete.name}</strong></span>
          <button type="button" className="danger-button" onClick={remove}>{t('deleteImage', language)}</button>
          <button type="button" className="icon-button" aria-label={t('cancel', language)}
            onClick={() => setPendingDelete(null)}><X size={18} aria-hidden="true" /></button>
        </div>
      )}
      {records?.length > 0 ? (
        <div className="asset-grid">
          {records.map((picture) => (
            <AssetCard key={picture.id} picture={picture} selected={selected.has(picture.id)} language={language}
              order={background.type === 'slideshow' ? ids.indexOf(picture.id) + 1 : 0}
              disabled={busy || disabled || (selectionFull && !selected.has(picture.id))}
              onSelect={() => { setProblem(null); setPendingDelete(null); onSelect(picture.id) }}
              onDelete={!picture.file && (() => { setProblem(null); setPendingDelete(picture) })} />
          ))}
        </div>
      ) : tab === 'uploads' && (
        <p className="studio-muted">{t(records || problem ? 'emptyUploads' : 'libraryLoading', language)}</p>
      )}
      {tab === 'bundled' && (
        <details className="asset-credits">
          <summary>{t('imageCredits', language)}</summary>
          <ul>{bundledPictures.map(({ id, names, credit }) => (
            <li key={id}>{localized(names, language)} · {credit}</li>
          ))}</ul>
        </details>
      )}
    </section>
  )
}
