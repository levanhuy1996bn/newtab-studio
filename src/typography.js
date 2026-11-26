export const maxTextLayers = 8
export const maxTextLength = 1200

export const textFonts = {
  serif: { name: 'Lora', stack: '"NTS Lora", Georgia, "Times New Roman", serif', file: 'lora.ttf' },
  sans: { name: 'Noto Sans', stack: '"NTS Noto Sans", system-ui, sans-serif', file: 'noto-sans.ttf' },
  mono: { name: 'Monospace', stack: 'ui-monospace, "SF Mono", Consolas, "NTS Noto Sans", monospace' },
}

export const textRanges = {
  size: { min: 12, max: 84, value: 30, unit: 'px' },
  weight: { min: 400, max: 700, step: 100, value: 500 },
  lineHeight: { min: 100, max: 220, value: 135, unit: '%' },
  spacing: { min: -2, max: 10, value: 0, unit: 'px' },
  opacity: { min: 0, max: 100, value: 100, unit: '%' },
  rotation: { min: -30, max: 30, value: 0, unit: '°' },
}

export const textDefaults = {
  font: 'serif',
  color: '#fffdf4',
  alignment: 'center',
  placement: 'below',
  shadow: true,
  ...Object.fromEntries(Object.entries(textRanges).map(([key, range]) => [key, range.value])),
}

export const textPresets = {
  greeting: { font: 'sans', size: 38, weight: 700, spacing: -1 },
  poem: { font: 'serif', size: 26, weight: 400, lineHeight: 165 },
  quote: { font: 'serif', size: 30, weight: 500, lineHeight: 145 },
}

const entries = [
  ['morning-light', 'greeting', 'Morning light', 'Nắng sớm', 'Good morning, a fresh page awaits.', 'Chào buổi sáng, một trang mới đang chờ.'],
  ['welcome-home', 'greeting', 'Welcome back', 'Chào bạn trở lại', 'Welcome back. Take a breath.', 'Chào bạn trở lại. Hít một hơi thật sâu.'],
  ['quiet-evening', 'greeting', 'Quiet evening', 'Tối bình yên', 'May your evening be soft and slow.', 'Chúc bạn một buổi tối dịu dàng, thong thả.'],
  ['window', 'poem', 'By the window', 'Bên ô cửa', 'Sun slips across the sill,\nA leaf leans into light.\nThe room is small and still,\nThe world is clear and bright.', 'Nắng qua ô cửa nhỏ,\nMột chiếc lá nghiêng mình.\nCăn phòng im tiếng gió,\nNgày chợt hóa trong xanh.'],
  ['little-river', 'poem', 'A little river', 'Con sông nhỏ', 'The little river bends,\nCarrying a piece of sky.\nI follow it with my eyes,\nAnd let the afternoon go by.', 'Con sông nhỏ quanh co,\nMang theo một mảnh trời.\nTôi dõi theo dòng nước,\nĐể chiều trôi nhẹ thôi.'],
  ['tea', 'poem', 'Steam from tea', 'Khói trà', 'A small cup in both hands.\nSteam draws a line of light.\nThe day has room to breathe.', 'Hai tay ôm chén nhỏ.\nKhói vẽ một đường nắng.\nNgày có chỗ để thở.'],
  ['small-steps', 'quote', 'Small steps', 'Bước nhỏ', 'A small step is still a step toward something.', 'Một bước nhỏ vẫn là một bước tiến.'],
  ['attention', 'quote', 'Attention', 'Sự chú tâm', 'Give one thing your full attention and see how it changes.', 'Thử dành trọn sự chú tâm cho một việc và xem điều gì đổi khác.'],
  ['room', 'quote', 'Room for rest', 'Chỗ để nghỉ', 'Leave a little room in the day for doing nothing.', 'Hãy chừa một khoảng nhỏ trong ngày để nghỉ ngơi.'],
  ['begin-again', 'quote', 'Begin again', 'Bắt đầu lại', 'You can begin again before the day is over.', 'Bạn có thể bắt đầu lại ngay trong hôm nay.'],
  ['slow-work', 'quote', 'Time to grow', 'Thời gian để lớn', 'Some things grow better when you give them time.', 'Có những điều lớn lên tốt hơn khi được cho thời gian.'],
  ['curiosity', 'quote', 'Curiosity', 'Tò mò', 'A good question can make an ordinary day interesting.', 'Một câu hỏi hay có thể làm ngày bình thường trở nên thú vị.'],
  ['make-space', 'quote', 'Make space', 'Dành chỗ', 'Make space for whatever you hope to keep.', 'Hãy dành chỗ cho những điều bạn muốn giữ lại.'],
  ['choose-one', 'quote', 'Choose one thing', 'Chọn một việc', 'Choose one thing you can finish, then give it a start.', 'Chọn một việc bạn có thể hoàn thành, rồi bắt đầu làm.'],
]

