import { ArrowLeft, Check, Construction, Sparkles } from 'lucide-react'
import { getModule } from '../data/navigation'
import { StatusPill } from './ui/StatusPill'

export function PlaceholderPage({ moduleId, onNavigate }) {
  const module = getModule(moduleId)
  const Icon = module.icon

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <div className="fade-up mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="eyebrow">Mission modules · preview</div>
          <h1 className="panel-title mt-1 text-xl font-semibold text-slate-50">{module.label}</h1>
        </div>
        <StatusPill level="warning" label="Prototype placeholder" />
      </div>

      <section className="glass-panel hud-corners fade-up relative overflow-hidden px-5 py-10 text-center sm:px-8 sm:py-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(34,211,238,0.1),transparent_55%)]" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />

        <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
          <div className="orbit-ring inset-0 border-dashed border-cyan-300/20 spin-slow" />
          <div className="absolute inset-2 rounded-full border border-cyan-300/15" />
          <div className="absolute inset-4 rounded-full border border-dashed border-cyan-300/25" />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-300/30 bg-gradient-to-br from-cyan-400/15 to-blue-500/10 text-cyan-300 shadow-[0_0_36px_-10px_rgba(34,211,238,0.55)]">
            <Icon size={23} strokeWidth={1.6} />
          </div>
          <span className="absolute right-2 top-3 h-1.5 w-1.5 rounded-full bg-cyan-300/80 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
        </div>

        <div className="relative mx-auto mt-5 max-w-[560px]">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/20 bg-amber-400/[0.06] px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.16em] text-amber-200/80">
            <Construction size={10} />
            Module in development
          </span>
          <h2 className="panel-title mt-4 text-2xl font-semibold tracking-[-0.01em] text-slate-50 sm:text-[1.75rem]">
            {module.label}
          </h2>
          <p className="mt-2 text-[12px] leading-relaxed text-slate-400">{module.description}</p>
        </div>

        <div className="relative mx-auto mt-7 grid max-w-[760px] gap-2 sm:grid-cols-3">
          {module.planned.map((item) => (
            <div
              key={item}
              className="flex items-start gap-2 rounded-lg border border-white/[0.06] bg-white/[0.025] p-3 text-left"
            >
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-400/[0.08] text-cyan-300">
                <Check size={9} />
              </span>
              <span className="text-[10px] leading-relaxed text-slate-400">{item}</span>
            </div>
          ))}
        </div>

        <div className="relative mx-auto mt-7 flex max-w-[560px] flex-col items-center gap-3 border-t border-white/[0.06] pt-6">
          <p className="flex items-center gap-1.5 text-center text-[9.5px] leading-relaxed text-slate-500">
            <Sparkles size={11} className="shrink-0 text-cyan-300/60" />
            This module is intentionally scoped as a placeholder so the 48-hour build prioritises a
            fully functional mission dashboard.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="btn-primary h-10 px-5 text-[12px]"
          >
            <ArrowLeft size={15} />
            Return to mission dashboard
          </button>
        </div>
      </section>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/[0.05] bg-white/[0.015] px-4 py-3">
        <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-slate-600">
          AstroGuardian · module roadmap
        </span>
        <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-slate-600">
          Dashboard fully operational · other modules staged for post-hackathon build
        </span>
      </div>
    </div>
  )
}
