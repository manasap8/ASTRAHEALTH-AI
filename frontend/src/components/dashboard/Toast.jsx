import { CheckCircle2, Info, ShieldAlert, TriangleAlert, X } from 'lucide-react'
import { useMission } from '../../context/MissionContext'

const TONES = {
  success: {
    icon: CheckCircle2,
    color: 'text-emerald-300',
    border: 'border-emerald-400/30',
    bg: 'bg-emerald-400/[0.08]',
    bar: 'bg-emerald-400/60',
  },
  critical: {
    icon: ShieldAlert,
    color: 'text-rose-300',
    border: 'border-rose-400/35',
    bg: 'bg-rose-500/[0.1]',
    bar: 'bg-rose-400/60',
  },
  warning: {
    icon: TriangleAlert,
    color: 'text-amber-300',
    border: 'border-amber-400/30',
    bg: 'bg-amber-400/[0.08]',
    bar: 'bg-amber-400/60',
  },
  info: {
    icon: Info,
    color: 'text-sky-300',
    border: 'border-sky-400/25',
    bg: 'bg-sky-400/[0.08]',
    bar: 'bg-sky-400/60',
  },
}

export function Toast() {
  const { toast, dismissToast } = useMission()
  if (!toast) return null

  const tone = TONES[toast.type] ?? TONES.info
  const Icon = tone.icon

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fade-up fixed bottom-4 right-4 z-[80] w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-xl border bg-[#07101d]/95 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.95)] backdrop-blur-xl ${tone.border}`}
    >
      <div className="flex items-start gap-2.5 p-3.5">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${tone.border} ${tone.bg} ${tone.color}`}
        >
          <Icon size={15} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold text-slate-100">{toast.title}</div>
          <p className="mt-0.5 text-[9.5px] leading-relaxed text-slate-400">{toast.message}</p>
        </div>
        <button
          type="button"
          onClick={dismissToast}
          aria-label="Dismiss notification"
          className="shrink-0 rounded p-1 text-slate-500 transition hover:text-slate-200"
        >
          <X size={13} />
        </button>
      </div>
      <div className="h-0.5 w-full bg-white/[0.04]">
        <div className={`h-full w-1/3 ${tone.bar}`} />
      </div>
    </div>
  )
}
