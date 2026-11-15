import { Activity, Lock, Radio, Satellite, ShieldCheck, Users } from 'lucide-react'
import { ASTRONAUTS } from '../../data/astronauts'
import { MISSION } from '../../data/missionData'

function MissionStat({ icon: Icon, label, value, tone = 'emerald', sub }) {
  const tones = {
    emerald: 'text-emerald-300 border-emerald-400/20 bg-emerald-400/[0.06]',
    cyan: 'text-cyan-300 border-cyan-400/20 bg-cyan-400/[0.06]',
    blue: 'text-blue-300 border-blue-400/20 bg-blue-400/[0.06]',
  }
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3 transition hover:border-cyan-300/20 hover:bg-white/[0.04]">
      <div className="flex items-center gap-2">
        <span className={`flex h-6 w-6 items-center justify-center rounded-md border ${tones[tone]}`}>
          <Icon size={12} />
        </span>
        <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-slate-500">{label}</span>
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        <span className="font-display text-[13px] font-semibold text-slate-100">{value}</span>
      </div>
      {sub && <div className="mt-0.5 pl-3 font-mono text-[8px] uppercase tracking-[0.1em] text-slate-600">{sub}</div>}
    </div>
  )
}

export function MissionPanel() {
  return (
    <div className="glass-panel hud-corners relative overflow-hidden p-5 sm:p-6 lg:max-w-[520px]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-400/[0.06] blur-3xl" />

      <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] pb-4">
        <div className="flex items-center gap-2">
          <Radio size={13} className="text-cyan-300" />
          <span className="eyebrow text-[9px]!">Mission overview</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-slate-600">{MISSION.code}</span>
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5">
            <span className="pulse-dot text-emerald-400" />
            <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-emerald-300">Live</span>
          </span>
        </div>
      </div>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-1 font-mono text-[8px] uppercase tracking-[0.22em] text-slate-500">
            Current mission
          </div>
          <h2 className="font-display text-[1.4rem] font-semibold leading-tight tracking-[-0.01em] text-slate-50 sm:text-[1.55rem]">
            Mars Exploration
            <br />
            Mission
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="rounded border border-cyan-300/20 bg-cyan-400/[0.07] px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.12em] text-cyan-200">
              Sol {MISSION.day}
            </span>
            <span className="rounded border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.1em] text-slate-400">
              Cruise phase
            </span>
          </div>
        </div>

        <div className="relative mr-1 mt-1 h-[104px] w-[104px] shrink-0 sm:h-[116px] sm:w-[116px]">
          <div className="absolute -inset-3 rounded-full border border-cyan-300/15" />
          <div
            className="absolute -inset-1 rounded-full border border-dashed border-cyan-200/25"
            style={{ transform: 'rotate(-24deg) scaleY(0.58)' }}
          />
          <div className="absolute inset-1 overflow-hidden rounded-full bg-[radial-gradient(circle_at_32%_26%,#fdba74_0%,#f97316_26%,#c2410c_52%,#7c2d12_76%,#3f1507_100%)] shadow-[0_0_44px_-10px_rgba(249,115,22,0.55),inset_-16px_-10px_26px_rgba(0,0,0,0.75)]">
            <div className="absolute left-3 top-8 h-[7px] w-16 -rotate-[14deg] rounded-full bg-[#7c2d12]/60 blur-[2px]" />
            <div className="absolute left-8 top-16 h-1 w-10 rotate-[8deg] rounded-full bg-[#431407]/60 blur-[1px]" />
            <div className="absolute right-3 top-5 h-3 w-3 rounded-full bg-[#fed7aa]/20 blur-[3px]" />
          </div>
          <div className="absolute -right-1 top-4 h-2 w-2 rounded-full bg-cyan-200 shadow-[0_0_10px_2px_rgba(103,232,249,0.65)]" />
          <div className="absolute bottom-0 left-0 flex items-center gap-1 rounded-full border border-white/10 bg-[#07101d]/90 px-1.5 py-0.5">
            <Satellite size={8} className="text-cyan-300" />
            <span className="font-mono text-[7px] tracking-[0.08em] text-slate-400">ARES-1</span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2.5">
        <MissionStat icon={Activity} label="Mission status" value="Active" sub="Cruise · stage 2" />
        <MissionStat icon={Users} label="Crew status" value={`${MISSION.crewCount} Members`} tone="cyan" sub="All active" />
        <MissionStat icon={ShieldCheck} label="System status" value="Operational" sub="All subsystems" />
        <MissionStat icon={Lock} label="Data link" value="Encrypted" tone="blue" sub="DSN · locked" />
      </div>

      <div className="mt-5 border-t border-white/[0.07] pt-4">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-slate-500">Crew manifest</span>
          <span className="font-mono text-[8px] text-slate-600">{ASTRONAUTS.length} / {ASTRONAUTS.length} accounted for</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          {ASTRONAUTS.map((member) => (
            <div key={member.id} className="group flex min-w-0 flex-col items-center gap-1.5">
              <div className="relative">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-cyan-300/20 bg-gradient-to-br from-slate-700/80 to-slate-900 font-display text-[9px] font-semibold text-cyan-100">
                  {member.initials}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-[#081120] bg-emerald-400" />
              </div>
              <span className="w-full truncate text-center text-[8.5px] text-slate-400 group-hover:text-slate-300">
                {member.name.split(' ').slice(-1)[0]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-1.5 rounded-lg border border-white/[0.05] bg-black/20 p-2.5 font-mono text-[8px] uppercase tracking-[0.12em]">
        {[
          ['Life support', 'Nominal', 'text-emerald-400'],
          ['Comm delay', MISSION.communicationDelay, 'text-cyan-300'],
          ['AI core', 'Offline ready', 'text-blue-300'],
        ].map(([label, value, tone]) => (
          <div key={label} className="flex items-center justify-between gap-2">
            <span className="text-slate-600">{label}</span>
            <span className={`flex items-center gap-1.5 ${tone}`}>
              <span className="h-1 w-1 rounded-full bg-current" />
              {value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5 text-[8.5px] uppercase tracking-[0.14em] text-slate-600">
        <span className="h-px w-5 bg-slate-700" />
        Simulated mission data
        <span className="h-px w-5 bg-slate-700" />
      </div>
    </div>
  )
}
