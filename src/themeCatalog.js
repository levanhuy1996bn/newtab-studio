import { readBackground } from './background.js'
import { animeWallpapers } from './animeWallpapers.js'

export const categories = {
  nature: ['Nature', 'Thiên nhiên'],
  anime: ['Anime', 'Anime'],
  nostalgia: ['Nostalgia', 'Hoài niệm'],
  sky: ['Sky', 'Bầu trời'],
  minimal: ['Minimal', 'Tối giản'],
  retro: ['Retro', 'Hoài cổ'],
  abstract: ['Abstract', 'Trừu tượng'],
  night: ['Night', 'Đêm'],
}

const groups = {
  nature: [
    ['forest-hour', 'Forest Hour', 'Giờ trong rừng', 'hills', '112f2d 52786c eed2a0'],
    ['dune-walk', 'Dune Walk', 'Dạo trên cồn cát', 'dunes', '704c4b d89978 f9d7a1'],
    ['pacific-tide', 'Pacific Tide', 'Thủy triều Thái Bình Dương', 'waves', '153848 438d94 a9dace'],
    ['alpine-air', 'Alpine Air', 'Gió núi cao', 'peaks', '273b51 7ba2ad d6e9e6'],
    ['moss-valley', 'Moss Valley', 'Thung lũng rêu', 'hills', '24382e 778756 e3d39a'],
    ['clay-coast', 'Clay Coast', 'Bờ biển đất nung', 'dunes', '523235 a9615a f5b781'],
  ],
  anime: [
    ['lanterns-after-rain', 'Lanterns After Rain', 'Đèn làng sau mưa', 'hills', '122533 385662 f0b887'],
    ['cedar-path', 'Cedar Path', 'Lối mòn rừng tuyết tùng', 'hills', '182c26 3b5740 dcbf77'],
    ['summit-of-clouds', 'Summit of Clouds', 'Đỉnh núi trên biển mây', 'peaks', '142a3f 536c81 e9ae86'],
    ['coastal-train', 'Coastal Train', 'Chuyến tàu ven biển', 'waves', '222640 4f5479 e8a6a5'],
    ...animeWallpapers.map(([id, en, vi, colors]) => [id, en, vi, 'hills', colors]),
  ],
  nostalgia: [
    ['village-after-rain', 'Village After Rain', 'Ngõ làng sau mưa', 'paper', '23353c 53625c d8a377'],
    ['evening-ferry', 'Evening Ferry', 'Bến đò chiều muộn', 'waves', '232e3d 5c6d6d caa88f'],
  ],
  sky: [
    ['lavender-dusk', 'Lavender Dusk', 'Chạng vạng oải hương', 'orbit', '382f60 957cad f4bed7'],
    ['peach-sunrise', 'Peach Sunrise', 'Bình minh màu đào', 'hills', '744763 cb818e ffcb9b'],
    ['blue-meridian', 'Blue Meridian', 'Kinh tuyến xanh', 'waves', '23385b 6380b3 c6d9f3'],
    ['after-the-rain', 'After the Rain', 'Sau cơn mưa', 'peaks', '2e4950 6e9791 f6debb'],
    ['high-clouds', 'High Clouds', 'Mây tầng cao', 'paper', '4c6484 9dbbc9 f6e6cf'],
    ['summer-eclipse', 'Summer Eclipse', 'Nhật thực mùa hè', 'orbit', '623b64 cb746f f6cf91'],
    ['blue-marble', 'Blue Marble', 'Trái Đất xanh', 'orbit', '171e2d 425977 9fd4d3'],
    ['martian-dunes', 'Martian Dunes', 'Cồn cát sao Hỏa', 'dunes', '383136 7f695b c5a283'],
    ['cosmic-cliffs', 'Cosmic Cliffs', 'Vách đá vũ trụ', 'peaks', '192638 576879 e4a465'],
  ],
  minimal: [
    ['quiet-linen', 'Quiet Linen', 'Vải lanh tĩnh lặng', 'paper', 'c5b69f e8ddc4 605847'],
    ['ink-and-paper', 'Ink & Paper', 'Mực và giấy', 'grid', 'e7e1d5 f7f0e3 3e413e'],
    ['soft-sage', 'Soft Sage', 'Xanh xô thơm', 'paper', 'a4b4a2 d4dfc8 364f42'],
    ['ceramic', 'Ceramic', 'Gốm mộc', 'dunes', 'd0a58d f0d1bd 613f39'],
    ['blueprint', 'Blueprint', 'Bản thiết kế', 'grid', '1d3548 36556b 98b5c6'],
    ['daylight', 'Daylight', 'Ánh ngày', 'rings', 'bfb3ab e4d8cc 6c5554'],
  ],
  retro: [
    ['film-club', 'Film Club', 'Câu lạc bộ phim', 'stripes', '6a4235 c18656 f5d38a'],
    ['radio-days', 'Radio Days', 'Thời của radio', 'rings', '672e3e c86259 f3b668'],
    ['postcard', 'Postcard', 'Bưu thiếp', 'grid', '5f775b 92ad76 f4dd9e'],
    ['soda-shop', 'Soda Shop', 'Tiệm soda', 'stripes', '733e68 bd7890 f9bdad'],
    ['golden-vinyl', 'Golden Vinyl', 'Đĩa than vàng', 'rings', '34372e 7f7851 eeaa59'],
    ['desert-motel', 'Desert Motel', 'Nhà nghỉ sa mạc', 'dunes', '5b3f52 bc777b f5b88e'],
  ],
  abstract: [
    ['color-current', 'Color Current', 'Dòng chảy màu sắc', 'waves', '473477 8f69a9 f7ab95'],
    ['glass-garden', 'Glass Garden', 'Vườn kính', 'paper', '325269 5eaa99 d2e899'],
    ['spectrum', 'Spectrum', 'Quang phổ', 'stripes', '3b3c8b 8568b1 f6b4dd'],
    ['soft-orbit', 'Soft Orbit', 'Quỹ đạo êm', 'orbit', '6b3e59 b87d85 f3cfbc'],
    ['folded-light', 'Folded Light', 'Nếp gấp ánh sáng', 'peaks', '424677 7f9ed1 e5e7fa'],
    ['isobar', 'Isobar', 'Đường đẳng áp', 'rings', '21414b 487775 e1ce96'],
  ],
  night: [
    ['midnight-orbit', 'Midnight Orbit', 'Quỹ đạo nửa đêm', 'orbit', '17192f 383a6a cad1ff'],
    ['moonlit-water', 'Moonlit Water', 'Mặt nước ánh trăng', 'waves', '112332 294c63 acc4e2'],
    ['northern-lights', 'Northern Lights', 'Cực quang', 'paper', '142c38 34766d a0e0be'],
    ['city-grid', 'City Grid', 'Ô phố về đêm', 'grid', '231e35 56436b f8b8a5'],
    ['dark-matter', 'Dark Matter', 'Vật chất tối', 'rings', '231a2a 4f354f e1aed4'],
    ['late-train', 'Late Train', 'Chuyến tàu muộn', 'stripes', '24273e 4c5371 edc58b'],
  ],
}

