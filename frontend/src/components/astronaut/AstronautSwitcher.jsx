import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Users } from 'lucide-react'
import { useMission } from '../../context/MissionContext'
import { AstronautAvatar } from './AstronautAvatar'

export function AstronautSwitcher() {
  const { astronauts, selectedAstronaut, selectAstronaut } = useMission()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const handlePointer = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false)
    }
    const handleKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`flex items-center gap-2 rounded-lg border px-1.5 py-1.5 transition ${
          open
            ? 'border-cyan-300/35 bg-cyan-400/10 text-cyan-200'
            : 'border-white/[0.08] bg-white/[0.02] text-slate-400 hover:border-cyan-300/25 hover:text-cyan-200'
        }`}
        aria-label={`Switch astronaut. Currently ${selectedAstronaut.name}, ${selectedAstronaut.id}`}
        aria-expanded={open}
      >
        <AstronautAvatar astronaut={selectedAstronaut} size="sm" showStatus />
        <span className="hidden text-left leading-tight xl:block">
          <span className="block max-w-[92px] truncate text-[9.5px] font-medium text-slate-200">
            {selectedAstronaut.name}
          </span>
          <span className="block font-mono text-[7px] uppercase tracking-[0.08em] text-cyan-300/60">
            {selectedAstronaut.id}
          </span>
        </span>
        <span className="hidden font-mono text-[8px] tracking-[0.06em] text-slate-400 md:block xl:hidden">
          {selectedAstronaut.id}
        </span>
        <ChevronDown size={11} className={`shrink-0 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="glass-panel fade-in absolute -right-20 top-[calc(100%+10px)] z-50 w-[min(320px,calc(100vw-2rem))] overflow-hidden p-0 sm:right-0">
          <div className="flex items-center justify-between border-b border-white/[0.07] px-3.5 py-2.5">
            <div className="flex items-center gap-2">
              <Users size={12} className="text-cyan-300" />
              <span className="panel-title text-[11px] font-semibold text-slate-100">
                Monitored astronauts
              </span>
            </div>
            <span className="font-mono text-[7px] uppercase tracking-[0.1em] text-slate-600">
              {astronauts.length} profiles
            </span>
          </div>
          <div className="p-1.5">
            {astronauts.map((astronaut) => {
              const active = astronaut.id === selectedAstronaut.id
              return (
                <button
                  key={astronaut.id}
                  type="button"
                  onClick={() => {
                    selectAstronaut(astronaut.id)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition ${
                    active
                      ? 'border-cyan-300/25 bg-cyan-400/[0.08]'
                      : 'border-transparent hover:border-white/[0.07] hover:bg-white/[0.03]'
                  }`}
                >
                  <AstronautAvatar astronaut={astronaut} size="md" showStatus />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-[11px] font-medium text-slate-200">
                        {astronaut.name}
                      </span>
                      {active && <Check size={11} className="shrink-0 text-cyan-300" />}
                    </span>
                    <span className="mt-0.5 block truncate font-mono text-[7px] uppercase tracking-[0.08em] text-slate-500">
                      {astronaut.id} · {astronaut.age} yrs · {astronaut.role}
                    </span>
                  </span>
                  <span className="shrink-0 rounded border border-emerald-400/20 bg-emerald-400/[0.06] px-1 py-0.5 font-mono text-[6.5px] uppercase tracking-[0.06em] text-emerald-300/80">
                    {astronaut.status}
                  </span>
                </button>
              )
            })}
          </div>
          <p className="border-t border-white/[0.06] px-3.5 py-2 font-mono text-[7px] uppercase tracking-[0.08em] text-slate-600">
            Selection applies across every module
          </p>
        </div>
      )}
    </div>
  )
}
