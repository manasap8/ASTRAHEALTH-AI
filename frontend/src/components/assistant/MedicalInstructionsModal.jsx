import { BookOpen } from 'lucide-react'
import { MEDICAL_DISCLAIMER, MEDICAL_INSTRUCTIONS } from '../../data/missionData'
import { Modal } from '../ui/Modal'

export function MedicalInstructionsModal({ open, onClose }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Medical instructions"
      eyebrow="Crew emergency protocols"
      icon={BookOpen}
      maxWidth="max-w-xl"
      footer={
        <button type="button" onClick={onClose} className="btn-primary h-9 px-4 text-[11px]">
          Close
        </button>
      }
    >
      <p className="text-[11px] text-slate-400">{MEDICAL_DISCLAIMER}</p>
      <div className="mt-3 space-y-2">
        {MEDICAL_INSTRUCTIONS.map((item, index) => (
          <div key={item.title} className="rounded-lg border border-white/[0.07] bg-black/20 p-3">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded border border-cyan-300/20 bg-cyan-400/[0.06] font-mono text-[8px] text-cyan-300">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h4 className="panel-title text-[11px] font-semibold text-slate-200">{item.title}</h4>
            </div>
            <p className="mt-1.5 pl-7 text-[10px] leading-relaxed text-slate-400">{item.body}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 rounded-lg border border-amber-300/15 bg-amber-400/[0.05] px-3 py-2 font-mono text-[8px] uppercase tracking-[0.08em] text-amber-200/70">
        Simulation reference only · follow flight-surgeon standing orders
      </p>
    </Modal>
  )
}
