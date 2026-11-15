import { useState } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  FileText,
  HeartPulse,
  Maximize2,
  ShieldCheck,
  Stethoscope,
  Thermometer,
  Wind,
} from 'lucide-react'
import { useMission } from '../../context/MissionContext'
import { downloadPreFlightReportPdf } from '../../lib/reportPdf'
import { StatusPill } from '../ui/StatusPill'

const EXAM_FIELDS = [
  ['ecg', 'ECG summary', 'Cardiology'],
  ['bloodOxygen', 'Blood oxygen baseline', 'Pulmonology'],
  ['respiratory', 'Respiratory assessment', 'Pulmonology'],
  ['temperature', 'Body temperature', 'General medicine'],
  ['bloodTest', 'Blood test summary', 'Laboratory medicine'],
  ['vision', 'Vision examination', 'Ophthalmology'],
  ['hearing', 'Hearing examination', 'Audiology'],
  ['boneDensity', 'Bone density assessment', 'Musculoskeletal'],
  ['conditions', 'Previous medical conditions', 'Medical history'],
  ['allergies', 'Known allergies', 'Allergy review'],
  ['medications', 'Prescribed medications', 'Pharmacy'],
]

function SampleWatermark() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
      <span className="-rotate-[28deg] whitespace-nowrap font-display text-[62px] font-bold tracking-[0.16em] text-slate-900/[0.035]">
        SAMPLE DATA
      </span>
    </div>
  )
}

