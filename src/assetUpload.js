import { imageTypes, maxImageBytes, maxImagePixels } from './background.js'
import { savePicture, StudioError } from './studioRepository.js'

function detectedImage(data) {
  if (data.length < 16) return null
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength)
  const nameAt = (offset) => String.fromCharCode(...data.subarray(offset, offset + 4))

  if (data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) return 'image/jpeg'

  if (view.getUint32(0) === 0x89504e47 && view.getUint32(4) === 0x0d0a1a0a) {
    for (let offset = 8; offset + 12 <= data.length; offset += view.getUint32(offset) + 12) {
      const chunk = nameAt(offset + 4)
      if (chunk === 'acTL') return null
      if (chunk === 'IDAT') return 'image/png'
    }
  }

  if (nameAt(0) === 'RIFF' && nameAt(8) === 'WEBP') {
    const animated = nameAt(12) === 'VP8X' && (data[20] & 0x02)
    return animated ? null : 'image/webp'
  }
  return null
}

async function makeThumbnail(bitmap) {
  const scale = Math.min(1, 320 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return new Promise((resolve, reject) => canvas.toBlob(
    (blob) => blob ? resolve(blob) : reject(new StudioError('uploadError')), 'image/webp', 0.82,
  ))
}

export async function preparePicture(file) {
  if (!file.size) throw new StudioError('invalidImage')
  if (file.size > maxImageBytes) throw new StudioError('imageTooLarge')
  if (file.type && !imageTypes.includes(file.type)) throw new StudioError('invalidImage')

  const mime = detectedImage(new Uint8Array(await file.arrayBuffer()))
  if (!mime || (file.type && mime !== file.type)) throw new StudioError('invalidImage')
  const original = file.slice(0, file.size, mime)
  const bitmap = await createImageBitmap(original).catch(() => { throw new StudioError('invalidImage') })
  try {
    if (bitmap.width * bitmap.height > maxImagePixels) throw new StudioError('imageTooLarge')
    const thumbnail = await makeThumbnail(bitmap)
    const metadata = {
      name: file.name, kind: 'upload', mime, bytes: file.size,
      width: bitmap.width, height: bitmap.height, createdAt: Date.now(),
    }
    return { ...metadata, blob: original, thumbnail }
  } finally {
    bitmap.close()
  }
}

export async function uploadPicture(file) {
  const { blob, thumbnail, ...metadata } = await preparePicture(file)
  const id = 'asset:' + crypto.randomUUID()
  await savePicture({ ...metadata, id }, blob, thumbnail)
  return id
}
