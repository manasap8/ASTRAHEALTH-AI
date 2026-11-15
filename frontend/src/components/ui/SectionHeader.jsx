export function SectionHeader({ icon: Icon, eyebrow, title, description, actions, className = '' }) {
  return (
    <div className={`flex flex-wrap items-start justify-between gap-3 ${className}`}>
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-400/[0.07] text-cyan-300">
            <Icon size={15} strokeWidth={1.8} />
          </span>
        )}
        <div className="min-w-0">
          {eyebrow && <div className="eyebrow mb-1.5">{eyebrow}</div>}
          <h2 className="panel-title truncate text-[0.95rem] font-semibold text-slate-100">{title}</h2>
          {description && (
            <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
