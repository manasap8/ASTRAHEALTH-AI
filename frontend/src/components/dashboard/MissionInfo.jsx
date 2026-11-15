import { CalendarDays, Globe2, Rocket, Satellite, Timer, Users } from 'lucide-react'
import { MISSION } from '../../data/missionData'
import { SectionHeader } from '../ui/SectionHeader'
import { StatusPill } from '../ui/StatusPill'

const STATS = [
  { icon: CalendarDays, label: 'Mission day', value: `Day ${MISSION.day}`, sub: 'Sol 218 · cruise' },
  { icon: Users, label: 'Crew members', value: `${MISSION.crewCount}`, sub: 'All accounted for' },
  { icon: Globe2, label: 'Distance from Earth', value: MISSION.distanceFromEarth, sub: 'One-way range' },
  { icon: Timer, label: 'Communication delay', value: MISSION.communicationDelay, sub: 'Signal round-trip 25m 8s' },
]

export function MissionInfo() {
  return (
    <section className="glass-panel flex h-full flex-col overflow-hidden p-4 sm:p-5">
      <SectionHeader
        icon={Satellite}
        eyebrow="Flight dynamics"
        title="Mission information"
        description="Cruise telemetry for the Ares Transit Vehicle."
        actions={<StatusPill level="info" label="Simulated mission" />}
      />

      <div className="mt-3.5 flex items-center justify-between gap-3 rounded-xl border border-cyan-300/[0.12] bg-gradient-to-r from-cyan-400/[0.07] via-blue-500/[0.03] to-transparent p-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-300/25 bg-[#071523] text-cyan-300">
            <Rocket size={17} />
          </span>
          <div className="min-w-0">
            <div className="truncate font-display text-[13px] font-semibold text-slate-100">
              {MISSION.name}
            </div>
            <div className="truncate font-mono text-[7.5px] uppercase tracking-[0.1em] text-slate-500">
              {MISSION.vehicle} · {MISSION.orbitPhase}
            </div>
          </div>
        </div>
        <span className="hidden shrink-0 rounded border border-emerald-400/20 bg-emerald-400/[0.06] px-2 py-1 font-mono text-[7px] uppercase tracking-[0.1em] text-emerald-300/80 sm:inline">
          Active
        </span>
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-2">
        {STATS.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 transition hover:border-cyan-300/20"
            >
              <div className="flex items-center gap-1.5">
                <Icon size={10} className="text-cyan-300/60" />
                <span className="truncate font-mono text-[7px] uppercase tracking-[0.1em] text-slate-500">
                  {stat.label}
                </span>
              </div>
              <div className="mt-1.5 font-mono text-[13px] font-medium text-slate-100">{stat.value}</div>
              <div className="mt-0.5 truncate font-mono text-[6.5px] uppercase tracking-[0.06em] text-slate-600">
                {stat.sub}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-3.5">
        <div className="mb-1.5 flex items-center justify-between font-mono text-[7px] uppercase tracking-[0.1em]">
          <span className="text-slate-600">Earth → Mars transit</span>
          <span className="text-cyan-300/70">62% complete</span>
        </div>
        <div className="relative h-2 overflow-hidden rounded-full bg-[#0a1526]">
          <div className="absolute inset-y-0 left-0 w-[62%] rounded-full bg-gradient-to-r from-cyan-400/70 via-cyan-300/80 to-blue-400/70" />
          <div className="absolute inset-y-0 left-[62%] w-px bg-cyan-100/60" />
          <div className="absolute left-[62%] top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100/50 bg-[#081321] shadow-[0_0_10px_rgba(34,211,238,0.6)]" />
        </div>
        <div className="mt-1 flex items-center justify-between font-mono text-[7px] uppercase tracking-[0.08em] text-slate-600">
          <span className="flex items-center gap-1">
            <Globe2 size={8} /> Earth
          </span>
          <span>{MISSION.destination}</span>
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3 font-mono text-[7px] uppercase tracking-[0.1em] text-slate-600">
        <span>Next DSN window · {MISSION.nextWindow}</span>
        <span className="text-amber-200/40">All values simulated</span>
      </div>
    </section>
  )
}