const photoPresets = {
  ...Object.fromEntries(animeWallpapers.map(([id, , , , positionX, tags]) => [id, [id, positionX, tags]])),
  'forest-hour': ['forest-road', 79],
  'alpine-air': ['summit-view', 85],
  'cedar-path': ['cedar-path', 75, ['nature']],
  'summit-of-clouds': ['summit-of-clouds', 84, ['nature', 'sky']],
  'coastal-train': ['coastal-train', 89, ['nature']],
  'lanterns-after-rain': ['lanterns-after-rain', 71, ['nostalgia']],
  'village-after-rain': ['village-after-rain', 51, ['anime']],
  'evening-ferry': ['evening-ferry', 82],
  'blue-marble': ['blue-marble', 50],
  'martian-dunes': ['mars-dunes', 50],
  'cosmic-cliffs': ['cosmic-cliffs', 55],
}

// Keep retired IDs readable for themes and schedules saved by earlier versions.
const retiredIds = new Set([
  'lavender-dusk', 'peach-sunrise', 'blue-meridian', 'after-the-rain', 'high-clouds', 'summer-eclipse',
  'quiet-linen', 'ink-and-paper', 'soft-sage', 'ceramic', 'blueprint', 'daylight',
  'soda-shop', 'golden-vinyl', 'desert-motel',
  'color-current', 'glass-garden', 'spectrum', 'soft-orbit', 'folded-light', 'isobar',
  'midnight-orbit', 'moonlit-water', 'northern-lights', 'city-grid', 'dark-matter', 'late-train',
  'dune-walk', 'pacific-tide', 'moss-valley', 'clay-coast',
  'film-club', 'radio-days', 'postcard',
])

const catalog = Object.entries(groups).flatMap(([category, records]) =>
  records.map(([id, en, vi, motif, colors]) => {
    const photo = photoPresets[id]
    return {
      id, names: [en, vi], category, motif, colors: colors.split(' ').map((color) => '#' + color),
      tags: photo?.[2] ?? [],
      wallpaper: photo ? readBackground({ type: 'image', assetId: 'bundled:' + photo[0], positionX: photo[1] }) : null,
    }
  }),
).sort((a, b) => Number(Boolean(b.wallpaper)) - Number(Boolean(a.wallpaper)))
export const themesById = new Map(catalog.map((theme) => [theme.id, theme]))
export const themes = catalog.filter((theme) => !retiredIds.has(theme.id))
export const galleryCategories = Object.entries(categories).filter(([id]) =>
  themes.some(({ category, tags }) => category === id || tags.includes(id)))
export const defaultThemeId = 'forest-hour'
export const localized = (pair, language) => pair[language === 'vi' ? 1 : 0]

function normalizeSearch(text) {
  return text.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/đ/g, 'd')
}

export function filterThemes({ query = '', category = 'all', favorites, favoritesOnly }) {
  const terms = normalizeSearch(query).trim().split(/\s+/).filter(Boolean)
  return themes.filter((theme) => {
    const groups = [theme.category, ...theme.tags]
    const haystack = normalizeSearch([...theme.names, ...groups.flatMap((key) => categories[key])].join(' '))
    return (category === 'all' || groups.includes(category))
      && (!favoritesOnly || favorites.has(theme.id))
      && terms.every((term) => haystack.includes(term))
  })
}

export function sceneColors(theme, overrides) {
  return overrides ? [overrides.base, theme.colors[1], overrides.accent] : theme.colors
}
