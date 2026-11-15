import { Check } from 'lucide-react'
import { useMission } from '../../context/MissionContext'
import { AstronautAvatar } from './AstronautAvatar'

export function AstronautSelector({ title = 'Astronaut profiles', hint = 'Select a crew member to view their records.' }) {
  const { astronauts, selectedAstronautId, selectAstronaut } = useMission()

  return (
    <section className="glass-panel p-3.5 sm:p-4" aria-label={title}>
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="eyebrow">{title}</div>
          <p className="mt-0.5 text-[9.5px] text-slate-500">{hint}</p>
        </div>
        <span className="rounded border border-cyan-300/15 bg-cyan-400/[0.05] px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-[0.1em] text-cyan-200/70">
          Sample profiles
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {astronauts.map((astronaut) => {
          const active = astronaut.id === selectedAstronautId
          return (
            <button
              key={astronaut.id}
              type="button"
              onClick={() => selectAstronaut(astronaut.id)}
              aria-pressed={active}
              className={`group flex items-center gap-2.5 rounded-lg border p-2.5 text-left transition ${
                active
                  ? 'border-cyan-300/30 bg-gradient-to-r from-cyan-400/[0.1] to-blue-500/[0.03]'
                  : 'border-white/[0.06] bg-white/[0.02] hover:border-cyan-300/20 hover:bg-white/[0.04]'
              }`}
            >
              <AstronautAvatar astronaut={astronaut} size="lg" showStatus />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-[11.5px] font-semibold text-slate-200">
                    {astronaut.name}
                  </span>
                  {active && <Check size={11} className="shrink-0 text-cyan-300" />}
                </span>
                <span className="mt-0.5 block font-mono text-[7.5px] uppercase tracking-[0.07em] text-cyan-300/55">
                  {astronaut.id}
                </span>
                <span className="mt-0.5 block truncate font-mono text-[7px] uppercase tracking-[0.05em] text-slate-600">
                  {astronaut.age} yrs · {astronaut.role}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
