/**
 * Simulated mission telemetry.
 * Every reading in this prototype is generated — no live sensors are connected.
 */

export const MISSION = {
  name: 'Mars Exploration Mission',
  code: 'MARS-1 / ARES TRANSIT',
  day: 218,
  crewCount: 3,
  distanceFromEarth: '225.4M km',
  communicationDelay: '12m 34s',
  vehicle: 'Ares Transit Vehicle',
  destination: 'Mars · Jezero Crater',
  orbitPhase: 'Interplanetary cruise',
  nextWindow: '14h 22m',
}

export const CREW = [
  { id: 'AG-2041', initials: 'AV', name: 'Cmdr. A. Vega', role: 'Mission Commander', status: 'nominal' },
  { id: 'AG-2042', initials: 'LC', name: 'Dr. L. Chen', role: 'Flight Surgeon', status: 'nominal' },
  { id: 'AG-2043', initials: 'MO', name: 'M. Okafor', role: 'Systems Engineer', status: 'nominal' },
  { id: 'AG-2044', initials: 'SI', name: 'S. Ivanova', role: 'Science Officer', status: 'nominal' },
]

export const DEMO_ASTRONAUT = {
  id: 'AG-2041',
  name: 'Cmdr. A. Vega',
  role: 'Mission Commander',
  initials: 'AV',
}

export const METRICS = {
  heartRate: {
    key: 'heartRate',
    label: 'Heart Rate',
    unit: 'BPM',
    precision: 0,
    baseline: 72,
    previous: 74,
    jitter: 2.4,
    icon: 'heart',
    region: 'heart',
    cadence: '1 Hz · ECG patch',
  },
  spo2: {
    key: 'spo2',
    label: 'Blood Oxygen',
    unit: '%',
    precision: 0,
    baseline: 98,
    previous: 97,
    jitter: 0.45,
    icon: 'oxygen',
    region: 'lungs',
    cadence: '0.5 Hz · pulse oximeter',
  },
  temperature: {
    key: 'temperature',
    label: 'Body Temperature',
    unit: '°C',
    precision: 1,
    baseline: 36.6,
    previous: 36.5,
    jitter: 0.08,
    icon: 'temperature',
    region: 'brain',
    cadence: '0.2 Hz · core probe',
  },
  respiration: {
    key: 'respiration',
    label: 'Respiration Rate',
    unit: 'br/min',
    precision: 0,
    baseline: 15,
    previous: 16,
    jitter: 0.7,
    icon: 'respiration',
    region: 'lungs',
    cadence: '2 Hz · strain band',
  },
  sleep: {
    key: 'sleep',
    label: 'Sleep Duration',
    unit: 'hrs',
    precision: 1,
    baseline: 7.4,
    previous: 7.1,
    jitter: 0.04,
    icon: 'sleep',
    region: 'brain',
    cadence: 'Daily · sleep patch',
  },
  radiation: {
    key: 'radiation',
    label: 'Radiation Exposure',
    unit: 'mSv',
    precision: 2,
    baseline: 2.42,
    previous: 2.4,
    jitter: 0.006,
    icon: 'radiation',
    region: 'bones',
    cadence: 'Cumulative · dosimeter',
  },
}

export const BASELINE_READINGS = Object.fromEntries(
  Object.entries(METRICS).map(([key, meta]) => [key, meta.baseline]),
)

export const METRIC_ORDER = [
  'heartRate',
  'spo2',
  'temperature',
  'respiration',
  'sleep',
  'radiation',
]

