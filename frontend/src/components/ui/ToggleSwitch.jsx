export function ToggleSwitch({ checked, onChange, label, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 shrink-0 rounded-full border transition disabled:cursor-not-allowed disabled:opacity-40 ${
        checked
          ? 'border-cyan-300/40 bg-cyan-400/25'
          : 'border-white/10 bg-white/[0.06]'
      }`}
    >
      <span
        className={`absolute top-0.5 h-3.5 w-3.5 rounded-full shadow transition-all duration-200 ${
          checked ? 'left-[18px] bg-cyan-200' : 'left-0.5 bg-slate-500'
        }`}
      />
    </button>
  )
}
