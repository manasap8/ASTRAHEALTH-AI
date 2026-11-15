export function VoiceWaveform({ active = false, tone = 'cyan', bars = 24, className = '' }) {
  const toneClass = {
    cyan: 'bg-cyan-300',
    rose: 'bg-rose-400',
    amber: 'bg-amber-400',
    emerald: 'bg-emerald-400',
  }[tone]

  return (
    <div
      className={`flex h-9 items-center justify-center gap-[3px] ${className}`}
      aria-hidden="true"
    >
      {Array.from({ length: bars }, (_, index) => {
        const base = 3 + ((index * 7) % 13)
        return (
          <span
            key={index}
            className={`w-[2.5px] rounded-full transition-all duration-300 ${toneClass} ${
              active ? 'voice-bar' : 'opacity-25'
            }`}
            style={{
              height: active ? undefined : `${base + 3}px`,
              animationDelay: `${(index % 9) * 0.09}s`,
              '--voice-h': `${base + 6}px`,
            }}
          />
        )
      })}
    </div>
  )
}
