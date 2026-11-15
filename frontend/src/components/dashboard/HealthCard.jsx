import { Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { Sparkline } from '../ui/Sparkline'
import { StatusPill, STATUS_ACCENT } from '../ui/StatusPill'

export function HealthCard({ meta, value, previous, status, icon: Icon, series = [], index = 0 }) {
  const accent = STATUS_ACCENT[status.level] ?? STATUS_ACCENT.normal
  const decimals = meta.precision
  const delta = Number((value - previous).toFixed(decimals))
  const isUp = delta > 0
  const isDown = delta < 0
  const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus
  const deltaLabel = `${isUp ? '+' : ''}${delta.toFixed(decimals)}`
  const sparkData = series.length ? [...series, Number(value)] : [previous, Number(value)]

  return (
    <article
      className="glass-panel card-hover fade-up group relative overflow-hidden p-4"
      style={{ animationDelay: `${index * 55}ms` }}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-[0.12] blur-2xl transition-opacity duration-300 group-hover:opacity-20"
        style={{ background: accent.color }}
      />

      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border"
            style={{
              color: accent.color,
              borderColor: `${accent.color}33`,
              backgroundColor: `${accent.color}14`,
            }}
          >
            <Icon size={14} strokeWidth={1.9} />
          </span>
          <span className="truncate text-[10.5px] font-medium tracking-wide text-slate-300">
            {meta.label}
          </span>
        </div>
      </div>

      <div className="mt-3.5 flex items-end justify-between gap-2">
        <div className="flex items-baseline gap-1.5">
          <span className="mono text-[1.9rem] font-semibold leading-none tracking-[-0.04em] text-slate-50">
            {Number(value).toFixed(decimals)}
          </span>
          <span className="font-mono text-[9.5px] uppercase tracking-[0.06em] text-slate-500">
            {meta.unit}
          </span>
        </div>
        <span
          className="flex items-center gap-1 rounded-md border border-white/[0.06] bg-white/[0.025] px-1.5 py-1 font-mono text-[8px] text-slate-400"
          title="Change since the previous simulated reading"
        >
          <TrendIcon size={10} className={isUp || isDown ? 'text-cyan-300/80' : 'text-slate-500'} />
          {deltaLabel}
        </span>
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-2">
        <StatusPill level={status.level} label={status.label} />
        <span className="font-mono text-[8px] tracking-[0.02em] text-slate-500">
          prev {Number(previous).toFixed(decimals)}
        </span>
      </div>

      <div className="mt-2.5 border-t border-white/[0.05] pt-2">
        <Sparkline data={sparkData} color={accent.color} width={200} height={25} />
      </div>

      <div className="mt-1.5 flex items-center justify-between font-mono text-[7px] uppercase tracking-[0.1em] text-slate-600">
        <span>{meta.cadence}</span>
        <span className="text-cyan-200/30">simulated</span>
      </div>
    </article>
  )
}
