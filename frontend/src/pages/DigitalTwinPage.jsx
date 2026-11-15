import { Box, Brain, ScanLine, ShieldCheck } from 'lucide-react'
import { useMission } from '../context/MissionContext'
import { BODY_REGIONS } from '../data/missionData'
import { DigitalTwin } from '../components/dashboard/DigitalTwin'
import { StatusPill, STATUS_ACCENT } from '../components/ui/StatusPill'

export function DigitalTwinPage() {
  const { selectedAstronaut, regionStatuses, readings } = useMission()
  const warnings = BODY_REGIONS.filter((region) => regionStatuses[region.id]?.level !== 'normal')

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-4">
      <div className="fade-up flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="eyebrow">Anatomical telemetry</span>
            <StatusPill level="info" label="3D astronaut model" />
          </div>
          <h1 className="panel-title mt-1 text-xl font-semibold text-slate-50">Digital Twin</h1>
          <p className="mt-1 max-w-[680px] text-[11px] leading-relaxed text-slate-400">
            Explore a human-form 3D model for {selectedAstronaut.name} and review simulated
            telemetry for each monitored body region.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 font-mono text-[7.5px] uppercase tracking-[0.08em] text-slate-500">
          <ScanLine size={11} className="text-cyan-300/70" />
          {warnings.length === 0 ? 'All 6 regions nominal' : `${warnings.length} regions flagged`}
        </div>
      </div>

      <DigitalTwin />

      <div className="grid gap-4 xl:grid-cols-12">
        <section className="glass-panel p-4 sm:p-5 xl:col-span-7">
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-400/[0.06] text-cyan-300">
              <Brain size={15} />
            </span>
            <div>
              <div className="eyebrow">Region signals</div>
              <h2 className="panel-title mt-0.5 text-[13px] font-semibold text-slate-100">
                Monitoring summary
              </h2>
            </div>
          </div>
          <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {BODY_REGIONS.map((region) => {
              const status = regionStatuses[region.id]
              const accent = STATUS_ACCENT[status.level]
              return (
                <div
                  key={region.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-black/15 px-2.5 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: accent.color }}
                    />
                    <div>
                      <div className="text-[9.5px] text-slate-300">{region.label}</div>
                      <div className="font-mono text-[6.5px] uppercase tracking-[0.06em] text-slate-600">
                        {region.signal}
                      </div>
                    </div>
                  </div>
                  <StatusPill level={status.level} label={status.label} />
                </div>
              )
            })}
          </div>
        </section>

        <div className="space-y-4 xl:col-span-5">
          <section className="glass-panel p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-300/20 bg-blue-400/[0.06] text-blue-300">
                <Box size={15} />
              </span>
              <div>
                <div className="eyebrow">3D anatomy model</div>
                <h2 className="panel-title mt-0.5 text-[13px] font-semibold text-slate-100">
                  Astronaut body structure
                </h2>
              </div>
            </div>
            <p className="mt-2.5 text-[10px] leading-relaxed text-slate-400">
              The 3D model shows the head, torso, arms and legs, with schematic brain, lung and heart
              markers. Select a body region to review its simulated readings.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-1.5 font-mono text-[7px]">
              <span className="rounded border border-white/[0.06] bg-white/[0.02] px-2 py-1.5 text-slate-500">
                Model · Three.js
              </span>
              <span className="rounded border border-white/[0.06] bg-white/[0.02] px-2 py-1.5 text-slate-500">
                Regions · 6 monitored
              </span>
              <span className="rounded border border-white/[0.06] bg-white/[0.02] px-2 py-1.5 text-slate-500">
                Status · simulated
              </span>
              <span className="rounded border border-white/[0.06] bg-white/[0.02] px-2 py-1.5 text-slate-500">
                Readings · crew telemetry
              </span>
            </div>
          </section>

          <section className="glass-panel p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck size={13} className="text-emerald-400/80" />
              <span className="font-mono text-[7.5px] uppercase tracking-[0.1em] text-emerald-300/70">
                Current interpretation
              </span>
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-slate-400">
              {warnings.length === 0
                ? 'All simulated body regions are currently within configured thresholds. Continue routine surveillance.'
                : `${warnings
                    .map((region) => region.label)
                    .join(', ')} ${warnings.length === 1 ? 'is' : 'are'} flagged in the current simulated status. Review the relevant readings and follow flight-surgeon guidance.`}
            </p>
            <div className="mt-2 border-t border-white/[0.05] pt-2 font-mono text-[6.5px] uppercase tracking-[0.06em] text-slate-600">
              Current simulated vitals: HR {Math.round(readings.heartRate)} · SpO₂{' '}
              {Math.round(readings.spo2)}% · {Number(readings.temperature).toFixed(1)} °C
            </div>
          </section>
        </div>
      </div>

      <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] px-4 py-3 font-mono text-[7px] uppercase leading-relaxed tracking-[0.08em] text-slate-600">
        Digital twin is a decision-support visualization · region indicators are simulated · not a
        diagnostic image
      </div>
    </div>
  )
}
