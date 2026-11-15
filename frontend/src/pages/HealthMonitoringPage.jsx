import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Droplets,
  HeartPulse,
  Info,
  MoonStar,
  ShieldCheck,
  Thermometer,
  TriangleAlert,
  Wind,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useMission } from '../context/MissionContext'
import { METRICS } from '../data/missionData'
import { HealthCard } from '../components/dashboard/HealthCard'
import { SectionHeader } from '../components/ui/SectionHeader'
import { StatusPill, STATUS_ACCENT } from '../components/ui/StatusPill'
import { buildComparison } from '../lib/comparison'

const CARD_METRICS = ['heartRate', 'spo2', 'temperature', 'respiration', 'sleep']

const ICONS = {
  heartRate: HeartPulse,
  spo2: Droplets,
  temperature: Thermometer,
  respiration: Wind,
  sleep: MoonStar,
}

const ABNORMAL_HINTS = {
  heartRate: 'Configured flight threshold: 60–100 BPM. Review rhythm, hydration and recent exertion.',
  spo2: 'Configured flight threshold: SpO₂ ≥ 95%. Verify sensor contact and cabin oxygen partial pressure.',
  temperature: 'Configured flight threshold: 36.0–37.5 °C. Increase fluids and recheck in 15 minutes.',
  respiration: 'Configured flight threshold: 12–20 br/min. Assess work of breathing and subjective breathlessness.',
  sleep: 'Configured flight target: ≥ 7 hours. Review sleep continuity and circadian protocol.',
}

function ChartTip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-cyan-300/25 bg-[#081326] px-2.5 py-2 shadow-xl">
      <div className="font-mono text-[7px] uppercase tracking-[0.12em] text-slate-500">{label}</div>
      {payload.map((entry) => (
        <div key={entry.name} className="mt-1 flex items-center gap-3 text-[9px]">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-400">{entry.name}</span>
          <span className="ml-auto font-mono text-slate-100">
            {entry.value}
            <span className="ml-0.5 text-[7px] text-slate-500">{unit}</span>
          </span>
        </div>
      ))}
    </div>
  )
}

function ChartShell({ title, subtitle, latest, children, icon: Icon, className = '' }) {
  return (
    <div className={`rounded-xl border border-white/[0.06] bg-black/15 p-3 ${className}`}>
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-md border border-cyan-300/15 bg-cyan-400/[0.05] text-cyan-300/80">
            <Icon size={11} />
          </span>
          <div>
            <h3 className="panel-title text-[10.5px] font-semibold text-slate-200">{title}</h3>
            <p className="mt-0.5 font-mono text-[6.5px] uppercase tracking-[0.08em] text-slate-600">
              {subtitle}
            </p>
          </div>
        </div>
        <span className="rounded border border-white/[0.06] bg-white/[0.02] px-1.5 py-0.5 font-mono text-[7.5px] text-slate-400">
          {latest}
        </span>
      </div>
      {children}
    </div>
  )
}

