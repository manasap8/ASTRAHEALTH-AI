import { BrainCircuit, ShieldCheck, Users } from 'lucide-react'
import { useMission } from '../../context/MissionContext'
import { MISSION } from '../../data/missionData'
import { HealthOverview } from './HealthOverview'
import { PreFlightBaselineCard } from './PreFlightBaselineCard'
import { DigitalTwin } from './DigitalTwin'
import { Analytics } from './Analytics'
import { AIAssistant } from './AIAssistant'
import { AlertsPanel } from './AlertsPanel'
import { SensorPanel } from './SensorPanel'
import { MissionInfo } from './MissionInfo'

export function Dashboard({ onNavigate }) {
  const { activeScenario, selectedAstronaut } = useMission()

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4">
      <div className="fade-up flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="eyebrow">Flight deck · Sol {MISSION.day}</span>
            <span className="h-2.5 w-px bg-slate-700" />
            <span className="flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-slate-500">
              <span className={`h-1.5 w-1.5 rounded-full ${activeScenario ? 'bg-rose-400' : 'bg-emerald-400'}`} />
              {activeScenario ? 'Simulated emergency active' : 'All systems nominal'}
            </span>
          </div>
          <h1 className="panel-title mt-1.5 text-xl font-semibold tracking-[-0.01em] text-slate-50 sm:text-[1.35rem]">
            Astronaut health overview
          </h1>
          <p className="mt-1 text-[11.5px] text-slate-400">
            Autonomous physiological surveillance and medical decision support for the Mars crew.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.025] px-2.5 py-1.5">
            <Users size={12} className="text-cyan-300/70" />
            <div className="leading-tight">
              <div className="font-mono text-[6.5px] uppercase tracking-[0.12em] text-slate-600">Selected crew</div>
              <div className="font-mono text-[9px] text-slate-300">{selectedAstronaut.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.025] px-2.5 py-1.5">
            <BrainCircuit size={12} className="text-blue-300/70" />
            <div className="leading-tight">
              <div className="font-mono text-[6.5px] uppercase tracking-[0.12em] text-slate-600">AI core</div>
              <div className="font-mono text-[9px] text-slate-300">Offline ready</div>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-lg border border-amber-300/15 bg-amber-400/[0.045] px-2.5 py-1.5 sm:flex">
            <ShieldCheck size={12} className="text-amber-300/80" />
            <div className="leading-tight">
              <div className="font-mono text-[6.5px] uppercase tracking-[0.12em] text-amber-200/50">Data mode</div>
              <div className="font-mono text-[9px] text-amber-100/80">Simulated</div>
            </div>
          </div>
        </div>
      </div>

      <HealthOverview />

      <PreFlightBaselineCard
        onViewReport={() => onNavigate('medical-history', { tab: 'preflight', openReport: true })}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <DigitalTwin />
        </div>
        <div className="xl:col-span-5">
          <AIAssistant onOpenAssistant={() => onNavigate('ai-assistant')} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <Analytics />
        </div>
        <div className="xl:col-span-5">
          <AlertsPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <SensorPanel />
        </div>
        <div className="xl:col-span-5">
          <MissionInfo />
        </div>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.05] pb-2 pt-3 font-mono text-[7.5px] uppercase tracking-[0.1em] text-slate-600">
        <span>AstroGuardian · prototype mission control</span>
        <span>All physiology &amp; mission values are simulated · not for clinical use</span>
      </footer>
    </div>
  )
}