/** Evaluate a simulated reading against mission flight-surgeon thresholds. */
export function getStatus(metricKey, value) {
  const v = Number(value)

  switch (metricKey) {
    case 'heartRate':
      if (v > 120 || v < 45) return { level: 'critical', label: 'Critical' }
      if (v > 100 || v < 60) return { level: 'warning', label: 'Elevated' }
      return { level: 'normal', label: 'Optimal' }
    case 'spo2':
      if (v < 90) return { level: 'critical', label: 'Critical' }
      if (v < 95) return { level: 'warning', label: 'Low' }
      return { level: 'normal', label: 'Optimal' }
    case 'temperature':
      if (v > 38.5 || v < 35.5) return { level: 'critical', label: 'Critical' }
      if (v > 37.5 || v < 36) return { level: 'warning', label: 'Elevated' }
      return { level: 'normal', label: 'Optimal' }
    case 'respiration':
      if (v > 26 || v < 9) return { level: 'critical', label: 'Critical' }
      if (v > 20 || v < 12) return { level: 'warning', label: 'Elevated' }
      return { level: 'normal', label: 'Optimal' }
    case 'sleep':
      if (v < 5) return { level: 'critical', label: 'Critical' }
      if (v < 7) return { level: 'warning', label: 'Below target' }
      return { level: 'normal', label: 'On target' }
    case 'radiation':
      if (v >= 5) return { level: 'critical', label: 'Critical' }
      if (v >= 3) return { level: 'warning', label: 'Elevated' }
      return { level: 'normal', label: 'Within limit' }
    default:
      return { level: 'normal', label: 'Optimal' }
  }
}

const STATUS_SEVERITY = { normal: 0, warning: 1, critical: 2 }

export function worstStatus(...statuses) {
  return statuses.reduce(
    (worst, current) =>
      (STATUS_SEVERITY[current?.level] ?? 0) > (STATUS_SEVERITY[worst?.level] ?? 0)
        ? current
        : worst,
    { level: 'normal', label: 'Optimal' },
  )
}

export const BODY_REGIONS = [
  {
    id: 'brain',
    label: 'Brain',
    statusKey: 'sleep',
    signal: 'Neural telemetry',
    detail:
      'Cognitive load is derived from sleep continuity, reaction-time checks and core temperature. No neurological flags detected.',
    icon: 'brain',
  },
  {
    id: 'eyes',
    label: 'Eyes',
    statusKey: 'radiation',
    signal: 'Ocular exposure',
    detail:
      'Ocular radiation dose is tracked from the crew dosimeter. Visual acuity checks remain on the mission schedule.',
    icon: 'eye',
  },
  {
    id: 'heart',
    label: 'Heart',
    statusKey: 'heartRate',
    signal: 'Cardiovascular',
    detail:
      'Continuous ECG rhythm and heart-rate variability are compared against the crew member’s microgravity baseline.',
    icon: 'heart',
  },
  {
    id: 'lungs',
    label: 'Lungs',
    statusKey: 'spo2',
    signal: 'Gas exchange',
    detail:
      'Pulse oximetry and respiratory strain are combined to estimate gas-exchange efficiency in the cabin atmosphere.',
    icon: 'lungs',
  },
  {
    id: 'bones',
    label: 'Bones',
    statusKey: 'radiation',
    signal: 'Skeletal load',
    detail:
      'Cumulative radiation dose and load-bearing exercise logs inform bone-density risk for long-duration spaceflight.',
    icon: 'bone',
  },
  {
    id: 'muscles',
    label: 'Muscles',
    statusKey: 'sleep',
    signal: 'Recovery index',
    detail:
      'Muscle recovery is estimated from sleep duration, hydration and the crew’s resistive-exercise protocol.',
    icon: 'muscle',
  },
]

export const SENSORS = [
  {
    id: 'HR-01',
    name: 'Heart-rate sensor',
    hardware: 'ECG chest patch',
    sampling: '1 Hz',
    signal: 98,
    status: 'Connected',
  },
  {
    id: 'OX-02',
    name: 'Oxygen sensor',
    hardware: 'Pulse oximeter · finger',
    sampling: '0.5 Hz',
    signal: 96,
    status: 'Connected',
  },
  {
    id: 'TM-03',
    name: 'Temperature sensor',
    hardware: 'Core ingestible probe',
    sampling: '0.2 Hz',
    signal: 99,
    status: 'Connected',
  },
  {
    id: 'RS-04',
    name: 'Respiration sensor',
    hardware: 'Chest strain band',
    sampling: '2 Hz',
    signal: 94,
    status: 'Connected',
  },
]

