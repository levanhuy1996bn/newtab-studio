export function StudioRange({ label, value, limit, onChange }) {
  return (
    <label className="control-range">
      <span>{label} <output>{value}{limit.unit}</output></span>
      <input type="range" aria-label={label} min={limit.min} max={limit.max} step={limit.step}
        value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  )
}

export function StudioColor({ label, value, onChange }) {
  return (
    <label className="studio-color">
      <input type="color" aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} />
      <span>{label}</span>
      <span aria-hidden="true">{value.toUpperCase()}</span>
    </label>
  )
}
