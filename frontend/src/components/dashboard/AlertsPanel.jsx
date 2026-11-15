import { useEffect, useState } from 'react'
import {
  ArrowUpRight,
  BellRing,
  Info,
  RotateCcw,
  ShieldAlert,
  TriangleAlert,
  Zap,
} from 'lucide-react'
import { useMission } from '../../context/MissionContext'
import { SectionHeader } from '../ui/SectionHeader'
import { StatusPill } from '../ui/StatusPill'

const SEVERITY = {
  critical: {
    icon: ShieldAlert,
    label: 'Critical',
    border: 'border-rose-400/30',
    bar: 'bg-rose-400',
    bg: 'bg-rose-500/[0.07]',
    iconTone: 'border-rose-400/25 bg-rose-500/10 text-rose-300',
  },
  warning: {
    icon: TriangleAlert,
    label: 'Warning',
    border: 'border-amber-400/25',
    bar: 'bg-amber-400',
    bg: 'bg-amber-400/[0.05]',
    iconTone: 'border-amber-400/25 bg-amber-400/10 text-amber-300',
  },
  info: {
    icon: Info,
    label: 'Normal',
    border: 'border-sky-400/20',
    bar: 'bg-sky-400',
    bg: 'bg-sky-400/[0.04]',
    iconTone: 'border-sky-400/20 bg-sky-400/[0.07] text-sky-300',
  },
}

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'critical', label: 'Critical' },
  { id: 'warning', label: 'Warning' },
  { id: 'info', label: 'Normal' },
]

export function AlertsPanel() {
  const { alerts, activeScenario, triggerEmergency, resetSimulation, selectedAstronaut } = useMission()
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (activeScenario) setFilter('all')
  }, [activeScenario])

  const filtered = filter === 'all' ? alerts : alerts.filter((alert) => alert.severity === filter)
  const criticalCount = alerts.filter((alert) => alert.severity === 'critical').length
  const warningCount = alerts.filter((alert) => alert.severity === 'warning').length

  const handleEmergency = () => {
    setFilter('all')
    triggerEmergency()
  }

  const scrollToTwin = () => {
    document.getElementById('digital-twin')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <section id="alerts-panel" className="glass-panel flex flex-col overflow-hidden p-4 sm:p-5">
      <SectionHeader
        icon={BellRing}
        eyebrow="Crew safety"
        title="Alerts & notifications"
        description={`Simulated escalation feed for ${selectedAstronaut.name}.`}
        actions={
          <span className="flex items-center gap-1.5">
            {criticalCount > 0 && <StatusPill level="critical" label={`${criticalCount} critical`} pulse />}
            {warningCount > 0 && <StatusPill level="warning" label={`${warningCount} warning`} />}
            {criticalCount === 0 && warningCount === 0 && <StatusPill level="normal" label="All clear" />}
          </span>
        }
      />

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {FILTERS.map((item) => {
          const count =
            item.id === 'all' ? alerts.length : alerts.filter((alert) => alert.severity === item.id).length
          const active = filter === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[8px] uppercase tracking-[0.08em] transition ${
                active
                  ? 'border-cyan-300/30 bg-cyan-400/10 text-cyan-200'
                  : 'border-white/[0.06] bg-white/[0.02] text-slate-500 hover:border-cyan-300/20 hover:text-slate-300'
              }`}
            >
              {item.label}
              <span className={`rounded px-1 text-[7px] ${active ? 'bg-cyan-300/15' : 'bg-white/[0.05]'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      <div className="scroll-slim mt-3 max-h-[318px] flex-1 space-y-2 overflow-y-auto pr-0.5">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-white/[0.08] py-10 text-center">
            <ShieldAlert size={20} className="text-slate-600" />
            <p className="mt-2 text-[10px] text-slate-500">No {filter} alerts in the current feed.</p>
          </div>
        )}
        {filtered.map((alert) => {
          const style = SEVERITY[alert.severity] ?? SEVERITY.info
          const Icon = style.icon
          return (
            <article
              key={alert.id}
              className={`rounded-lg border border-l-2 ${style.border} ${style.bg} p-2.5 transition hover:border-cyan-300/25`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-start gap-2">
                  <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${style.iconTone}`}>
                    <Icon size={11} />
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-[10.5px] font-medium leading-snug text-slate-200">{alert.title}</h4>
                    <p className="mt-1 text-[9.5px] leading-relaxed text-slate-400">{alert.description}</p>
                  </div>
                </div>
                <span className="shrink-0 font-mono text-[7px] uppercase tracking-[0.04em] text-slate-600">
                  {alert.time}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2 pl-7">
                <span className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${style.bar}`} />
                  <span className="font-mono text-[7px] uppercase tracking-[0.12em] text-slate-500">
                    {style.label} · {alert.source}
                  </span>
                </span>
                <span className="font-mono text-[7px] uppercase tracking-[0.08em] text-slate-600">
                  {alert.simulated ? 'sim event' : 'telemetry'}
                </span>
              </div>
            </article>
          )
        })}
      </div>

      <div className="mt-3 border-t border-white/[0.06] pt-3">
        {activeScenario && (
          <div className="mb-2.5 flex items-center justify-between gap-2 rounded-lg border border-rose-400/25 bg-rose-500/[0.07] px-2.5 py-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-400" />
              </span>
              <div className="min-w-0">
                <div className="font-mono text-[7px] uppercase tracking-[0.14em] text-rose-300/70">
                  Simulation active
                </div>
                <div className="truncate text-[10px] font-medium text-rose-100">{activeScenario.name}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={scrollToTwin}
              className="flex shrink-0 items-center gap-1 rounded border border-rose-300/20 px-1.5 py-1 font-mono text-[7px] uppercase tracking-[0.1em] text-rose-200/80 transition hover:bg-rose-500/15"
            >
              Body map
              <ArrowUpRight size={9} />
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleEmergency}
            className="group relative flex h-9 items-center justify-center gap-1.5 overflow-hidden rounded-lg border border-rose-400/40 bg-gradient-to-r from-rose-500/20 to-rose-600/10 px-2 text-[10px] font-medium text-rose-100 transition hover:border-rose-300/60 hover:from-rose-500/30 hover:to-rose-600/20"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-rose-300/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <Zap size={12} className="text-rose-300" />
            Emergency Simulation
          </button>
          <button
            type="button"
            onClick={resetSimulation}
            className="btn-ghost h-9 px-2 text-[10px]"
          >
            <RotateCcw size={12} className="text-cyan-300/80" />
            Reset Simulation
          </button>
        </div>
        <p className="mt-1.5 text-center font-mono text-[7px] uppercase tracking-[0.06em] text-slate-600">
          Updates simulated vitals, body map &amp; AI response
        </p>
      </div>
    </section>
  )
}
