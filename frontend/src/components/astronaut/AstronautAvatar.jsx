const SIZES = {
  sm: 'h-7 w-7 text-[8px]',
  md: 'h-9 w-9 text-[10px]',
  lg: 'h-12 w-12 text-[13px]',
  xl: 'h-16 w-16 text-[18px]',
}

export function AstronautAvatar({ astronaut, size = 'md', showStatus = false, className = '' }) {
  return (
    <span className={`relative inline-flex shrink-0 ${className}`}>
      <span
        className={`flex items-center justify-center rounded-xl border border-cyan-300/25 bg-gradient-to-br from-cyan-400/20 via-blue-500/10 to-slate-900/40 font-display font-semibold text-cyan-100 ${SIZES[size]}`}
      >
        {astronaut?.initials ?? 'AG'}
      </span>
      {showStatus && (
        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#07101d] bg-emerald-400" />
      )}
    </span>
  )
}
