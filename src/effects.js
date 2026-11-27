import { defaultThemeId, isThemeId } from './themeCatalog.js'

export const backdropEffects = ['none', 'snow', 'leaves', 'stars', 'rain', 'particles', 'color', 'parallax']
export const entryEffects = ['none', 'fade', 'rise', 'float']
export const effectSpeeds = ['slow', 'normal', 'fast']
export const effectStrengths = ['subtle', 'normal', 'strong']
export const scheduleLimit = 8

const option = (values, value, fallback) => values.includes(value) ? value : fallback
const themeId = (value, fallback = defaultThemeId) => isThemeId(value) ? value : fallback
const time = (value, fallback) => typeof value === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value) ? value : fallback

export function readEffects(input) {
  return {
    backdrop: option(backdropEffects, input?.backdrop, 'none'),
    text: option(entryEffects, input?.text, 'none'),
    widget: option(entryEffects, input?.widget, 'none'),
    speed: option(effectSpeeds, input?.speed, 'normal'),
    strength: option(effectStrengths, input?.strength, 'normal'),
    finish: input?.finish === 'loop' ? 'loop' : 'once',
  }
}

export function hasEffects(effects) {
  return [effects.backdrop, effects.text, effects.widget].some((effect) => effect !== 'none')
}

export function readSchedule(input) {
  return {
    mode: option(['off', 'dayNight', 'custom'], input?.mode, 'off'),
    day: time(input?.day, '07:00'),
    night: time(input?.night, '19:00'),
    dayThemeId: themeId(input?.dayThemeId),
    nightThemeId: themeId(input?.nightThemeId, 'coastal-train'),
    rules: Array.isArray(input?.rules) ? input.rules.slice(0, scheduleLimit).filter(Boolean).map((rule) => ({
      start: time(rule.start, '08:00'),
      end: time(rule.end, '18:00'),
      themeId: themeId(rule.themeId),
    })) : [],
  }
}

export function scheduledThemeId(schedule, date = new Date()) {
  const now = date.getHours() * 60 + date.getMinutes()
  function inside(start, end) {
    const minutes = (value) => Number(value.slice(0, 2)) * 60 + Number(value.slice(3))
    const from = minutes(start)
    const to = minutes(end)
    if (from === to) return false
    return from < to ? now >= from && now < to : now >= from || now < to
  }
  if (schedule.mode === 'dayNight') {
    return inside(schedule.day, schedule.night) ? schedule.dayThemeId : schedule.nightThemeId
  }
  if (schedule.mode === 'custom') {
    return schedule.rules.find(({ start, end }) => inside(start, end))?.themeId ?? defaultThemeId
  }
  return null
}
