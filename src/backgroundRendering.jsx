import { useEffect, useState } from 'react'
import { bundledById, bundledUrl, imageStyle, pictureIds } from './background.js'
import { readPicture } from './studioRepository.js'

export function useBlobUrl(blob) {
  const [source, setSource] = useState(null)
  useEffect(() => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    setSource({ blob, url })
    return () => URL.revokeObjectURL(url)
  }, [blob])
  return source?.blob === blob ? source?.url : undefined
}

export function usePictureUrl(id, thumbnail = false) {
  const bundled = bundledById.get(id)
  const [local, setLocal] = useState(null)
  useEffect(() => {
    if (!id || bundled) return
    let cancelled = false
    let url
    readPicture(id).then((blob) => {
      if (!cancelled && blob) {
        url = URL.createObjectURL(blob)
        setLocal({ id, url })
      }
    }).catch(() => {
      // The preset artwork underneath remains visible if an image is unavailable.
    })
    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [id, bundled])

  if (bundled) return bundledUrl(bundled, thumbnail)
  return id && local?.id === id ? local.url : undefined
}

function PictureImage({ id, background, thumbnail }) {
  const url = usePictureUrl(id, thumbnail)
  const [failedUrl, setFailedUrl] = useState(null)

  if (!url || failedUrl === url) return null
  return (
    <div className="scene-background" data-image-fit={background.fit} aria-hidden="true">
      <img className="scene-picture" src={url} alt="" style={imageStyle(background)}
        loading={thumbnail ? 'lazy' : undefined}
        onError={() => setFailedUrl(url)} />
      <span className="scene-overlay" style={{
        backgroundColor: background.overlayColor, opacity: background.overlayOpacity / 100,
      }} />
    </div>
  )
}

function PictureBackdrop({ background, ids, still, paused }) {
  const [index, setIndex] = useState(0)
  const id = ids[index % ids.length]

  useEffect(() => {
    if (still || paused || ids.length < 2) return
    let timer
    const schedule = () => {
      window.clearInterval(timer)
      if (!document.hidden) {
        timer = window.setInterval(() => setIndex((current) => (current + 1) % ids.length), background.seconds * 1000)
      }
    }
    document.addEventListener('visibilitychange', schedule)
    schedule()
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', schedule)
    }
  }, [background.seconds, ids.length, still, paused])

  return <PictureImage key={id} id={id} background={background} thumbnail={still} />
}

export function SceneBackground({ background, still, paused }) {
  if (!background || background.type === 'preset') return null
  if (background.type === 'solid') {
    return <div className="scene-background" aria-hidden="true" style={{ backgroundColor: background.color }} />
  }
  if (background.type === 'gradient') {
    const fill = `linear-gradient(${background.angle}deg, ${background.start}, ${background.end})`
    return <div className="scene-background" aria-hidden="true" style={{ backgroundImage: fill }} />
  }
  const ids = pictureIds(background)
  if (!ids.length) return null
  return <PictureBackdrop key={ids.join(',')} background={background} ids={ids} still={still} paused={paused} />
}
