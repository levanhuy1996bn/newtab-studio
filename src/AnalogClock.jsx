import { t } from './i18n.js'
import { analogFaces, analogMarkings } from './widgetModel.js'

const minutes = Array.from({ length: 60 }, (_, index) => index)
const hours = Array.from({ length: 12 }, (_, index) => index)
const hand = (kind, angle) => <i className={'analog-hand analog-' + kind} style={{ '--hand-angle': angle + 'deg' }} />

function numberPosition(index) {
  const angle = index * Math.PI / 6
  return { left: 50 + Math.sin(angle) * 32 + '%', top: 50 - Math.cos(angle) * 32 + '%' }
}

export function AnalogDial({ config, now, locale }) {
  const second = now.getSeconds()
  const minute = now.getMinutes() + second / 60
  const hour = now.getHours() % 12 + minute / 60
  const indices = config.markings === 'dots' ? hours.map((index) => index * 5) : minutes

  return <time className="widget-analog" dateTime={now.toISOString()} aria-label={now.toLocaleTimeString(locale, {
    hour: 'numeric', minute: '2-digit', ...(config.seconds && { second: '2-digit' }),
  })}>
    <span className="analog-dial" data-face={config.face} data-markings={config.markings} aria-hidden="true">
      {indices.map((index) => <i className="analog-index" data-major={index % 5 === 0} key={index}
        style={{ rotate: index * 6 + 'deg' }} />)}
      {config.markings === 'numbers' && hours.map((index) => <b className="analog-number" key={index}
        style={numberPosition(index)}>{index || 12}</b>)}
      {hand('hour', hour * 30)}
      {hand('minute', minute * 6)}
      {config.seconds && hand('second', second * 6)}
      <i className="analog-pivot" />
    </span>
  </time>
}

export function AnalogOptions({ config, language, onChange, disabled }) {
  return <>
    <label className="analog-option">
      {t('analogFace', language)}
      <select value={config.face} disabled={disabled} onChange={(event) => onChange({ face: event.target.value })}>
        {analogFaces.map((face) => <option value={face} key={face}>{t('analogFace_' + face, language)}</option>)}
      </select>
    </label>
    <label className="analog-option">
      {t('analogMarkings', language)}
      <select value={config.markings} disabled={disabled} onChange={(event) => onChange({ markings: event.target.value })}>
        {analogMarkings.map((markings) => <option value={markings} key={markings}>{t('analogMarkings_' + markings, language)}</option>)}
      </select>
    </label>
    <label className="text-checkbox analog-option">
      <input type="checkbox" checked={config.seconds} disabled={disabled}
        onChange={(event) => onChange({ seconds: event.target.checked })} />{t('widgetSeconds', language)}
    </label>
  </>
}
