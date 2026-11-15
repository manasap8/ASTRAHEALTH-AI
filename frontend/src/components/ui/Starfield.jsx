import { useMemo } from 'react'

function seededRandom(seed) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

export function Starfield({ count = 90, className = '' }) {
  const stars = useMemo(() => {
    const random = seededRandom(2041)
    return Array.from({ length: count }, (_, index) => {
      const size = random() > 0.92 ? 2.4 : random() > 0.7 ? 1.6 : 1
      return {
        id: index,
        top: `${(random() * 100).toFixed(2)}%`,
        left: `${(random() * 100).toFixed(2)}%`,
        size,
        opacity: 0.2 + random() * 0.6,
        duration: `${4 + random() * 6}s`,
        delay: `${random() * 6}s`,
      }
    })
  }, [count])

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {stars.map((star) => (
        <span
          key={star.id}
          className="star"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            '--twinkle-duration': star.duration,
            '--twinkle-delay': star.delay,
          }}
        />
      ))}
    </div>
  )
}
