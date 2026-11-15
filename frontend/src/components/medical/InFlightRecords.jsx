import {
  Activity,
  Bot,
  Clock,
  Droplets,
  HeartPulse,
  Info,
  MoonStar,
  Pill,
  Radiation,
  ShieldAlert,
  Stethoscope,
  Thermometer,
  TriangleAlert,
  Wind,
} from 'lucide-react'
import { useMission } from '../../context/MissionContext'
import { METRIC_ORDER, METRICS } from '../../data/missionData'
import { StatusPill, STATUS_ACCENT } from '../ui/StatusPill'

const ICONS = {
  heartRate: HeartPulse,
  spo2: Droplets,
  temperature: Thermometer,
  respiration: Wind,
  sleep: MoonStar,
  radiation: Radiation,
}

const SEVERITY = {
  critical: {
    icon: ShieldAlert,
    border: 'border-rose-400/25',
    bg: 'bg-rose-500/[0.06]',
    text: 'text-rose-300',
  },
  warning: {
    icon: TriangleAlert,
    border: 'border-amber-400/25',
    bg: 'bg-amber-400/[0.05]',
    text: 'text-amber-300',
  },
  info: {
    icon: Info,
    border: 'border-sky-400/20',
    bg: 'bg-sky-400/[0.04]',
    text: 'text-sky-300',
  },
}

