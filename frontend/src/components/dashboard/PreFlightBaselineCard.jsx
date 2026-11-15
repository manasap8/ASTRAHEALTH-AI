import { ArrowRight, ClipboardCheck, FileCheck2, FileText, ShieldCheck } from 'lucide-react'
import { useMission } from '../../context/MissionContext'
import { StatusPill, STATUS_ACCENT } from '../ui/StatusPill'

const COMPARISON_METRICS = [
  { key: 'heartRate', label: 'Heart rate', unit: 'BPM', decimals: 0 },
  { key: 'spo2', label: 'SpO₂', unit: '%', decimals: 0 },
  { key: 'temperature', label: 'Temp', unit: '°C', decimals: 1 },
  { key: 'respiration', label: 'Resp.', unit: 'br/min', decimals: 0 },
]

export function PreFlightBaselineCard({ onViewReport }) {
  const { selectedAstronaut, readings, metricStatuses } = useMission()
  const { preFlight } = selectedAstronaut
if (
  !preFlight?.examinationDate ||
  !preFlight?.baseline ||
  !preFlight?.facility ||
  !preFlight?.physician
) {
  return (
    <section className="glass-panel p-5">
      <h2 className="panel-title text-[15px] font-semibold text-slate-100">
        Pre-Flight Health Baseline
      </h2>
      <p className="mt-2 text-sm text-slate-400">
        No pre-flight examination record is available for this astronaut.
      </p>
    </section>
  )
}
  return (
    <section className="glass-panel relative overflow-hidden p-4 sm:p-5">
      <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-cyan-400/[0.06] blur-3xl" />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-300/25 bg-cyan-400/[0.08] text-cyan-300">
            <ClipboardCheck size={17} />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="eyebrow">Immutable baseline record</div>
              <span className="rounded border border-amber-300/15 bg-amber-400/[0.05] px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-[0.1em] text-amber-200/70">
                Sample data
              </span>
            </div>
            <h2 className="panel-title mt-1 text-[15px] font-semibold text-slate-100">
              Pre-Flight Health Baseline
            </h2>
            <p className="mt-0.5 text-[10px] text-slate-500">
              Original examination for {selectedAstronaut.name} · {preFlight.examinationDate}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill level="normal" label="Report on file" />
          <span className="hidden items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-1 font-mono text-[7.5px] uppercase tracking-[0.08em] text-slate-500 sm:flex">
            <FileCheck2 size={10} className="text-cyan-300/70" />
            {preFlight.reportId}
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.25fr)_auto] lg:items-center">
        <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3">
          <div className="flex items-center gap-1.5 font-mono text-[7px] uppercase tracking-[0.12em] text-slate-600">
            <ShieldCheck size={10} className="text-emerald-400/70" />
            Clearance summary
          </div>
          <p className="mt-1.5 text-[10.5px] leading-relaxed text-slate-300">{preFlight.fitness}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[7px] uppercase tracking-[0.05em] text-slate-600">
            <span>{preFlight.facility.split('·')[0].trim()}</span>
            <span className="text-slate-700">/</span>
            <span>{preFlight.physician.split(',')[0]}</span>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between font-mono text-[7px] uppercase tracking-[0.1em] text-slate-600">
            <span>Pre-flight baseline → current</span>
            <span className="text-cyan-200/40">Live comparison</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {COMPARISON_METRICS.map((metric) => {
              const baseline = preFlight.baseline[metric.key]
              const current = readings[metric.key]
              const delta = Number((current - baseline).toFixed(metric.decimals))
              const status = metricStatuses[metric.key]
              return (
                <div
                  key={metric.key}
                  className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 py-1.5"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate font-mono text-[6.5px] uppercase tracking-[0.08em] text-slate-600">
                      {metric.label}
                    </span>
                    <span
                      className="h-1 w-1 shrink-0 rounded-full"
                      style={{ backgroundColor: STATUS_ACCENT[status.level]?.color }}
                    />
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="font-mono text-[8px] text-slate-500">
                      {Number(baseline).toFixed(metric.decimals)}
                    </span>
                    <span className="text-[7px] text-slate-700">→</span>
                    <span className="font-mono text-[11px] font-medium text-slate-100">
                      {Number(current).toFixed(metric.decimals)}
                    </span>
                    <span className="font-mono text-[6.5px] text-slate-600">{metric.unit}</span>
                  </div>
                  <div className={`mt-0.5 font-mono text-[7px] ${delta === 0 ? 'text-slate-600' : 'text-cyan-300/60'}`}>
                    {delta > 0 ? '+' : ''}
                    {delta.toFixed(metric.decimals)} vs baseline
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={onViewReport}
          className="btn-primary group h-10 w-full px-4 text-[10.5px] lg:w-auto"
        >
          <FileText size={13} />
          View Medical Report
          <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
        </button>
      </div>

      <p className="mt-2.5 border-t border-white/[0.05] pt-2 font-mono text-[7px] uppercase tracking-[0.08em] text-slate-600">
        Differences are compared against configured thresholds and are not automatically emergencies ·
        simulated baseline for demonstration
      </p>
    </section>
  )
}
