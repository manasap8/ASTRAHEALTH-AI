import {
  Activity,
  AlertTriangle,
  Atom,
  Radiation,
  Shield,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useMission } from '../context/MissionContext'
import { getStatus } from '../data/missionData'
import { SectionHeader } from '../components/ui/SectionHeader'
import { StatusPill, STATUS_ACCENT } from '../components/ui/StatusPill'

const SEVERITY = {
  critical: { icon: ShieldAlert, color: 'text-rose-300', border: 'border-rose-400/25', bg: 'bg-rose-500/[0.06]' },
  warning: { icon: AlertTriangle, color: 'text-amber-300', border: 'border-amber-400/25', bg: 'bg-amber-400/[0.05]' },
  info: { icon: Activity, color: 'text-sky-300', border: 'border-sky-400/20', bg: 'bg-sky-400/[0.04]' },
}

function DoseTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-amber-300/25 bg-[#081326] px-2.5 py-2 shadow-xl">
      <div className="font-mono text-[7px] uppercase tracking-[0.1em] text-slate-500">{label}</div>
      <div className="mt-1 font-mono text-[11px] text-amber-100">
        {payload[0].value} <span className="text-[7px] text-slate-500">mSv cumulative</span>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, unit, sub, tone = 'cyan' }) {
  const tones = {
    cyan: 'text-cyan-300 border-cyan-300/20 bg-cyan-400/[0.06]',
    amber: 'text-amber-300 border-amber-300/20 bg-amber-400/[0.06]',
    rose: 'text-rose-300 border-rose-300/20 bg-rose-500/[0.06]',
    emerald: 'text-emerald-300 border-emerald-300/20 bg-emerald-400/[0.06]',
  }
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
      <div className="flex items-center justify-between gap-2">
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg border ${tones[tone]}`}>
          <Icon size={13} />
        </span>
        <span className="font-mono text-[6.5px] uppercase tracking-[0.1em] text-slate-600">{label}</span>
      </div>
      <div className="mt-2.5 flex items-baseline gap-1">
        <span className="mono text-[1.35rem] font-semibold leading-none text-slate-100">{value}</span>
        <span className="font-mono text-[8px] text-slate-500">{unit}</span>
      </div>
      <div className="mt-1 font-mono text-[7px] uppercase tracking-[0.06em] text-slate-600">{sub}</div>
    </div>
  )
}

export function RadiationPage() {
  const { selectedAstronaut, readings, alerts, metricStatuses } = useMission()
  const dose = Number(readings.radiation)
  const status = getStatus('radiation', dose)
  const accent = STATUS_ACCENT[status.level]
  const history = selectedAstronaut.history.radiation
  const remaining = Math.max(0, 5 - dose)
  const dosePercent = Math.min(100, (dose / 5) * 100)
  const radiationAlerts = alerts.filter(
    (alert) =>
      alert.source?.toLowerCase().includes('dosimeter') ||
      alert.title?.toLowerCase().includes('radiation'),
  )

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-4">
      <div className="fade-up flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="eyebrow">Space weather &amp; dosimetry</span>
            <span className="rounded border border-amber-300/15 bg-amber-400/[0.05] px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-[0.1em] text-amber-200/70">
              Simulated readings
            </span>
          </div>
          <h1 className="panel-title mt-1 text-xl font-semibold text-slate-50">Radiation Monitoring</h1>
          <p className="mt-1 max-w-[680px] text-[11px] leading-relaxed text-slate-400">
            Cumulative dose and shield status for {selectedAstronaut.name} ({selectedAstronaut.id}).
            Thresholds are local prototype configuration, not clinical guidance.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill level={status.level} label={status.label} pulse={status.level !== 'normal'} />
          <span className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 font-mono text-[7.5px] uppercase tracking-[0.08em] text-slate-500">
            <ShieldCheck size={11} className="text-emerald-400/70" />
            Shield nominal
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <StatCard
          icon={Radiation}
          label="Current dose rate"
          value={selectedAstronaut.doseRate.toFixed(1)}
          unit="µSv/day"
          sub="Cabin dosimeter · simulated"
          tone={status.level === 'critical' ? 'rose' : status.level === 'warning' ? 'amber' : 'cyan'}
        />
        <StatCard
          icon={Atom}
          label="Cumulative exposure"
          value={dose.toFixed(2)}
          unit="mSv"
          sub="Mission to date · simulated"
          tone="amber"
        />
        <StatCard
          icon={Shield}
          label="To action level"
          value={remaining.toFixed(2)}
          unit="mSv"
          sub="5.00 mSv mission action level"
          tone={remaining < 1 ? 'rose' : remaining < 2 ? 'amber' : 'emerald'}
        />
        <StatCard
          icon={metricStatuses.radiation.level === 'critical' ? ShieldAlert : ShieldCheck}
          label="Exposure status"
          value={status.label}
          unit=""
          sub="Threshold-evaluated signal"
          tone={status.level === 'critical' ? 'rose' : status.level === 'warning' ? 'amber' : 'emerald'}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <section className="glass-panel p-4 sm:p-5 xl:col-span-8">
          <SectionHeader
            icon={Radiation}
            eyebrow="Mission exposure history"
            title="Cumulative radiation dose"
            description="Sol 188 to present · generated from the selected astronaut’s dosimeter sample."
            actions={
              <span className="flex items-center gap-1.5 rounded-full border border-amber-300/15 bg-amber-400/[0.04] px-2 py-1 font-mono text-[7px] uppercase tracking-[0.08em] text-amber-200/70">
                <span className="h-1 w-1 rounded-full bg-amber-400" />
                Warning ≥ 3 mSv
                <span className="ml-1 h-1 w-1 rounded-full bg-rose-400" />
                Action ≥ 5 mSv
              </span>
            }
          />
          <div className="mt-3 rounded-xl border border-white/[0.05] bg-black/15 p-2.5">
            <ResponsiveContainer width="100%" height={270}>
              <AreaChart data={history} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="radiation-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(148,180,220,0.06)" vertical={false} />
                <XAxis dataKey="sol" interval={2} tickLine={false} axisLine={false} dy={4} />
                <YAxis
                  domain={[0, 6]}
                  ticks={[0, 1, 2, 3, 4, 5, 6]}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <Tooltip content={<DoseTooltip />} cursor={{ stroke: 'rgba(251,191,36,0.2)' }} />
                <ReferenceLine
                  y={3}
                  stroke="#fbbf24"
                  strokeOpacity={0.55}
                  strokeDasharray="4 4"
                  label={{ value: 'Warning', position: 'insideTopRight', fill: '#fbbf24', fontSize: 8 }}
                />
                <ReferenceLine
                  y={5}
                  stroke="#fb7185"
                  strokeOpacity={0.6}
                  strokeDasharray="4 4"
                  label={{ value: 'Action level', position: 'insideTopRight', fill: '#fb7185', fontSize: 8 }}
                />
                <Area
                  type="monotone"
                  dataKey="dose"
                  name="Cumulative dose"
                  stroke="#fbbf24"
                  strokeWidth={2}
                  fill="url(#radiation-area)"
                  dot={false}
                  activeDot={{ r: 3.5, fill: '#fde68a', stroke: '#081326', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 font-mono text-[6.5px] uppercase tracking-[0.08em] text-slate-600">
            Historical dose is sample data · chart updates with the selected astronaut, not with live
            mission telemetry
          </p>
        </section>

        <section className="glass-panel p-4 sm:p-5 xl:col-span-4">
          <SectionHeader
            icon={Shield}
            title="Configured thresholds"
            description="Local prototype values used for exposure status."
          />
          <div className="mt-3 space-y-2">
            {[
              { label: 'Routine monitoring', range: '< 3.00 mSv', tone: 'emerald', note: 'No action beyond routine dosimetry.' },
              { label: 'Warning band', range: '3.00 – 4.99 mSv', tone: 'amber', note: 'Increase shielding review and log dose rate.' },
              { label: 'Mission action level', range: '≥ 5.00 mSv', tone: 'rose', note: 'Flight-surgeon and radiation-surgeon review.' },
            ].map((threshold) => {
              const tones = {
                emerald: 'border-emerald-400/20 bg-emerald-400/[0.04] text-emerald-300',
                amber: 'border-amber-400/20 bg-amber-400/[0.04] text-amber-300',
                rose: 'border-rose-400/25 bg-rose-500/[0.05] text-rose-300',
              }
              return (
                <div key={threshold.label} className={`rounded-lg border p-2.5 ${tones[threshold.tone]}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9.5px] font-medium">{threshold.label}</span>
                    <span className="font-mono text-[7.5px]">{threshold.range}</span>
                  </div>
                  <p className="mt-1 text-[8px] leading-relaxed text-slate-500">{threshold.note}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between font-mono text-[6.5px] uppercase tracking-[0.1em] text-slate-600">
              <span>Cumulative dose progress</span>
              <span style={{ color: accent.color }}>{dose.toFixed(2)} / 5.00 mSv</span>
            </div>
            <div className="relative h-3 overflow-hidden rounded-full border border-white/[0.05] bg-[#0a1526]">
              <div className="absolute inset-y-0 left-0 w-3/5 bg-amber-400/[0.08]" />
              <div className="absolute inset-y-0 left-3/5 right-0 bg-rose-500/[0.08]" />
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-400/50 via-amber-400/70 to-amber-400/80 transition-all duration-700"
                style={{ width: `${dosePercent}%` }}
              />
              <div
                className="absolute top-1/2 h-4 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-white/90 shadow-[0_0_8px_rgba(251,191,36,0.7)]"
                style={{ left: `${dosePercent}%` }}
              />
            </div>
            <div className="mt-1 flex items-center justify-between font-mono text-[6.5px] text-slate-600">
              <span>0</span>
              <span>3 mSv warning</span>
              <span>5 mSv action</span>
            </div>
          </div>

          <div className="mt-4 border-t border-white/[0.06] pt-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-[7px] uppercase tracking-[0.1em] text-slate-600">
                Radiation alert notifications
              </span>
              <span className="font-mono text-[7px] text-slate-600">{radiationAlerts.length}</span>
            </div>
            <div className="space-y-1.5">
              {radiationAlerts.length === 0 && (
                <div className="rounded-lg border border-emerald-400/15 bg-emerald-400/[0.04] px-2.5 py-2 text-[8.5px] text-emerald-200/70">
                  No active radiation alerts for this astronaut.
                </div>
              )}
              {radiationAlerts.map((alert) => {
                const tone = SEVERITY[alert.severity] ?? SEVERITY.info
                const Icon = tone.icon
                return (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-2 rounded-lg border ${tone.border} ${tone.bg} px-2.5 py-2`}
                  >
                    <Icon size={11} className={`mt-0.5 shrink-0 ${tone.color}`} />
                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[9px] font-medium leading-snug text-slate-200">
                          {alert.title}
                        </span>
                        <span className="shrink-0 font-mono text-[6.5px] text-slate-600">{alert.time}</span>
                      </div>
                      <p className="mt-0.5 text-[8px] leading-relaxed text-slate-500">{alert.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </div>

      <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] px-4 py-3 font-mono text-[7px] uppercase leading-relaxed tracking-[0.08em] text-slate-600">
        Simulated dosimetry for demonstration only · threshold values are configurable prototype
        examples · follow mission radiation-surgeon standing orders
      </div>
    </div>
  )
}