export function HealthMonitoringPage({ onNavigate }) {
  const {
    selectedAstronaut,
    readings,
    previousReadings,
    metricStatuses,
    alerts,
    activeScenario,
  } = useMission()
  const comparison = buildComparison(readings, selectedAstronaut.preFlight.baseline)
  const vitals = selectedAstronaut.history.vitals
  const sleepHistory = selectedAstronaut.history.sleep
  const abnormal = CARD_METRICS.filter((key) => metricStatuses[key].level !== 'normal')
  const meaningfulComparison = comparison.filter((metric) => metric.meaningful)

  const cardSeries = {
    heartRate: vitals.slice(-10).map((point) => point.bpm),
    spo2: vitals.slice(-10).map((point) => point.spo2),
    temperature: vitals.slice(-9).map((point) => point.temperature),
    respiration: vitals.slice(-9).map((point) => point.respiration),
    sleep: sleepHistory.map((day) => day.hours),
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4">
      <div className="fade-up flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="eyebrow">Physiological surveillance</span>
            <span className="rounded border border-amber-300/15 bg-amber-400/[0.05] px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-[0.1em] text-amber-200/70">
              Simulated telemetry
            </span>
          </div>
          <h1 className="panel-title mt-1 text-xl font-semibold text-slate-50">Health Monitoring</h1>
          <p className="mt-1 max-w-[700px] text-[11px] leading-relaxed text-slate-400">
            Live simulated physiology for {selectedAstronaut.name} ({selectedAstronaut.id}), with
            historical trends and an individual pre-flight comparison.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 font-mono text-[7.5px] uppercase tracking-[0.08em] text-slate-500">
            <Activity size={11} className="text-cyan-300/70" />
            Live update · 6s
          </span>
          <StatusPill
            level={activeScenario ? 'critical' : 'normal'}
            label={activeScenario ? 'Emergency simulation' : 'Monitoring active'}
            pulse
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        {CARD_METRICS.map((key, index) => (
          <HealthCard
            key={key}
            meta={METRICS[key]}
            value={readings[key]}
            previous={previousReadings[key]}
            status={metricStatuses[key]}
            icon={ICONS[key]}
            series={cardSeries[key]}
            index={index}
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <section className="glass-panel p-4 sm:p-5 xl:col-span-8">
          <SectionHeader
            icon={BarChart3}
            eyebrow="Pre-flight vs in-flight"
            title="Health baseline comparison"
            description={`Individual baseline for ${selectedAstronaut.name} · ${selectedAstronaut.preFlight.examinationDate}`}
            actions={<StatusPill level="info" label="Threshold-aware" />}
          />

          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-white/[0.07] font-mono text-[6.5px] uppercase tracking-[0.1em] text-slate-600">
                  <th className="pb-2 font-medium">Metric</th>
                  <th className="pb-2 text-right font-medium">Pre-flight</th>
                  <th className="pb-2 text-right font-medium">Current</th>
                  <th className="pb-2 text-right font-medium">Difference</th>
                  <th className="pb-2 text-right font-medium">% change</th>
                  <th className="pb-2 pl-4 font-medium">Monitoring status</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((metric) => {
                  const Icon = ICONS[metric.key]
                  const accent = STATUS_ACCENT[metric.monitoring.level] ?? STATUS_ACCENT.normal
                  const deviation = Math.min(100, (Math.abs(metric.percentChange) / 50) * 100)
                  return (
                    <tr key={metric.key} className="border-b border-white/[0.04] last:border-0">
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <Icon size={13} style={{ color: accent.color }} />
                          <div>
                            <div className="text-[9.5px] text-slate-300">{metric.label}</div>
                            <div className="font-mono text-[6.5px] uppercase tracking-[0.06em] text-slate-600">
                              {metric.unit}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 text-right font-mono text-[9px] text-slate-500">
                        {metric.baseline.toFixed(metric.decimals)}
                      </td>
                      <td className="py-2.5 text-right font-mono text-[9.5px] font-medium text-slate-200">
                        {metric.current.toFixed(metric.decimals)}
                      </td>
                      <td className="py-2.5 text-right">
                        <span
                          className={`font-mono text-[9px] ${
                            metric.difference === 0 ? 'text-slate-500' : 'text-cyan-200/80'
                          }`}
                        >
                          {metric.difference > 0 ? '+' : ''}
                          {metric.difference.toFixed(metric.decimals)}
                        </span>
                        <div className="mt-1 ml-auto h-1 w-16 overflow-hidden rounded-full bg-white/[0.05]">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${Math.max(deviation, 3)}%`, backgroundColor: accent.color }}
                          />
                        </div>
                      </td>
                      <td className="py-2.5 text-right font-mono text-[9px] text-slate-400">
                        {metric.meaningful
                          ? `${metric.percentChange > 0 ? '+' : ''}${metric.percentChange}%`
                          : <span className="text-slate-600">n/a</span>}
                      </td>
                      <td className="py-2.5 pl-4">
                        <StatusPill level={metric.monitoring.level} label={metric.monitoring.label} />
                        <div className="mt-1 font-mono text-[6.5px] uppercase tracking-[0.05em] text-slate-600">
                          Current: {metric.clinicalStatus.label}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-3 rounded-lg border border-white/[0.05] bg-black/15 p-2.5">
            <div className="mb-1 flex items-center justify-between font-mono text-[6.5px] uppercase tracking-[0.1em] text-slate-600">
              <span>Deviation from pre-flight baseline</span>
              <span>Meaningful percentage metrics</span>
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart
                data={meaningfulComparison}
                layout="vertical"
                margin={{ top: 2, right: 12, left: 4, bottom: 2 }}
              >
                <CartesianGrid stroke="rgba(148,180,220,0.06)" horizontal={false} />
                <XAxis
                  type="number"
                  domain={[-25, 80]}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={84}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 8 }}
                />
                <Tooltip content={<ChartTip unit="%" />} cursor={{ fill: 'rgba(34,211,238,0.04)' }} />
                <ReferenceLine x={0} stroke="rgba(148,180,220,0.3)" />
                <Bar dataKey="percentChange" name="Deviation" radius={[0, 3, 3, 0]} barSize={12}>
                  {meaningfulComparison.map((metric) => (
                    <Cell
                      key={metric.key}
                      fill={STATUS_ACCENT[metric.monitoring.level]?.color ?? '#22d3ee'}
                      fillOpacity={0.75}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="mt-2 flex items-start gap-1.5 font-mono text-[6.5px] uppercase leading-relaxed tracking-[0.06em] text-slate-600">
            <Info size={9} className="mt-0.5 shrink-0 text-cyan-300/40" />
            A baseline difference is not automatically an emergency. Clinical status uses configured
            thresholds and should be interpreted with symptoms and flight-surgeon review.
          </p>
        </section>

        <section className="glass-panel p-4 sm:p-5 xl:col-span-4">
          <SectionHeader
            icon={TriangleAlert}
            title="Abnormal reading alerts"
            description="Current signals outside flight thresholds."
            actions={
              <span className="rounded border border-white/[0.06] bg-white/[0.02] px-1.5 py-0.5 font-mono text-[7px] text-slate-500">
                {abnormal.length} active
              </span>
            }
          />

          <div className="mt-3 space-y-2">
            {abnormal.length === 0 && (
              <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/[0.04] p-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span className="text-[10px] font-medium text-emerald-200">
                    All monitored signals within thresholds
                  </span>
                </div>
                <p className="mt-1 pl-6 text-[8.5px] leading-relaxed text-slate-500">
                  Continue routine monitoring. Simulated values refresh every six seconds.
                </p>
              </div>
            )}
            {abnormal.map((key) => {
              const meta = METRICS[key]
              const status = metricStatuses[key]
              const Icon = ICONS[key]
              const accent = STATUS_ACCENT[status.level]
              return (
                <div
                  key={key}
                  className="rounded-lg border p-2.5"
                  style={{
                    borderColor: `${accent.color}40`,
                    backgroundColor: `${accent.color}0d`,
                  }}
                >
                  <div className="flex items-start gap-2">
                    <Icon size={14} className="mt-0.5 shrink-0" style={{ color: accent.color }} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-medium text-slate-200">{meta.label}</span>
                        <StatusPill level={status.level} label={status.label} />
                      </div>
                      <div className="mt-1 font-mono text-[9px] text-slate-400">
                        Current {Number(readings[key]).toFixed(meta.precision)} {meta.unit}
                      </div>
                      <p className="mt-1 text-[8.5px] leading-relaxed text-slate-500">
                        {ABNORMAL_HINTS[key]}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-3 rounded-lg border border-white/[0.06] bg-black/15 p-2.5">
            <div className="flex items-center justify-between font-mono text-[6.5px] uppercase tracking-[0.1em] text-slate-600">
              <span>Mission alert feed</span>
              <span className="text-cyan-200/50">{alerts.length} entries</span>
            </div>
            <div className="mt-1.5 space-y-1">
              {alerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="flex items-center gap-1.5 text-[8px]">
                  <span
                    className="h-1 w-1 shrink-0 rounded-full"
                    style={{ backgroundColor: STATUS_ACCENT[alert.severity]?.color ?? '#38bdf8' }}
                  />
                  <span className="truncate text-slate-400">{alert.title}</span>
                  <span className="ml-auto shrink-0 font-mono text-[6.5px] text-slate-600">{alert.time}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('ai-assistant')}
            className="btn-ghost mt-3 h-9 w-full text-[10px]"
          >
            Discuss with AI Medical Assistant
            <ArrowUpRight size={12} className="text-cyan-300/80" />
          </button>
        </section>
      </div>

      <section className="glass-panel p-4 sm:p-5">
        <SectionHeader
          icon={Activity}
          eyebrow="24-hour / 7-day history"
          title="Historical trends"
          description="Simulated longitudinal telemetry generated for this prototype."
          actions={<StatusPill level="info" label="Sample history" />}
        />
        <div className="mt-3 grid gap-2.5 lg:grid-cols-2">
          <ChartShell
            icon={HeartPulse}
            title="Heart rate"
            subtitle="Last 24 hours · BPM"
            latest={`${Math.round(readings.heartRate)} now`}
          >
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={vitals} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="hm-hr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(148,180,220,0.06)" vertical={false} />
                <XAxis dataKey="time" interval={3} tickLine={false} axisLine={false} />
                <YAxis domain={[40, 150]} tickLine={false} axisLine={false} width={40} />
                <Tooltip content={<ChartTip unit="BPM" />} cursor={{ stroke: 'rgba(34,211,238,0.2)' }} />
                <ReferenceLine y={100} stroke="#fbbf24" strokeOpacity={0.35} strokeDasharray="3 4" />
                <Area
                  type="monotone"
                  dataKey="bpm"
                  name="Heart rate"
                  stroke="#22d3ee"
                  strokeWidth={1.7}
                  fill="url(#hm-hr)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartShell>

          <ChartShell
            icon={Droplets}
            title="Blood oxygen"
            subtitle="Last 24 hours · SpO₂"
            latest={`${Math.round(readings.spo2)}% now`}
          >
            <ResponsiveContainer width="100%" height={150}>
              <ComposedChart data={vitals} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(148,180,220,0.06)" vertical={false} />
                <XAxis dataKey="time" interval={3} tickLine={false} axisLine={false} />
                <YAxis domain={[85, 100]} tickLine={false} axisLine={false} width={40} />
                <Tooltip content={<ChartTip unit="%" />} cursor={{ stroke: 'rgba(59,130,246,0.2)' }} />
                <ReferenceLine y={95} stroke="#fbbf24" strokeOpacity={0.35} strokeDasharray="3 4" />
                <Line
                  type="monotone"
                  dataKey="spo2"
                  name="SpO₂"
                  stroke="#60a5fa"
                  strokeWidth={1.8}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartShell>

          <ChartShell
            icon={Thermometer}
            title="Body temperature"
            subtitle="Last 24 hours · °C"
            latest={`${Number(readings.temperature).toFixed(1)} °C now`}
          >
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={vitals} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="hm-temp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.24} />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(148,180,220,0.06)" vertical={false} />
                <XAxis dataKey="time" interval={3} tickLine={false} axisLine={false} />
                <YAxis domain={[35.5, 39]} tickLine={false} axisLine={false} width={40} />
                <Tooltip content={<ChartTip unit="°C" />} cursor={{ stroke: 'rgba(251,191,36,0.2)' }} />
                <ReferenceLine y={37.5} stroke="#fb7185" strokeOpacity={0.35} strokeDasharray="3 4" />
                <Area
                  type="monotone"
                  dataKey="temperature"
                  name="Temperature"
                  stroke="#fbbf24"
                  strokeWidth={1.7}
                  fill="url(#hm-temp)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartShell>

          <ChartShell
            icon={MoonStar}
            title="Sleep duration"
            subtitle="Last 7 days · hours"
            latest={`${Number(readings.sleep).toFixed(1)} h today`}
          >
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={sleepHistory} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(148,180,220,0.06)" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis domain={[0, 10]} tickLine={false} axisLine={false} width={40} />
                <Tooltip content={<ChartTip unit="hrs" />} cursor={{ fill: 'rgba(34,211,238,0.04)' }} />
                <ReferenceLine y={7.5} stroke="#fbbf24" strokeOpacity={0.35} strokeDasharray="3 4" />
                <Bar dataKey="hours" name="Sleep" radius={[3, 3, 0, 0]}>
                  {sleepHistory.map((entry) => (
                    <Cell key={entry.day} fill={entry.hours < 7 ? '#f59e0b' : '#22d3ee'} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartShell>
        </div>
        <p className="mt-2 font-mono text-[6.5px] uppercase tracking-[0.08em] text-slate-600">
          All historical values are generated for the prototype · amber lines mark configured warning
          thresholds
        </p>
      </section>
    </div>
  )
}