export const INITIAL_ALERTS = [
  {
    id: 'a-1',
    severity: 'warning',
    title: 'Hydration below target',
    time: '04:31 UTC',
    description: 'Fluid deficit of 0.8 L against the daily mission target. Recommend 500 ml water now.',
    unread: true,
    source: 'Wellness monitor',
  },
  {
    id: 'a-2',
    severity: 'warning',
    title: 'Radiation flux elevated · Sector 4',
    time: '02:12 UTC',
    description: 'Dosimeter recorded a transient 0.12 mSv spike. Shielding nominal; monitoring continues.',
    unread: true,
    source: 'Dosimeter',
  },
  {
    id: 'a-3',
    severity: 'info',
    title: 'Crew health check completed',
    time: '06:42 UTC',
    description: 'All four crew members completed the scheduled daily health validation.',
    unread: false,
    source: 'Flight surgeon',
  },
  {
    id: 'a-4',
    severity: 'info',
    title: 'Sleep protocol synced',
    time: '05:58 UTC',
    description: 'Circadian lighting schedule updated for the crew’s wake cycle at 07:00 UTC.',
    unread: false,
    source: 'Cabin systems',
  },
]

export const MEDICAL_DISCLAIMER =
  'Decision support only — AstroGuardian does not diagnose disease. Escalate unstable symptoms to the flight surgeon and mission control.'

export const EMERGENCY_SCENARIOS = [
  {
    id: 'cardiac',
    name: 'Cardiac event',
    severity: 'critical',
    title: 'Tachycardia detected — crew member AG-2041',
    description:
      'Heart rate climbed to 138 BPM with a 5-point SpO₂ drop. ECG shows a narrow-complex tachyarrhythmia pattern. Immediate assessment advised.',
    readings: { heartRate: 138, spo2: 93, respiration: 22, temperature: 37.2 },
    regions: { heart: 'critical', lungs: 'warning' },
    assistant:
      'I am flagging a possible tachyarrhythmia pattern (HR 138 BPM, SpO₂ 93%). This is decision support, not a diagnosis.\n\nRecommended protocol:\n1. Sit the crew member down and record a 12-lead ECG now.\n2. Check blood pressure, skin perfusion and level of consciousness.\n3. Give supplemental oxygen if SpO₂ remains below 94%.\n4. Notify the flight surgeon and prepare a 4-minute comms summary for mission control.\n5. If chest pain, syncope or hypotension develops, treat as an emergency and prepare AED.',
    region: 'heart',
  },
  {
    id: 'hypoxia',
    name: 'Hypoxic episode',
    severity: 'critical',
    title: 'Hypoxia warning — SpO₂ at 88%',
    description:
      'Blood oxygen saturation dropped below the 90% flight threshold with a compensatory rise in respiration to 27 br/min. Cabin O₂ partial pressure should be verified.',
    readings: { heartRate: 112, spo2: 88, respiration: 27, temperature: 36.8 },
    regions: { lungs: 'critical', heart: 'warning', brain: 'warning' },
    assistant:
      'I am flagging a hypoxic pattern (SpO₂ 88%, respiration 27 br/min). This is decision support, not a diagnosis.\n\nRecommended protocol:\n1. Verify cabin O₂ partial pressure and the crew member’s mask seal.\n2. Start supplemental oxygen and position the crew member upright.\n3. Recheck SpO₂ every 60 seconds; confirm the oximeter signal is valid.\n4. Stop physical activity and monitor for confusion or cyanosis.\n5. Escalate to the flight surgeon immediately if SpO₂ stays below 90%.',
    region: 'lungs',
  },
  {
    id: 'radiation',
    name: 'Radiation surge',
    severity: 'critical',
    title: 'Cumulative dose above flight limit',
    description:
      'A solar particle event pushed the simulated cumulative dose to 6.80 mSv. The crew should move to the shielded sleep quarters and prepare for a possible shelter stay.',
    readings: { radiation: 6.8, heartRate: 96, temperature: 37.8 },
    regions: { bones: 'critical', eyes: 'warning', brain: 'warning' },
    assistant:
      'I am flagging a radiation exposure event (cumulative 6.80 mSv, above the 5 mSv mission action level). This is decision support, not a diagnosis.\n\nRecommended protocol:\n1. Move the crew to the shielded sleep quarters and inventory dosimeters.\n2. Suspend EVA preparation and non-essential power loads.\n3. Record dose rate every 10 minutes and compare with the solar particle alert.\n4. Watch for nausea, headache or visual disturbance and report them.\n5. Request a radiation-surgeon consult from mission control.',
    region: 'bones',
  },
  {
    id: 'fatigue',
    name: 'Acute fatigue',
    severity: 'warning',
    title: 'Cognitive fatigue risk — sleep debt rising',
    description:
      'Simulated sleep duration fell to 4.2 hours with an elevated resting heart rate. Cognitive performance checks indicate a moderate fatigue risk.',
    readings: { sleep: 4.2, heartRate: 92, respiration: 18, temperature: 36.7 },
    regions: { brain: 'warning', muscles: 'warning' },
    assistant:
      'I am flagging a fatigue and recovery risk (sleep 4.2 h, resting HR 92 BPM). This is decision support, not a diagnosis.\n\nRecommended protocol:\n1. Defer non-critical tasks requiring sustained attention.\n2. Schedule a 20-minute cognitive rest and a hydration break.\n3. Protect the next sleep window with the circadian lighting protocol.\n4. Recheck orthostatic vitals before standing or EVA prep.\n5. Notify the flight surgeon if fatigue or headache persists beyond one shift.',
    region: 'brain',
  },
]

