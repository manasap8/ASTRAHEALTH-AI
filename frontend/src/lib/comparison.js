import { getStatus } from '../data/missionData'

export const COMPARISON_METRICS = [
  {
    key: 'heartRate',
    label: 'Heart rate',
    unit: 'BPM',
    decimals: 0,
    expectedVariancePct: 15,
    meaningful: true,
  },
  {
    key: 'spo2',
    label: 'Blood oxygen',
    unit: '%',
    decimals: 0,
    expectedVariancePct: 2.5,
    meaningful: false,
  },
  {
    key: 'temperature',
    label: 'Body temperature',
    unit: '°C',
    decimals: 1,
    expectedVariancePct: 1.2,
    meaningful: false,
  },
  {
    key: 'respiration',
    label: 'Respiration rate',
    unit: 'br/min',
    decimals: 0,
    expectedVariancePct: 20,
    meaningful: true,
  },
]

/**
 * Pre-flight comparison deliberately separates physiological variance from the
 * configured clinical thresholds. A baseline difference alone is never marked
 * as an emergency.
 */
export function buildComparison(readings, baseline) {
  return COMPARISON_METRICS.map((metric) => {
    const base = Number(baseline[metric.key])
    const current = Number(readings[metric.key])
    const difference = Number((current - base).toFixed(metric.decimals))
    const percentChange = base !== 0 ? Number(((difference / base) * 100).toFixed(1)) : 0
    const clinical = getStatus(metric.key, current)
    const exceedsExpected = Math.abs(percentChange) > metric.expectedVariancePct
    const direction = difference > 0 ? 'above' : difference < 0 ? 'below' : 'at'

    let monitoring = { level: 'normal', label: 'Within baseline' }
    if (clinical.level === 'critical') {
      monitoring = { level: 'critical', label: 'Clinical review' }
    } else if (clinical.level === 'warning') {
      monitoring = { level: 'warning', label: exceedsExpected ? `Monitor · ${direction} baseline` : 'Monitor' }
    } else if (exceedsExpected) {
      monitoring = { level: 'warning', label: 'Variance · monitor trend' }
    }

    return {
      ...metric,
      baseline: base,
      current,
      difference,
      percentChange,
      clinicalStatus: clinical,
      monitoring,
      exceedsExpected,
      direction,
    }
  })
}
