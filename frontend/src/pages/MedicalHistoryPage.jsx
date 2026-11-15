import { useState } from 'react'
import { Activity, FileText, FolderLock, ShieldCheck } from 'lucide-react'
import { useMission } from '../context/MissionContext'
import { AstronautSelector } from '../components/astronaut/AstronautSelector'
import { PreFlightReport } from '../components/medical/PreFlightReport'
import { InFlightRecords } from '../components/medical/InFlightRecords'
import { StatusPill } from '../components/ui/StatusPill'

const TABS = [
  { id: 'preflight', label: 'Pre-Flight Medical Report', icon: FileText },
  { id: 'inflight', label: 'In-Flight Medical Records', icon: Activity },
]

export function MedicalHistoryPage({ params }) {
  const { selectedAstronaut } = useMission()
  const [tab, setTab] = useState(params?.tab === 'inflight' ? 'inflight' : 'preflight')
  const [reportOpen, setReportOpen] = useState(Boolean(params?.openReport))

  const selectTab = (nextTab) => {
    setTab(nextTab)
    setReportOpen(false)
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-3">
      <div className="fade-up flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="eyebrow">Crew medical archive</span>
            <span className="rounded border border-amber-300/15 bg-amber-400/[0.05] px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-[0.1em] text-amber-200/70">
              Sample demonstration data
            </span>
          </div>
          <h1 className="panel-title mt-1 text-xl font-semibold text-slate-50">Medical History</h1>
          <p className="mt-1 max-w-[680px] text-[11px] leading-relaxed text-slate-400">
            Original pre-flight certification and in-flight medical records for {selectedAstronaut.name}.
            Future database integration can replace the local sample archive without changing this view.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 font-mono text-[7.5px] uppercase tracking-[0.08em] text-slate-500">
            <FolderLock size={11} className="text-cyan-300/70" />
            {selectedAstronaut.preFlight.reportId}
          </span>
          <StatusPill level="normal" label="Original report on file" />
        </div>
      </div>

      <AstronautSelector
        title="Select astronaut record"
        hint="The chosen profile stays selected across dashboard, reports, comparison, wellness and activities."
      />

      <div className="glass-panel flex flex-wrap items-center justify-between gap-2 p-2">
        <div className="flex flex-wrap gap-1">
          {TABS.map((item) => {
            const Icon = item.icon
            const active = tab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectTab(item.id)}
                aria-selected={active}
                role="tab"
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-[10.5px] font-medium transition ${
                  active
                    ? 'border-cyan-300/25 bg-cyan-400/[0.09] text-cyan-100'
                    : 'border-transparent text-slate-500 hover:border-white/[0.06] hover:bg-white/[0.03] hover:text-slate-300'
                }`}
              >
                <Icon size={13} className={active ? 'text-cyan-300' : 'text-slate-500'} />
                {item.label}
                {active && <span className="h-1 w-1 rounded-full bg-cyan-300" />}
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-1.5 px-1 font-mono text-[7px] uppercase tracking-[0.08em] text-slate-600">
          <ShieldCheck size={10} className="text-cyan-300/50" />
          Read-only prototype archive
        </div>
      </div>

      <div role="tabpanel">
        {tab === 'preflight' ? (
          <PreFlightReport
            reportOpen={reportOpen}
            onOpenReport={() => setReportOpen(true)}
            onCloseReport={() => setReportOpen(false)}
          />
        ) : (
          <InFlightRecords />
        )}
      </div>
    </div>
  )
}
