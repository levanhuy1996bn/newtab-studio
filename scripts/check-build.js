import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { bundledPictures, bundledUrl } from '../src/background.js'
import { textFonts } from '../src/typography.js'

const dist = new URL('../dist/', import.meta.url)
const readJson = async (path) => JSON.parse(await readFile(new URL(path, dist), 'utf8'))
const manifest = await readJson('manifest.json')
const pkg = await readJson('../package.json')

assert.equal(manifest.manifest_version, 3)
assert.equal(manifest.version, pkg.version)
assert.deepEqual(manifest.permissions, ['storage'])
assert.deepEqual(manifest.optional_permissions, ['history'])
assert.deepEqual(manifest.chrome_url_overrides, { newtab: 'index.html' })
assert.equal(manifest.host_permissions, undefined)
const html = await readFile(new URL(manifest.chrome_url_overrides.newtab, dist), 'utf8')
assert.match(html, /<script type="module"[^>]+src="\.\/assets\/[^"]+\.js"/)
assert.match(html, /<link rel="stylesheet"[^>]+href="\.\/assets\/[^"]+\.css"/)
for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  const path = match[1]
  assert.ok(path.startsWith('./'), 'Bundle references must be relative: ' + path)
  assert.ok((await readFile(new URL(path, dist))).length > 0)
}
for (const [size, path] of Object.entries(manifest.icons)) {
  const icon = await readFile(new URL(path, dist))
  assert.equal(icon.toString('ascii', 1, 4), 'PNG')
  assert.equal(icon.readUInt32BE(16), Number(size))
  assert.equal(icon.readUInt32BE(20), Number(size))
}
for (const size of ['16', '32']) {
  assert.equal(manifest.action.default_icon[size], manifest.icons[size])
}
assert.ok((await readFile(new URL(manifest.background.service_worker, dist))).length > 0)
for (const language of ['en', 'vi']) {
  const messages = await readJson('_locales/' + language + '/messages.json')
  assert.ok(messages.extensionDescription.message)
  assert.ok(messages.openStudio.message)
}
function verifyWebp(buffer, name) {
  assert.equal(buffer.toString('ascii', 0, 4), 'RIFF', name)
  assert.equal(buffer.toString('ascii', 8, 12), 'WEBP', name)
}
for (const asset of bundledPictures) {
  const picture = await readFile(new URL(bundledUrl(asset), dist))
  if (asset.file.endsWith('.webp')) verifyWebp(picture, asset.file)
  else assert.equal(picture.readUInt16BE(0), 0xffd8, asset.file + ' must be a JPEG')
  const thumbnail = await readFile(new URL(bundledUrl(asset, true), dist))
  verifyWebp(thumbnail, asset.file + ' thumbnail')
  assert.ok(thumbnail.length < picture.length, asset.file + ' thumbnail must be smaller than the wallpaper')
}
for (const { file } of Object.values(textFonts).filter((font) => font.file)) {
  const font = await readFile(new URL('fonts/' + file, dist))
  assert.equal(font.readUInt32BE(0), 0x10000, file + ' must be a TrueType font')
  const license = await readFile(new URL('fonts/' + file.replace('.ttf', '-OFL.txt'), dist), 'utf8')
  assert.match(license, /SIL OPEN FONT LICENSE Version 1\.1/)
}
for (const weight of ['regular', 'semibold']) {
  const font = await readFile(new URL('fonts/be-vietnam-pro-' + weight + '.ttf', dist))
  assert.equal(font.readUInt32BE(0), 0x10000)
}
assert.match(await readFile(new URL('fonts/be-vietnam-pro-OFL.txt', dist), 'utf8'), /SIL OPEN FONT LICENSE Version 1\.1/)
console.log('Verified MV3 manifest, new tab entry, icons, locale files, wallpapers, bundled fonts and licenses.')
