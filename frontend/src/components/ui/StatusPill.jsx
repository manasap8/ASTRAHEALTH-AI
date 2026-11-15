const STYLES = {
  normal: {
    wrap: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300',
    dot: 'bg-emerald-400 text-emerald-400',
  },
  warning: {
    wrap: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
    dot: 'bg-amber-400 text-amber-400',
  },
  critical: {
    wrap: 'border-rose-400/35 bg-rose-500/10 text-rose-300',
    dot: 'bg-rose-400 text-rose-400',
  },
  info: {
    wrap: 'border-sky-400/25 bg-sky-400/10 text-sky-300',
    dot: 'bg-sky-400 text-sky-400',
  },
  neutral: {
    wrap: 'border-slate-400/20 bg-slate-400/10 text-slate-300',
    dot: 'bg-slate-400 text-slate-400',
  },
}

export function StatusPill({ level = 'neutral', label, dot = true, pulse = false, className = '' }) {
  const style = STYLES[level] ?? STYLES.neutral
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.14em] ${style.wrap} ${className}`}
    >
      {dot && (
        <span className={`h-1.5 w-1.5 rounded-full ${style.dot} ${pulse ? 'animate-pulse' : ''}`} />
      )}
      {label}
    </span>
  )
}

export const STATUS_ACCENT = {
  normal: {
    color: '#34d399',
    text: 'text-emerald-300',
    soft: 'text-emerald-400/70',
    border: 'border-emerald-400/25',
    bg: 'bg-emerald-400',
  },
  warning: {
    color: '#fbbf24',
    text: 'text-amber-300',
    soft: 'text-amber-400/70',
    border: 'border-amber-400/30',
    bg: 'bg-amber-400',
  },
  critical: {
    color: '#fb7185',
    text: 'text-rose-300',
    soft: 'text-rose-400/70',
    border: 'border-rose-400/35',
    bg: 'bg-rose-400',
  },
  info: {
    color: '#38bdf8',
    text: 'text-sky-300',
    soft: 'text-sky-400/70',
    border: 'border-sky-400/25',
    bg: 'bg-sky-400',
  },
  neutral: {
    color: '#94a3b8',
    text: 'text-slate-300',
    soft: 'text-slate-400/70',
    border: 'border-slate-400/20',
    bg: 'bg-slate-400',
  },
}
