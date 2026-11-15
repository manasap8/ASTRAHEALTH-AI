import { useId } from 'react'

export function Sparkline({ data = [], color = '#22d3ee', width = 116, height = 34 }) {
  const gradientId = useId().replace(/:/g, '')
  if (data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pad = 3
  const stepX = (width - pad * 2) / (data.length - 1)

  const points = data.map((value, index) => {
    const x = pad + index * stepX
    const y = height - pad - ((value - min) / range) * (height - pad * 2)
    return [x, y]
  })

  const line = points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `${line} L${points[points.length - 1][0].toFixed(1)},${height} L${points[0][0].toFixed(1)},${height} Z`
  const last = points[points.length - 1]

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id={`spark-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#spark-${gradientId})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
      <circle cx={last[0]} cy={last[1]} r="2.2" fill={color} />
      <circle cx={last[0]} cy={last[1]} r="4.5" fill={color} opacity="0.16" />
    </svg>
  )
}
