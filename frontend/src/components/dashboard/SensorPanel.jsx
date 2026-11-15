import { Droplets, HeartPulse, Radar, Thermometer, Wind } from 'lucide-react'
import { SENSORS } from '../../data/missionData'
import { SectionHeader } from '../ui/SectionHeader'
import { StatusPill } from '../ui/StatusPill'

const ICONS = [HeartPulse, Droplets, Thermometer, Wind]

function SignalBars({ value }) {
  const filled = Math.ceil((value / 100) * 7)
  return (
    <div className="flex items-end gap-[2px]" aria-hidden="true">
      {Array.from({ length: 7 }, (_, index) => (
        <span
          key={index}
          className={`w-[2.5px] rounded-sm ${
            index < filled ? 'bg-cyan-300/80' : 'bg-slate-700/70'
          }`}
          style={{ height: 3 + index * 1.6 }}
        />
      ))}
    </div>
  )
}

export function SensorPanel() {
  return (
    <section className="glass-panel flex h-full flex-col p-4 sm:p-5">
      <SectionHeader
        icon={Radar}
        eyebrow="Hardware link"
        title="Sensor monitoring"
        description="Biomedical sensor nodes and their cabin link quality."
        actions={
          <>
            <StatusPill level="warning" label="Simulation mode" pulse />
            <span className="hidden rounded border border-emerald-400/20 bg-emerald-400/[0.05] px-2 py-1 font-mono text-[7px] uppercase tracking-[0.1em] text-emerald-300/80 sm:inline">
              4/4 connected
            </span>
          </>
        }
      />

      <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-300/20 bg-amber-400/[0.055] px-2.5 py-2">
        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-amber-300/30 font-mono text-[7px] text-amber-300">
          !
        </span>
        <p className="text-[9px] leading-relaxed text-amber-100/65">
          <span className="font-medium text-amber-200">Simulation mode.</span> Sensor values are
          generated for this prototype. No physical astronaut sensors are connected.
        </p>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {SENSORS.map((sensor, index) => {
          const Icon = ICONS[index] ?? HeartPulse
          return (
            <div
              key={sensor.id}
              className="group rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 transition hover:border-cyan-300/20 hover:bg-white/[0.035]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-start gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-cyan-300/15 bg-cyan-400/[0.06] text-cyan-300/90">
                    <Icon size={13} />
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-[10px] font-medium text-slate-200">{sensor.name}</div>
                    <div className="mt-0.5 truncate font-mono text-[7px] uppercase tracking-[0.06em] text-slate-500">
                      {sensor.hardware}
                    </div>
                  </div>
                </div>
                <span className="flex shrink-0 items-center gap-1 rounded border border-emerald-400/20 bg-emerald-400/[0.06] px-1 py-0.5">
                  <span className="h-1 w-1 rounded-full bg-emerald-400" />
                  <span className="font-mono text-[6.5px] uppercase tracking-[0.08em] text-emerald-300/90">
                    {sensor.status}
                  </span>
                </span>
              </div>

              <div className="mt-2.5 flex items-end justify-between gap-2 border-t border-white/[0.04] pt-2">
                <div className="font-mono text-[7px] uppercase tracking-[0.08em] text-slate-600">
                  {sensor.id} · {sensor.sampling}
                </div>
                <div className="flex items-center gap-1.5">
                  <SignalBars value={sensor.signal} />
                  <span className="font-mono text-[8px] text-cyan-200/70">{sensor.signal}%</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3 font-mono text-[7px] uppercase tracking-[0.1em] text-slate-600">
        <span className="flex items-center gap-1.5">
          <span className="pulse-dot h-1! w-1! text-cyan-400" />
          Simulation stream · 6s refresh
        </span>
        <span>Link latency 42 ms</span>
      </div>
    </section>
  )
}
