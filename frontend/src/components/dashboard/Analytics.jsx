import {
  Area,
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
import { BarChart3, MoonStar, Radiation, TrendingUp } from 'lucide-react'
import { useMission } from '../../context/MissionContext'
import { SectionHeader } from '../ui/SectionHeader'
import { StatusPill } from '../ui/StatusPill'

function ChartTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-cyan-300/25 bg-[#081326] px-3 py-2 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.95)]">
      <div className="font-mono text-[8px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className="mt-1.5 space-y-1">
        {payload.map((entry) => (
          <div key={entry.dataKey ?? entry.name} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: entry.payload?.fill ?? entry.color ?? '#22d3ee' }}
              />
              {entry.name}
            </span>
            <span className="font-mono text-[10px] font-medium text-slate-100">
              {entry.value}
              <span className="ml-0.5 text-[8px] text-slate-500">{unit}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ChartCard({ title, meta, badge, legend, children, ariaLabel }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3">
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="panel-title text-[11px] font-semibold text-slate-200">{title}</h3>
            {badge}
          </div>
          <div className="mt-0.5 font-mono text-[7.5px] uppercase tracking-[0.12em] text-slate-600">{meta}</div>
        </div>
        {legend && <div className="flex items-center gap-3 pt-0.5">{legend}</div>}
      </div>
      <div role="img" aria-label={ariaLabel} className="w-full">
        {children}
      </div>
    </div>
  )
}

function LegendDot({ color, label, dashed = false }) {
  return (
    <span className="flex items-center gap-1.5 font-mono text-[7.5px] uppercase tracking-[0.1em] text-slate-500">
      <span
        className={`h-[2px] w-3 rounded-full ${dashed ? 'opacity-70' : ''}`}
        style={{
          backgroundColor: dashed ? 'transparent' : color,
          backgroundImage: dashed
            ? `repeating-linear-gradient(90deg, ${color} 0 3px, transparent 3px 5px)`
            : undefined,
        }}
      />
      {label}
    </span>
  )
}

export function Analytics() {
  const { readings, selectedAstronaut } = useMission()
  const heartRateHistory = selectedAstronaut.history.vitals
  const sleepHistory = selectedAstronaut.history.sleep
  const radiationHistory = selectedAstronaut.history.radiation
  const averageHr = Math.round(
    heartRateHistory.reduce((sum, point) => sum + point.bpm, 0) / heartRateHistory.length,
  )
  const latestDose = radiationHistory[radiationHistory.length - 1].dose

  return (
    <section className="glass-panel p-4 sm:p-5">
      <SectionHeader
        icon={BarChart3}
        eyebrow="Longitudinal telemetry"
        title="Health analytics"
        description={`Simulated trends for ${selectedAstronaut.name} · flight-surgeon review.`}
        actions={<StatusPill level="info" label="Simulated history" />}
      />

      <div className="mt-4 space-y-2.5">
        <ChartCard
          title="Heart rate"
          meta="Last 24 hours · 1 h resolution"
          badge={
            <span className="flex items-center gap-1 rounded border border-cyan-300/15 bg-cyan-400/[0.05] px-1.5 py-0.5 font-mono text-[7px] text-cyan-200/80">
              <TrendingUp size={8} />
              avg {averageHr} BPM
            </span>
          }
          legend={
            <>
              <LegendDot color="#22d3ee" label="Measured" />
              <LegendDot color="#64748b" label="Resting" dashed />
            </>
          }
          ariaLabel="Simulated 24-hour heart rate chart"
        >
          <ResponsiveContainer width="100%" height={158}>
            <ComposedChart data={heartRateHistory} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="hr-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.32} />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(148,180,220,0.07)" vertical={false} />
              <XAxis dataKey="time" interval={3} tickLine={false} axisLine={false} dy={5} />
              <YAxis domain={[40, 140]} ticks={[40, 80, 120]} tickLine={false} axisLine={false} width={40} />
              <Tooltip content={<ChartTooltip unit="BPM" />} cursor={{ stroke: 'rgba(34,211,238,0.18)' }} />
              <ReferenceLine y={100} stroke="#fbbf24" strokeOpacity={0.3} strokeDasharray="3 5" />
              <Area
                type="monotone"
                dataKey="bpm"
                name="Measured"
                stroke="#22d3ee"
                strokeWidth={1.8}
                fill="url(#hr-area)"
                dot={false}
                activeDot={{ r: 3.5, fill: '#67e8f9', stroke: '#081326', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="resting"
                name="Resting"
                stroke="#64748b"
                strokeWidth={1}
                strokeDasharray="4 4"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="grid gap-2.5 md:grid-cols-2">
          <ChartCard
            title="Sleep duration"
            meta="Last 7 days · target 7.5 h"
            badge={
              <span className="rounded border border-cyan-300/15 bg-cyan-400/[0.05] px-1.5 py-0.5 font-mono text-[7px] text-cyan-200/80">
                {Number(readings.sleep).toFixed(1)} h today
              </span>
            }
            ariaLabel="Simulated seven-day sleep duration chart"
          >
            <ResponsiveContainer width="100%" height={128}>
              <BarChart data={sleepHistory} margin={{ top: 6, right: 4, left: -22, bottom: 0 }} barCategoryGap="28%">
                <CartesianGrid stroke="rgba(148,180,220,0.06)" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} dy={4} />
                <YAxis domain={[0, 10]} ticks={[0, 5, 10]} tickLine={false} axisLine={false} width={38} />
                <Tooltip content={<ChartTooltip unit="hrs" />} cursor={{ fill: 'rgba(34,211,238,0.05)' }} />
                <ReferenceLine y={7.5} stroke="#fbbf24" strokeOpacity={0.45} strokeDasharray="3 4" />
                <Bar dataKey="hours" name="Sleep" radius={[3, 3, 0, 0]}>
                  {sleepHistory.map((entry) => (
                    <Cell key={entry.day} fill={entry.hours < 7 ? '#f59e0b' : '#22d3ee'} fillOpacity={entry.hours < 7 ? 0.7 : 0.86} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Radiation exposure"
            meta="Mission history · cumulative"
            badge={
              <span className="flex items-center gap-1 rounded border border-amber-300/15 bg-amber-400/[0.05] px-1.5 py-0.5 font-mono text-[7px] text-amber-200/80">
                <Radiation size={8} />
                {latestDose} mSv
              </span>
            }
            ariaLabel="Simulated cumulative radiation dose chart"
          >
            <ResponsiveContainer width="100%" height={128}>
              <ComposedChart data={radiationHistory} margin={{ top: 6, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="rad-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(148,180,220,0.06)" vertical={false} />
                <XAxis dataKey="sol" interval={4} tickLine={false} axisLine={false} dy={4} />
                <YAxis domain={[0, 6]} ticks={[0, 2, 4, 6]} tickLine={false} axisLine={false} width={38} />
                <Tooltip content={<ChartTooltip unit="mSv" />} cursor={{ stroke: 'rgba(251,191,36,0.18)' }} />
                <ReferenceLine y={5} stroke="#fb7185" strokeOpacity={0.45} strokeDasharray="3 4" />
                <Area
                  type="monotone"
                  dataKey="dose"
                  name="Cumulative dose"
                  stroke="#fbbf24"
                  strokeWidth={1.7}
                  fill="url(#rad-area)"
                  dot={false}
                  activeDot={{ r: 3, fill: '#fde68a', stroke: '#081326', strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 font-mono text-[7px] uppercase tracking-[0.1em] text-slate-600">
        <span className="flex items-center gap-1.5">
          <MoonStar size={9} className="text-cyan-300/50" />
          Historical data is generated for the prototype
        </span>
        <span>Amber bars = below sleep target</span>
      </div>
    </section>
  )
}
