export function Logo({ size = 38, showText = true, subtitle = true, className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className="relative shrink-0 rounded-xl border border-cyan-300/25 bg-gradient-to-br from-cyan-400/15 via-blue-500/10 to-transparent p-1.5 shadow-[0_0_28px_-8px_rgba(34,211,238,0.55)]"
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden="true">
          <defs>
            <linearGradient id="ag-shield" x1="8" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#67e8f9" />
              <stop offset="0.55" stopColor="#22d3ee" />
              <stop offset="1" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          <path
            d="M24 3.5 40.5 9.6v12.9c0 9.8-6.9 18.5-16.5 22.1C14.5 41 7.5 32.3 7.5 22.5V9.6L24 3.5Z"
            fill="rgba(8,145,178,0.12)"
            stroke="url(#ag-shield)"
            strokeWidth="1.6"
          />
          <path
            d="M12.5 24h5.2l3.1-7.4 4.6 15 3.2-7.6h6.9"
            fill="none"
            stroke="url(#ag-shield)"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="24" cy="40" r="1.4" fill="#67e8f9" />
        </svg>
      </div>
      {showText && (
        <div className="min-w-0 leading-none">
          <div className="font-display text-[1.05rem] font-semibold tracking-[0.12em] text-slate-50">
            ASTRO<span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">GUARDIAN</span>
          </div>
          {subtitle && (
            <div className="mt-1.5 font-mono text-[8px] tracking-[0.28em] text-cyan-200/45">
              ASTRONAUT HEALTH COMMAND
            </div>
          )}
        </div>
      )}
    </div>
  )
}