function ReportField({ label, category, value, wide = false }) {
  return (
    <div className={`border-t border-slate-200/80 py-3 ${wide ? 'sm:col-span-2' : ''}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[7.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          {label}
        </span>
        <span className="shrink-0 font-mono text-[6.5px] uppercase tracking-[0.08em] text-cyan-700/50">
          {category}
        </span>
      </div>
      <p className="mt-1 text-[10.5px] leading-relaxed text-slate-700">{value}</p>
    </div>
  )
}

export function PreFlightReport({ reportOpen, onOpenReport, onCloseReport }) {
  const { selectedAstronaut } = useMission()
  const report = selectedAstronaut.preFlight
  const [pdfState, setPdfState] = useState('idle')

  const handleDownload = async () => {
    setPdfState('working')
    try {
      await downloadPreFlightReportPdf(selectedAstronaut)
      setPdfState('done')
    } catch {
      setPdfState('error')
    }
  }

  const actionBar = (
    <div className="flex flex-wrap items-center gap-2">
      {!reportOpen ? (
        <button type="button" onClick={onOpenReport} className="btn-primary h-9 px-3.5 text-[10.5px]">
          <Maximize2 size={13} />
          View Full Report
        </button>
      ) : (
        <button type="button" onClick={onCloseReport} className="btn-ghost h-9 px-3.5 text-[10.5px]">
          <ArrowLeft size={13} />
          Back to Medical History
        </button>
      )}
      <button
        type="button"
        onClick={handleDownload}
        disabled={pdfState === 'working'}
        className="btn-ghost h-9 px-3.5 text-[10.5px] disabled:opacity-60"
      >
        <Download size={13} className="text-cyan-300/80" />
        {pdfState === 'working' ? 'Generating PDF…' : 'Download Report as PDF'}
      </button>
      {pdfState === 'done' && (
        <span className="flex items-center gap-1 font-mono text-[8px] uppercase tracking-[0.06em] text-emerald-300/80">
          <CheckCircle2 size={10} />
          PDF downloaded
        </span>
      )}
      {pdfState === 'error' && (
        <span className="font-mono text-[8px] text-rose-300/80">PDF generation failed — try again</span>
      )}
    </div>
  )

  if (!reportOpen) {
    return (
      <div className="glass-panel fade-up overflow-hidden">
        <div className="border-b border-white/[0.06] p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-300/25 bg-cyan-400/[0.08] text-cyan-300">
                <FileText size={19} />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="eyebrow">Original pre-flight examination</span>
                  <span className="rounded border border-amber-300/20 bg-amber-400/[0.06] px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-[0.1em] text-amber-200/75">
                    Sample demonstration data
                  </span>
                </div>
                <h2 className="panel-title mt-1 text-[16px] font-semibold text-slate-100">
                  {selectedAstronaut.name}
                  <span className="ml-2 font-mono text-[9px] font-normal uppercase tracking-[0.1em] text-cyan-300/55">
                    {selectedAstronaut.id}
                  </span>
                </h2>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  {report.reportId} · Examination {report.examinationDate} · {report.physician}
                </p>
              </div>
            </div>
            <StatusPill level="normal" label={report.fitness.split('—')[0]} />
          </div>
        </div>

        <div className="grid gap-3 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2">
              <ShieldCheck size={13} className="text-emerald-400" />
              <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-emerald-300/80">
                Medical fitness clearance
              </span>
            </div>
            <p className="mt-2 text-[12px] font-medium text-slate-200">{report.fitness}</p>
            <p className="mt-1 text-[9.5px] text-slate-500">
              Valid through {report.validThrough} · {report.facility}
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                ['Heart rate', `${report.baseline.heartRate} BPM`, HeartPulse],
                ['SpO₂ baseline', `${report.baseline.spo2}%`, Stethoscope],
                ['Temperature', `${report.baseline.temperature} °C`, Thermometer],
                ['Respiration', `${report.baseline.respiration} br/min`, Wind],
              ].map(([label, value, Icon]) => (
                <div key={label} className="rounded-lg border border-white/[0.06] bg-black/20 p-2.5">
                  <Icon size={12} className="text-cyan-300/70" />
                  <div className="mt-1.5 font-mono text-[6.5px] uppercase tracking-[0.1em] text-slate-600">
                    {label}
                  </div>
                  <div className="mt-0.5 font-mono text-[11px] text-slate-200">{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-3 rounded-lg border border-white/[0.05] bg-black/15 p-3">
              <div className="font-mono text-[7px] uppercase tracking-[0.12em] text-slate-600">
                Flight surgeon summary
              </div>
              <p className="mt-1.5 line-clamp-3 text-[10px] leading-relaxed text-slate-400">
                {report.summary}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="rounded-xl border border-cyan-300/[0.12] bg-cyan-400/[0.04] p-3.5">
              <div className="font-mono text-[7px] uppercase tracking-[0.12em] text-cyan-200/55">
                Original report availability
              </div>
              <div className="mt-2 flex items-center gap-2">
                <FileText size={17} className="text-cyan-300" />
                <div>
                  <div className="text-[10.5px] font-medium text-slate-200">PDF on file</div>
                  <div className="font-mono text-[7px] text-slate-500">
                    Immutable baseline · {report.reportId}
                  </div>
                </div>
              </div>
              <div className="mt-2.5 grid grid-cols-2 gap-1.5 font-mono text-[7px] text-slate-500">
                <span>Report ID</span>
                <span className="text-right text-cyan-200/70">{report.reportId}</span>
                <span>Examination</span>
                <span className="text-right text-slate-300">{report.examinationDate}</span>
                <span>Records source</span>
                <span className="text-right text-slate-300">Pre-flight archive</span>
                <span>Data type</span>
                <span className="text-right text-amber-200/70">Simulated</span>
              </div>
            </div>
            {actionBar}
            <p className="font-mono text-[7px] uppercase leading-relaxed tracking-[0.08em] text-slate-600">
              Action buttons open the complete document or generate a local PDF. No database is
              connected in this prototype.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fade-up space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="eyebrow">Full pre-flight report</div>
          <p className="mt-0.5 text-[9.5px] text-slate-500">
            Reviewing the original examination document for {selectedAstronaut.name}.
          </p>
        </div>
        {actionBar}
      </div>

      <article className="relative overflow-hidden rounded-2xl border border-slate-300/60 bg-[#f6f8fb] text-slate-800 shadow-[0_30px_80px_-35px_rgba(0,0,0,0.9)]">
        <SampleWatermark />
        <div className="relative border-b-4 border-cyan-600 bg-[#081624] px-5 py-5 text-white sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-300/30 bg-cyan-400/10 font-display text-[13px] font-bold tracking-wide text-cyan-200">
                AG
              </div>
              <div>
                <div className="font-mono text-[7.5px] uppercase tracking-[0.24em] text-cyan-300/80">
                  AstroGuardian · Earth Orbital Medical Center
                </div>
                <h2 className="mt-1 font-display text-[19px] font-semibold tracking-[-0.01em]">
                  Pre-Flight Medical Examination Report
                </h2>
                <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.12em] text-slate-400">
                  Crew certification for long-duration spaceflight
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-1.5 rounded border border-amber-300/30 bg-amber-300/10 px-2 py-1 font-mono text-[7px] uppercase tracking-[0.12em] text-amber-200">
                Sample demonstration data
              </div>
              <div className="mt-2 font-mono text-[8px] text-slate-300">{report.reportId}</div>
              <div className="font-mono text-[7px] text-slate-500">Status: FINAL / CLEARED</div>
            </div>
          </div>
        </div>

        <div className="relative px-5 py-5 sm:px-8">
          <div className="grid gap-2 border-b border-slate-200 pb-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Astronaut', selectedAstronaut.name],
              ['Astronaut ID', selectedAstronaut.id],
              ['Age', `${selectedAstronaut.age} years`],
              ['Mission', selectedAstronaut.mission],
              ['Examination date', report.examinationDate],
              ['Facility', report.facility],
              ['Examining physician', report.physician],
              ['Clearance valid through', report.validThrough],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-slate-200 bg-white/70 px-3 py-2">
                <div className="font-mono text-[6.5px] uppercase tracking-[0.12em] text-slate-400">
                  {label}
                </div>
                <div className="mt-0.5 text-[9.5px] font-medium leading-snug text-slate-700">{value}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-600" />
              <div>
                <div className="font-mono text-[6.5px] uppercase tracking-[0.12em] text-emerald-700/60">
                  Medical fitness clearance
                </div>
                <div className="text-[10.5px] font-semibold text-emerald-900">{report.fitness}</div>
              </div>
            </div>
            <span className="font-mono text-[7px] uppercase tracking-[0.08em] text-emerald-700/60">
              Blood pressure {report.bloodPressure}
            </span>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-3 w-1 rounded bg-cyan-600" />
              <h3 className="font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-slate-500">
                Baseline physiological measurements
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                ['Heart rate', `${report.baseline.heartRate}`, 'BPM'],
                ['Blood oxygen', `${report.baseline.spo2}`, '% SpO₂'],
                ['Body temperature', `${report.baseline.temperature}`, '°C'],
                ['Respiration rate', `${report.baseline.respiration}`, 'br/min'],
              ].map(([label, value, unit]) => (
                <div key={label} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
                  <div className="font-mono text-[6.5px] uppercase tracking-[0.1em] text-slate-400">
                    {label}
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="font-display text-[20px] font-semibold leading-none text-slate-800">
                      {value}
                    </span>
                    <span className="font-mono text-[7px] text-slate-400">{unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-1 flex items-center gap-2">
              <span className="h-3 w-1 rounded bg-cyan-600" />
              <h3 className="font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-slate-500">
                Medical examination findings
              </h3>
            </div>
            <div className="grid sm:grid-cols-2 sm:gap-x-6">
              {EXAM_FIELDS.map(([key, label, category], index) => (
                <ReportField
                  key={key}
                  label={label}
                  category={category}
                  value={report[key]}
                  wide={index === 0}
                />
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-slate-200 bg-white/80 p-3.5">
            <div className="font-mono text-[7px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Flight surgeon summary
            </div>
            <p className="mt-1.5 text-[10px] leading-relaxed text-slate-600">{report.summary}</p>
          </div>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-5 border-t border-slate-200 pt-4">
            <div>
              <div className="font-mono text-[6.5px] uppercase tracking-[0.12em] text-slate-400">
                Examining physician
              </div>
              <div className="mt-1 font-display text-[12px] font-semibold text-slate-700">
                {report.physician}
              </div>
              <div className="font-mono text-[7px] text-slate-400">
                Electronically signed · {report.examinationDate}
              </div>
            </div>
            <div className="min-w-[170px] border-t border-slate-400 pt-1.5 text-center">
              <div className="font-mono text-[6.5px] uppercase tracking-[0.1em] text-slate-400">
                Flight surgeon signature
              </div>
            </div>
          </div>

          <p className="mt-5 rounded border border-amber-300/60 bg-amber-50 px-3 py-2 font-mono text-[6.5px] uppercase leading-relaxed tracking-[0.08em] text-amber-800/70">
            Sample demonstration data — this document is fictional and is not an actual medical
            record. Keep the original signed record in the medical administrator’s system of record.
          </p>
        </div>
      </article>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/[0.05] bg-white/[0.015] px-4 py-3">
        <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-slate-600">
          Report viewer · {report.reportId}
        </span>
        {actionBar}
      </div>
    </div>
  )
}