export const textEntries = entries.map(([id, kind, en, vi, enText, viText]) => ({
  id, kind, titles: [en, vi], texts: [enText, viText],
  author: 'NewTab Studio', source: 'original',
}))
const entriesById = new Map(textEntries.map((entry) => [entry.id, entry]))
const quotes = textEntries.filter((entry) => entry.kind === 'quote')

export function localDay(date) {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000)
}

export function dailyQuote(day) {
  return quotes[((day % quotes.length) + quotes.length) % quotes.length]
}

export function randomQuote(excludedId, random = Math.random) {
  const choices = quotes.filter((entry) => entry.id !== excludedId)
  return choices[Math.floor(random() * choices.length)]
}

export function layerText(layer, language, day) {
  if (layer.mode !== 'daily') return layer.text
  return dailyQuote(day).texts[language === 'vi' ? 1 : 0]
}

export function newTextLayer({ entry, language, daily = false } = {}) {
  return {
    id: crypto.randomUUID(),
    type: 'text',
    mode: daily ? 'daily' : 'fixed',
    text: entry?.texts[language === 'vi' ? 1 : 0] ?? '',
    entryId: entry?.id ?? null,
    ...textDefaults,
    ...textPresets[daily ? 'quote' : entry?.kind],
  }
}

export function readTextLayers(value) {
  if (!Array.isArray(value)) return []
  const seen = new Set()
  const layers = []
  for (const item of value) {
    if (item?.type !== 'text' || typeof item.id !== 'string' || !/^[\w-]{1,64}$/.test(item.id) || seen.has(item.id)) continue
    const mode = item.mode === 'daily' ? 'daily' : 'fixed'
    const text = mode === 'fixed' && typeof item.text === 'string'
      ? item.text.replace(/\r\n?/g, '\n').slice(0, maxTextLength)
      : ''
    if (mode === 'fixed' && !text.trim()) continue
    const settings = Object.fromEntries(Object.entries(textRanges).map(([key, { min, max, step = 1, value }]) => {
      const input = Number.isFinite(item[key]) ? Math.round((item[key] - min) / step) * step + min : value
      return [key, Math.max(min, Math.min(max, input))]
    }))
    layers.push({
      id: item.id, type: 'text', mode, text,
      entryId: mode === 'fixed' && entriesById.has(item.entryId) ? item.entryId : null,
      font: Object.hasOwn(textFonts, item.font) ? item.font : textDefaults.font,
      color: typeof item.color === 'string' && /^#[0-9a-f]{6}$/i.test(item.color) ? item.color.toLowerCase() : textDefaults.color,
      alignment: ['left', 'center', 'right'].includes(item.alignment) ? item.alignment : textDefaults.alignment,
      placement: item.placement === 'above' ? 'above' : 'below',
      shadow: typeof item.shadow === 'boolean' ? item.shadow : textDefaults.shadow,
      ...settings,
    })
    seen.add(item.id)
    if (layers.length === maxTextLayers) break
  }
  return layers
}