function SectionShell({ icon: Icon, title, subtitle, badge, children, className = '' }) {
  return (
    <section className={`rounded-xl border border-white/[0.06] bg-white/[0.02] ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-white/[0.05] px-3.5 py-3">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-md border border-cyan-300/15 bg-cyan-400/[0.05] text-cyan-300/80">
            <Icon size={12} />
          </span>
          <div>
            <h3 className="panel-title text-[11px] font-semibold text-slate-200">{title}</h3>
            {subtitle && <p className="mt-0.5 text-[8.5px] text-slate-600">{subtitle}</p>}
          </div>
        </div>
        {badge}
      </div>
      <div className="p-3.5">{children}</div>
    </section>
  )
}

export function InFlightRecords() {
  const {
    selectedAstronaut,
    readings,
    previousReadings,
    metricStatuses,
    alerts,
    messages,
    activeScenario,
  } = useMission()

  const events = [
    ...(activeScenario
      ? [
          {
            id: 'active-event',
            time: 'Active now',
            title: activeScenario.title,
            severity: activeScenario.severity,
            summary: activeScenario.description,
            resolved: false,
            simulated: true,
          },
        ]
      : []),
    ...selectedAstronaut.inflight.emergencyEvents,
  ]

  return (
    <div className="space-y-3">
      <div className="glass-panel p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="eyebrow">Current mission telemetry</span>
              <StatusPill level="info" label="Simulated" />
            </div>
            <h2 className="panel-title mt-1 text-[15px] font-semibold text-slate-100">
              Current health readings
            </h2>
            <p className="mt-0.5 text-[9.5px] text-slate-500">
              {selectedAstronaut.name} · {selectedAstronaut.id} · live simulated values
            </p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/15 bg-emerald-400/[0.04] px-2 py-1 font-mono text-[7px] uppercase tracking-[0.1em] text-emerald-300/70">
            <Activity size={9} />
            Telemetry linked
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
          {METRIC_ORDER.map((key) => {
            const meta = METRICS[key]
            const Icon = ICONS[key] ?? Activity
            const status = metricStatuses[key]
            const delta = Number((readings[key] - previousReadings[key]).toFixed(meta.precision))
            return (
              <div key={key} className="rounded-lg border border-white/[0.06] bg-black/20 p-2.5">
                <div className="flex items-center justify-between">
                  <Icon size={12} style={{ color: STATUS_ACCENT[status.level]?.color }} />
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: STATUS_ACCENT[status.level]?.color }}
                  />
                </div>
                <div className="mt-2 font-mono text-[6.5px] uppercase tracking-[0.08em] text-slate-600">
                  {meta.label}
                </div>
                <div className="mt-0.5 flex items-baseline gap-1">
                  <span className="mono text-[16px] font-semibold text-slate-100">
                    {Number(readings[key]).toFixed(meta.precision)}
                  </span>
                  <span className="font-mono text-[6.5px] text-slate-500">{meta.unit}</span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span
                    className="font-mono text-[6.5px] uppercase tracking-[0.06em]"
                    style={{ color: STATUS_ACCENT[status.level]?.color }}
                  >
                    {status.label}
                  </span>
                  <span className="font-mono text-[6.5px] text-slate-600">
                    {delta > 0 ? '+' : ''}
                    {delta.toFixed(meta.precision)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <SectionShell
          icon={Clock}
          title="Previous health readings"
          subtitle="Comparison against the most recent simulated sample"
          badge={<span className="font-mono text-[7px] uppercase tracking-[0.08em] text-slate-600">6 signals</span>}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[340px] text-left">
              <thead>
                <tr className="border-b border-white/[0.06] font-mono text-[6.5px] uppercase tracking-[0.1em] text-slate-600">
                  <th className="pb-1.5 font-medium">Metric</th>
                  <th className="pb-1.5 text-right font-medium">Previous</th>
                  <th className="pb-1.5 text-right font-medium">Current</th>
                  <th className="pb-1.5 text-right font-medium">Change</th>
                  <th className="pb-1.5 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {METRIC_ORDER.map((key) => {
                  const meta = METRICS[key]
                  const delta = readings[key] - previousReadings[key]
                  const status = metricStatuses[key]
                  return (
                    <tr key={key} className="border-b border-white/[0.04] last:border-0">
                      <td className="py-1.5 text-[9px] text-slate-400">{meta.label}</td>
                      <td className="py-1.5 text-right font-mono text-[8.5px] text-slate-500">
                        {Number(previousReadings[key]).toFixed(meta.precision)}
                      </td>
                      <td className="py-1.5 text-right font-mono text-[8.5px] text-slate-200">
                        {Number(readings[key]).toFixed(meta.precision)}
                      </td>
                      <td className="py-1.5 text-right font-mono text-[8px] text-cyan-300/60">
                        {delta > 0 ? '+' : ''}
                        {delta.toFixed(meta.precision)}
                      </td>
                      <td className="py-1.5 text-right">
                        <span
                          className="font-mono text-[7px] uppercase tracking-[0.05em]"
                          style={{ color: STATUS_ACCENT[status.level]?.color }}
                        >
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-3 space-y-1 border-t border-white/[0.05] pt-2">
            <div className="font-mono text-[6.5px] uppercase tracking-[0.1em] text-slate-600">
              Earlier snapshots
            </div>
            {selectedAstronaut.inflight.previousSnapshots.map((snapshot) => (
              <div key={snapshot.label} className="flex items-center justify-between gap-2 text-[8px]">
                <span className="text-slate-600">{snapshot.label}</span>
                <span className="font-mono text-[7.5px] text-slate-400">{snapshot.reading}</span>
              </div>
            ))}
          </div>
        </SectionShell>

        <SectionShell
          icon={ShieldAlert}
          title="Health alerts"
          subtitle="Sensor and flight-surgeon escalation feed"
          badge={<StatusPill level={alerts.some((alert) => alert.severity === 'critical') ? 'critical' : 'warning'} label={`${alerts.length} entries`} />}
        >
          <div className="scroll-slim max-h-[280px] space-y-1.5 overflow-y-auto">
            {alerts.slice(0, 6).map((alert) => {
              const style = SEVERITY[alert.severity] ?? SEVERITY.info
              const Icon = style.icon
              return (
                <div key={alert.id} className={`rounded-lg border px-2.5 py-2 ${style.border} ${style.bg}`}>
                  <div className="flex items-start gap-2">
                    <Icon size={11} className={`mt-0.5 shrink-0 ${style.text}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[9.5px] font-medium leading-snug text-slate-200">
                          {alert.title}
                        </span>
                        <span className="shrink-0 font-mono text-[6.5px] text-slate-600">{alert.time}</span>
                      </div>
                      <p className="mt-0.5 text-[8.5px] leading-relaxed text-slate-500">
                        {alert.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </SectionShell>

        <SectionShell
          icon={Stethoscope}
          title="Emergency events"
          subtitle="Recorded drills and clinical escalations"
          badge={<span className="font-mono text-[7px] uppercase tracking-[0.08em] text-slate-600">Simulated history</span>}
        >
          <div className="space-y-2">
            {events.map((event) => (
              <div
                key={event.id}
                className={`rounded-lg border px-2.5 py-2 ${
                  event.resolved ? 'border-white/[0.06] bg-black/15' : 'border-rose-400/25 bg-rose-500/[0.06]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[9.5px] font-medium text-slate-200">{event.title}</span>
                  <span
                    className={`shrink-0 rounded border px-1 py-0.5 font-mono text-[6px] uppercase tracking-[0.08em] ${
                      event.resolved
                        ? 'border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-300/70'
                        : 'border-rose-400/25 bg-rose-500/10 text-rose-300'
                    }`}
                  >
                    {event.resolved ? 'Resolved' : event.severity}
                  </span>
                </div>
                <p className="mt-1 text-[8.5px] leading-relaxed text-slate-500">{event.summary}</p>
                <div className="mt-1 font-mono text-[6.5px] uppercase tracking-[0.08em] text-slate-600">
                  {event.time}
                </div>
              </div>
            ))}
          </div>
        </SectionShell>

        <SectionShell
          icon={Bot}
          title="AI medical assistant interactions"
          subtitle="Offline rule-engine conversation history"
          badge={<span className="font-mono text-[7px] uppercase tracking-[0.08em] text-cyan-200/40">{messages.length} messages</span>}
        >
          <div className="scroll-slim max-h-[280px] space-y-1.5 overflow-y-auto">
            {messages.slice(-6).map((message) => (
              <div
                key={message.id}
                className={`rounded-lg border px-2.5 py-2 ${
                  message.role === 'user'
                    ? 'border-cyan-300/15 bg-cyan-400/[0.04]'
                    : message.emergency
                      ? 'border-rose-400/20 bg-rose-500/[0.05]'
                      : 'border-white/[0.06] bg-black/15'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[6.5px] uppercase tracking-[0.1em] text-slate-500">
                    {message.role === 'user' ? 'Astronaut' : message.tag ?? 'Assistant'} · {message.time}
                  </span>
                  <span className="font-mono text-[6px] uppercase text-slate-600">
                    {message.role === 'user' ? 'Input' : 'Decision support'}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 whitespace-pre-line text-[8.5px] leading-relaxed text-slate-400">
                  {message.content}
                </p>
              </div>
            ))}
          </div>
        </SectionShell>

        <SectionShell
          icon={Pill}
          title="Medication records"
          subtitle="Active and available onboard medications"
          badge={<span className="font-mono text-[7px] uppercase tracking-[0.08em] text-slate-600">{selectedAstronaut.inflight.medications.length} entries</span>}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[360px] text-left">
              <thead>
                <tr className="border-b border-white/[0.06] font-mono text-[6.5px] uppercase tracking-[0.1em] text-slate-600">
                  <th className="pb-1.5 font-medium">Medication</th>
                  <th className="pb-1.5 font-medium">Dose</th>
                  <th className="pb-1.5 font-medium">Schedule</th>
                  <th className="pb-1.5 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {selectedAstronaut.inflight.medications.map((medication) => (
                  <tr key={medication.name} className="border-b border-white/[0.04] last:border-0">
                    <td className="py-1.5 text-[9px] text-slate-300">{medication.name}</td>
                    <td className="py-1.5 font-mono text-[8px] text-slate-500">{medication.dose}</td>
                    <td className="py-1.5 font-mono text-[7.5px] text-slate-500">{medication.schedule}</td>
                    <td className="py-1.5 text-right">
                      <span
                        className={`rounded border px-1 py-0.5 font-mono text-[6px] uppercase tracking-[0.06em] ${
                          medication.status === 'Active'
                            ? 'border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-300/80'
                            : 'border-sky-400/15 bg-sky-400/[0.04] text-sky-300/70'
                        }`}
                      >
                        {medication.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionShell>

        <SectionShell
          icon={Stethoscope}
          title="Health observations"
          subtitle="Crew and flight-surgeon notes"
          badge={<span className="font-mono text-[7px] uppercase tracking-[0.08em] text-slate-600">Latest 3</span>}
          className="xl:col-span-2"
        >
          <div className="grid gap-2 md:grid-cols-3">
            {selectedAstronaut.inflight.observations.map((observation) => (
              <div key={observation.time} className="rounded-lg border border-white/[0.06] bg-black/15 px-2.5 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[8.5px] font-medium text-slate-300">{observation.author}</span>
                  <span className="font-mono text-[6px] uppercase tracking-[0.05em] text-slate-600">
                    {observation.time}
                  </span>
                </div>
                <p className="mt-1 text-[8.5px] leading-relaxed text-slate-500">{observation.note}</p>
              </div>
            ))}
          </div>
        </SectionShell>
      </div>
    </div>
  )
}
