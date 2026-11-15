import {
  ArrowDownUp,
  BatteryCharging,
  Droplets,
  HeartPulse,
  MoonStar,
  Radiation,
  Thermometer,
  Wind,
} from 'lucide-react'
import { useMission } from '../../context/MissionContext'
import { METRIC_ORDER, METRICS } from '../../data/missionData'
import { HealthCard } from './HealthCard'
import { StatusPill } from '../ui/StatusPill'

const ICONS = {
  heart: HeartPulse,
  oxygen: Droplets,
  temperature: Thermometer,
  respiration: Wind,
  sleep: MoonStar,
  radiation: Radiation,
}

export function HealthOverview() {
  const {
    readings,
    previousReadings,
    metricStatuses,
    activeScenario,
    selectedAstronaut,
  } = useMission()

  const vitals = selectedAstronaut.history.vitals
  const series = {
    heartRate: vitals.slice(-10).map((point) => point.bpm),
    spo2: vitals.slice(-10).map((point) => point.spo2),
    temperature: vitals.slice(-9).map((point) => point.temperature),
    respiration: vitals.slice(-9).map((point) => point.respiration),
    sleep: selectedAstronaut.history.sleep.map((day) => day.hours),
    radiation: selectedAstronaut.history.radiation.map((point) => point.dose),
  }

  return (
    <section aria-labelledby="health-overview-title">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="eyebrow">
              Crew physiology · {selectedAstronaut.id} · {selectedAstronaut.name}
            </span>
            <span className="rounded border border-cyan-300/20 bg-cyan-400/[0.06] px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-[0.12em] text-cyan-200/80">
              Simulated data
            </span>
          </div>
          <h2 id="health-overview-title" className="panel-title mt-1 text-lg font-semibold text-slate-50">
            Health overview
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden font-mono text-[8px] uppercase tracking-[0.12em] text-slate-500 sm:inline">
            6 signals · 6s refresh
          </span>
          <StatusPill
            level={activeScenario ? 'critical' : 'normal'}
            label={activeScenario ? 'Emergency simulation' : 'Telemetry nominal'}
            pulse
          />
          <span className="hidden items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-1 font-mono text-[8px] text-slate-500 md:flex">
            <ArrowDownUp size={10} className="text-cyan-300/70" />
            vs previous reading
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {METRIC_ORDER.map((key, index) => (
          <HealthCard
            key={key}
            meta={METRICS[key]}
            value={readings[key]}
            previous={previousReadings[key]}
            status={metricStatuses[key]}
            icon={ICONS[METRICS[key].icon] ?? BatteryCharging}
            series={series[key]}
            index={index}
          />
        ))}
      </div>
    </section>
  )
}