/* ---------- Generated history (stable per load) ---------- */

const seeded = (seed) => {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function buildHeartRateHistory() {
  const random = seeded(2041)
  const startHour = 6
  return Array.from({ length: 24 }, (_, index) => {
    const hour = (startHour + index) % 24
    const asleep = hour >= 23 || hour < 7
    const exercising = hour === 17 || hour === 18
    const drift = Math.sin(index / 2.6) * 3.6
    const base = asleep ? 59 : exercising ? 112 : 74
    const bpm = Math.round(base + drift + (random() - 0.5) * 6)
    return {
      time: `${String(hour).padStart(2, '0')}:00`,
      bpm,
      resting: asleep ? 58 : 68,
    }
  })
}

function buildSleepHistory() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const values = [6.4, 7.6, 5.8, 7.2, 6.9, 7.9, 7.4]
  return days.map((day, index) => ({
    day,
    hours: values[index],
    target: 7.5,
  }))
}

function buildRadiationHistory() {
  const random = seeded(88)
  return Array.from({ length: 16 }, (_, index) => {
    const sol = 188 + index * 2
    const base = 0.55 + (index / 15) * 1.85
    const solarEvent = index === 8 ? 0.42 : index === 9 ? 0.22 : 0
    const dose = Number((base + solarEvent + random() * 0.05).toFixed(2))
    return {
      sol: `Sol ${sol}`,
      dose,
      limit: 5,
    }
  })
}

export const HEART_RATE_HISTORY = buildHeartRateHistory()
export const SLEEP_HISTORY = buildSleepHistory()
export const RADIATION_HISTORY = buildRadiationHistory()

export const MEDICAL_INSTRUCTIONS = [
  {
    title: 'Unresponsive crew member',
    body: 'Confirm scene safety, check responsiveness and breathing, call the flight surgeon, start CPR and apply the AED if trained. Log the time of collapse.',
  },
  {
    title: 'Suspected hypoxia',
    body: 'Verify cabin O₂ partial pressure, apply supplemental oxygen, sit upright, monitor SpO₂ every minute and escalate below 90%.',
  },
  {
    title: 'Chest pain',
    body: 'Stop activity, record a 12-lead ECG and blood pressure, give aspirin only per the flight surgeon’s standing order, and prepare evacuation planning.',
  },
  {
    title: 'Acute radiation exposure',
    body: 'Move to the shielded quarters, record dose and time, keep the crew hydrated, monitor for nausea, and contact the radiation surgeon.',
  },
]
