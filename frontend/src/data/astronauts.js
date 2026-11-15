/**
 * Temporary frontend sample data for the AstroGuardian prototype.
 * Everything here is fictional demonstration data. It is intentionally kept
 * separate from the UI so a future backend/database can replace this module.
 */

const seeded = (seed) => {
  let state = seed
  return () => {
    state = (state * 16807) % 2147483647
    return (state - 1) / 2147483646
  }
}

const buildVitalsHistory = ({ heartRate, spo2, temperature, respiration, seed }) => {
  const random = seeded(seed)
  const startHour = 6
  return Array.from({ length: 24 }, (_, index) => {
    const hour = (startHour + index) % 24
    const asleep = hour >= 23 || hour < 7
    const exercising = hour === 17
    const drift = Math.sin(index / 2.7) * (heartRate > 110 ? 4.5 : 3.2)
    const bpm = Math.round(
      heartRate -
        (asleep ? 10 : exercising ? -18 : 2) +
        drift +
        (random() - 0.5) * 5,
    )
    return {
      time: `${String(hour).padStart(2, '0')}:00`,
      bpm,
      resting: asleep ? heartRate - 14 : heartRate - 5,
      spo2: Math.round(Math.min(100, spo2 - (asleep ? 0 : 1) + (random() - 0.5))),
      temperature: Number(
        (temperature - (asleep ? 0.25 : 0) + (random() - 0.5) * 0.18).toFixed(1),
      ),
      respiration: Math.round(
        respiration - (asleep ? 2 : 0) + (random() - 0.5) * 2,
      ),
    }
  })
}

const buildSleepHistory = (seed, target) => {
  const random = seeded(seed)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return days.map((day, index) => ({
    day,
    hours: Number(Math.max(3.8, target + (random() - 0.5) * 1.8 - (index === 2 ? 0.8 : 0)).toFixed(1)),
    target: 7.5,
  }))
}

const buildRadiationHistory = ({ cumulative, seed }) => {
  const random = seeded(seed)
  return Array.from({ length: 16 }, (_, index) => {
    const sol = 188 + index * 2
    const base = cumulative * (0.34 + (index / 15) * 0.66)
    const event = index === 8 ? cumulative * 0.12 : 0
    return {
      sol: `Sol ${sol}`,
      dose: Number((base + event + random() * 0.05).toFixed(2)),
      limit: 5,
    }
  })
}

const withHistory = (profile) => ({
  ...profile,
  history: {
    vitals: buildVitalsHistory({
      heartRate: profile.currentReadings.heartRate,
      spo2: profile.currentReadings.spo2,
      temperature: profile.currentReadings.temperature,
      respiration: profile.currentReadings.respiration,
      seed: profile.historySeed,
    }),
    sleep: buildSleepHistory(profile.historySeed + 11, profile.currentReadings.sleep),
    radiation: buildRadiationHistory({
      cumulative: profile.currentReadings.radiation,
      seed: profile.historySeed + 29,
    }),
  },
})

const PROFILES = [
  {
    id: 'AST-001',
    name: 'Commander Alex Vance',
    age: 38,
    mission: 'Artemis VII',
    status: 'WARNING',
    role: 'Mission Commander & Pilot',
    initials: 'AV',
    bloodType: 'O+',
    historySeed: 101,
    doseRate: 9.4,
    currentReadings: {
      heartRate: 74,
      spo2: 98,
      temperature: 36.6,
      respiration: 15,
      sleep: 7.2,
      radiation: 2.14,
    },
    previousReadings: {
      heartRate: 72,
      spo2: 98,
      temperature: 36.5,
      respiration: 16,
      sleep: 7.4,
      radiation: 2.12,
    },
    preFlight: {
      reportId: 'PFR-2037-001',
      examinationDate: '12 February 2037',
      facility: 'Earth Orbital Medical Center · Houston',
      physician: 'Dr. Lena Ortiz, Flight Surgeon',
      fitness: 'Cleared — unrestricted long-duration spaceflight',
      validThrough: '11 February 2038',
      baseline: {
        heartRate: 68,
        spo2: 98,
        temperature: 36.5,
        respiration: 14,
        sleep: 7.8,
        radiation: 1.8,
      },
      bloodPressure: '118 / 76 mmHg',
      ecg: 'Normal sinus rhythm at 68 BPM. PR interval 154 ms, QRS 88 ms, QTc 412 ms. No ST-segment abnormality, arrhythmia or conduction block.',
      bloodOxygen: '98% at rest on ambient air, rising to 99% after a 5-minute recovery from the cycle test.',
      respiratory: 'Respiratory rate 14/min, chest expansion symmetrical, lungs clear to auscultation. Spirometry FEV1 104% of predicted.',
      temperature: '36.5 °C oral, afebrile. No evidence of acute infection.',
      bloodTest:
        'Haemoglobin 15.1 g/dL, haematocrit 44%, white-cell count 6.2 × 10⁹/L, platelets 248 × 10⁹/L. Renal, hepatic and thyroid panels within reference range. Ferritin 96 ng/mL.',
      vision: 'Visual acuity 20/20 both eyes, corrected. Intraocular pressure 14/13 mmHg. Colour vision and stereopsis normal.',
      hearing: 'Pure-tone audiometry within flight standards at 250–8000 Hz. No asymmetric loss.',
      boneDensity:
        'Lumbar spine T-score +0.4, femoral neck +0.2. Bone mineral density within the healthy reference range for age and sex.',
      conditions:
        'No active medical conditions. Childhood chickenpox only. No prior surgery, syncope, seizure or cardiovascular disease.',
      allergies: 'No known drug or food allergies. Mild seasonal pollen sensitivity, managed without medication.',
      medications:
        'No scheduled prescription medication. Vitamin D3 1000 IU daily as a flight countermeasure.',
      summary:
        'Alex is medically fit for the Mars transit and surface phases. All baseline physiological, laboratory and imaging findings are within flight-surgeon standards. Standard exercise, radiation and sleep countermeasures apply.',
    },
    initialAlerts: [
      {
        id: 'am-1',
        severity: 'warning',
        title: 'Hydration below daily target',
        time: '04:31 UTC',
        description: 'Fluid intake is 0.6 L below the mission target. Recommend 400 ml of water before the next exercise block.',
        unread: true,
        source: 'Wellness monitor',
      },
      {
        id: 'am-2',
        severity: 'warning',
        title: 'Radiation flux transient · Sector 4',
        time: '02:12 UTC',
        description: 'The cabin dosimeter recorded a transient 0.09 mSv spike. Shielding is nominal and monitoring continues.',
        unread: true,
        source: 'Dosimeter',
      },
      {
        id: 'am-3',
        severity: 'info',
        title: 'Daily health validation complete',
        time: '06:42 UTC',
        description: 'All scheduled morning checks were completed. No follow-up action is required.',
        unread: false,
        source: 'Flight surgeon',
      },
      {
        id: 'am-4',
        severity: 'info',
        title: 'Sleep protocol synced',
        time: '05:58 UTC',
        description: 'Circadian lighting has been scheduled for the 07:00 UTC wake cycle.',
        unread: false,
        source: 'Cabin systems',
      },
    ],
    inflight: {
      medications: [
        { name: 'Vitamin D3', dose: '1000 IU', schedule: 'Daily · 08:00', status: 'Active' },
        { name: 'Melatonin', dose: '3 mg', schedule: 'As needed · pre-sleep', status: 'Available' },
        { name: 'Acetaminophen', dose: '500 mg', schedule: 'As needed · max 3 g/day', status: 'Available' },
      ],
      observations: [
        {
          time: 'Today · 06:45 UTC',
          author: 'Dr. Lena Ortiz',
          note: 'Resting vitals stable. Reports good exercise tolerance and no chest pain, dyspnoea or dizziness.',
        },
        {
          time: 'Sol 214 · 18:10 UTC',
          author: 'Crew self-check',
          note: 'Mild lower-back stiffness after resistive exercise; resolved with mobility work and hydration.',
        },
        {
          time: 'Sol 210 · 09:30 UTC',
          author: 'Dr. Lena Ortiz',
          note: 'Sleep continuity improving after circadian lighting adjustment. Continue current protocol.',
        },
      ],
      emergencyEvents: [
        {
          id: 'am-e1',
          time: 'Sol 196 · 14:02 UTC',
          title: 'Cabin depressurisation drill',
          severity: 'Drill',
          summary: 'Crew completed a 4-minute mask and hatch-seal drill. No physiological compromise recorded.',
          resolved: true,
        },
      ],
      previousSnapshots: [
        { label: '06:00 UTC', reading: 'HR 72 · SpO₂ 98% · 36.5 °C · RR 16' },
        { label: '00:00 UTC', reading: 'HR 62 · SpO₂ 98% · 36.4 °C · RR 14' },
        { label: 'Yesterday 18:00', reading: 'HR 96 · SpO₂ 99% · 36.7 °C · RR 19' },
      ],
    },
    wellnessSeed: {
      moodTrend: [
        { day: 'Mon', mood: 4, sleepQuality: 4 },
        { day: 'Tue', mood: 4, sleepQuality: 3 },
        { day: 'Wed', mood: 3, sleepQuality: 3 },
        { day: 'Thu', mood: 4, sleepQuality: 4 },
        { day: 'Fri', mood: 5, sleepQuality: 4 },
        { day: 'Sat', mood: 4, sleepQuality: 5 },
        { day: 'Sun', mood: 4, sleepQuality: 4 },
      ],
      bestReactionMs: 238,
      reactions: [238, 261, 249],
    },
    activitySeed: {
      exerciseGoal: 45,
      exerciseMinutes: 30,
      hydrationGoal: 2500,
      hydrationMl: 1750,
      sleepGoal: 8,
      sleepLogged: true,
      streakDays: 12,
      achievements: ['7-day exercise streak', 'Hydration champion', 'Sleep protocol compliant'],
    },
  },
  {
    id: 'AST-002',
    name: 'Dr. Elena Rostova',
    age: 34,
    mission: 'Artemis VII',
    status: 'WARNING',
    role: 'Flight Engineer & Medical Officer',
    initials: 'ER',
    bloodType: 'A−',
    historySeed: 202,
    doseRate: 15.6,
    currentReadings: {
      heartRate: 104,
      spo2: 96,
      temperature: 37.4,
      respiration: 19,
      sleep: 6.1,
      radiation: 3.22,
    },
    previousReadings: {
      heartRate: 98,
      spo2: 97,
      temperature: 37.2,
      respiration: 18,
      sleep: 6.4,
      radiation: 3.14,
    },
    preFlight: {
      reportId: 'PFR-2037-002',
      examinationDate: '9 February 2037',
      facility: 'Earth Orbital Medical Center · Houston',
      physician: 'Dr. Marcus Bell, Flight Surgeon',
      fitness: 'Cleared — monitored iron-status history',
      validThrough: '8 February 2038',
      baseline: {
        heartRate: 70,
        spo2: 97,
        temperature: 36.7,
        respiration: 15,
        sleep: 7.5,
        radiation: 1.7,
      },
      bloodPressure: '112 / 72 mmHg',
      ecg: 'Normal sinus rhythm at 70 BPM. PR interval 148 ms, QRS 84 ms, QTc 405 ms. No ectopy or ischaemic change at rest or peak exercise.',
      bloodOxygen: '97% at rest on ambient air and 98% after a 3-minute recovery from the treadmill protocol.',
      respiratory: 'Respiratory rate 15/min, clear lung fields, no wheeze. Spirometry FEV1 98% of predicted with normal diffusion capacity.',
      temperature: '36.7 °C oral, afebrile. Resting metabolic panel unremarkable.',
      bloodTest:
        'Haemoglobin 13.4 g/dL, haematocrit 40%, white-cell count 5.8 × 10⁹/L, platelets 231 × 10⁹/L. Ferritin 34 ng/mL with a history of mild iron deficiency, currently replete. Renal and hepatic panels normal.',
      vision: 'Visual acuity 20/20 both eyes without correction. Intraocular pressure 12/13 mmHg. Normal colour vision and contrast sensitivity.',
      hearing: 'Audiometry within flight standards at all tested frequencies. Tympanic membranes normal.',
      boneDensity:
        'Lumbar spine T-score −0.1, femoral neck 0.0. Bone mineral density appropriate for age; calcium and vitamin D status optimised.',
      conditions:
        'History of mild iron-deficiency anaemia during athletic training in 2033, resolved and stable for four years. No cardiovascular, respiratory or neurological disease.',
      allergies: 'Penicillin allergy — hives only, no anaphylaxis. No food allergies.',
      medications:
        'Ferrous sulphate 65 mg on alternate days, prescribed pre-flight and continued for the first 90 mission days. Daily multivitamin.',
      summary:
        'Sarah is medically fit for long-duration flight with a monitored iron-status plan. No restriction on EVA or exercise. Repeat haemoglobin at each quarterly medical review; avoid penicillin-class antibiotics.',
    },
    initialAlerts: [
      {
        id: 'sw-1',
        severity: 'warning',
        title: 'Resting heart rate above personal baseline',
        time: '06:20 UTC',
        description: 'Heart rate is 104 BPM versus a pre-flight resting baseline of 70 BPM. Hydration, sleep debt and recent exercise should be reviewed.',
        unread: true,
        source: 'Cardio monitor',
      },
      {
        id: 'sw-2',
        severity: 'warning',
        title: 'Sleep debt increasing',
        time: '05:48 UTC',
        description: 'Last night’s sleep was 6.1 hours against a 7.5-hour target. Two consecutive nights below target recorded.',
        unread: true,
        source: 'Sleep patch',
      },
      {
        id: 'sw-3',
        severity: 'warning',
        title: 'Cumulative radiation above routine band',
        time: '02:36 UTC',
        description: 'Cumulative dose reached 3.22 mSv. This remains below the 5 mSv action level but warrants enhanced monitoring.',
        unread: true,
        source: 'Dosimeter',
      },
      {
        id: 'sw-4',
        severity: 'info',
        title: 'Quarterly haemoglobin review scheduled',
        time: '07:00 UTC',
        description: 'The next iron-status panel is due at the end of the current mission week.',
        unread: false,
        source: 'Flight surgeon',
      },
    ],
    inflight: {
      medications: [
        { name: 'Ferrous sulphate', dose: '65 mg', schedule: 'Alternate days · 09:00', status: 'Active' },
        { name: 'Daily multivitamin', dose: '1 tablet', schedule: 'Daily · 08:00', status: 'Active' },
        { name: 'Ondansetron', dose: '4 mg', schedule: 'As needed · nausea', status: 'Available' },
      ],
      observations: [
        {
          time: 'Today · 06:28 UTC',
          author: 'Dr. Lena Ortiz',
          note: 'Reports mild fatigue and a resting tachycardia. No chest pain, fever or breathlessness. Hydration increased; repeat vitals in 2 hours.',
        },
        {
          time: 'Sol 216 · 21:15 UTC',
          author: 'Sarah Williams',
          note: 'Sleep disrupted by a simulated solar-particle alarm drill. Feeling rested after the recovery window.',
        },
        {
          time: 'Sol 211 · 10:05 UTC',
          author: 'Dr. Marcus Bell',
          note: 'Iron-status review remains stable. Continue alternate-day supplementation and dietary iron counselling.',
        },
      ],
      emergencyEvents: [
        {
          id: 'sw-e1',
          time: 'Sol 201 · 03:44 UTC',
          title: 'Solar particle shelter drill',
          severity: 'Drill',
          summary: 'Crew moved to the shielded quarter in 3 minutes 12 seconds. Dosimeters reviewed; no exposure exceedance.',
          resolved: true,
        },
      ],
      previousSnapshots: [
        { label: '06:00 UTC', reading: 'HR 98 · SpO₂ 97% · 37.2 °C · RR 18' },
        { label: '00:00 UTC', reading: 'HR 84 · SpO₂ 97% · 37.0 °C · RR 16' },
        { label: 'Yesterday 18:00', reading: 'HR 108 · SpO₂ 96% · 37.4 °C · RR 20' },
      ],
    },
    wellnessSeed: {
      moodTrend: [
        { day: 'Mon', mood: 3, sleepQuality: 3 },
        { day: 'Tue', mood: 3, sleepQuality: 2 },
        { day: 'Wed', mood: 2, sleepQuality: 2 },
        { day: 'Thu', mood: 3, sleepQuality: 3 },
        { day: 'Fri', mood: 3, sleepQuality: 2 },
        { day: 'Sat', mood: 4, sleepQuality: 3 },
        { day: 'Sun', mood: 3, sleepQuality: 2 },
      ],
      bestReactionMs: 272,
      reactions: [301, 288, 272],
    },
    activitySeed: {
      exerciseGoal: 45,
      exerciseMinutes: 20,
      hydrationGoal: 2500,
      hydrationMl: 1250,
      sleepGoal: 8,
      sleepLogged: false,
      streakDays: 6,
      achievements: ['Hydration champion', 'Medical drill completed'],
    },
  },
  {
    id: 'AST-003',
    name: 'Marcus Chen',
    age: 41,
    mission: 'Artemis VII',
    status: 'NOMINAL',
    role: 'Payload & EVA Specialist',
    initials: 'MC',
    bloodType: 'B+',
    historySeed: 303,
    doseRate: 22.3,
    currentReadings: {
      heartRate: 126,
      spo2: 92,
      temperature: 38.0,
      respiration: 23,
      sleep: 6.4,
      radiation: 4.62,
    },
    previousReadings: {
      heartRate: 121,
      spo2: 93,
      temperature: 37.9,
      respiration: 22,
      sleep: 6.6,
      radiation: 4.52,
    },
    preFlight: {
      reportId: 'PFR-2037-003',
      examinationDate: '16 February 2037',
      facility: 'Earth Orbital Medical Center · Houston',
      physician: 'Dr. Lena Ortiz, Flight Surgeon',
      fitness: 'Cleared — asthma in remission, rescue inhaler onboard',
      validThrough: '15 February 2038',
      baseline: {
        heartRate: 76,
        spo2: 96,
        temperature: 36.8,
        respiration: 16,
        sleep: 7.1,
        radiation: 1.9,
      },
      bloodPressure: '124 / 80 mmHg',
      ecg: 'Normal sinus rhythm at 76 BPM. PR interval 160 ms, QRS 92 ms, QTc 418 ms. No ischaemia or arrhythmia on 24-hour Holter monitoring.',
      bloodOxygen: '96% at rest on ambient air; 97% after bronchodilator challenge. No exertional desaturation during the 12-minute walk test.',
      respiratory: 'Respiratory rate 16/min, lungs clear, no wheeze. Childhood asthma in full remission; methacholine challenge negative. FEV1 94% of predicted.',
      temperature: '36.8 °C oral, afebrile.',
      bloodTest:
        'Haemoglobin 14.8 g/dL, haematocrit 43%, white-cell count 7.1 × 10⁹/L with normal differential, platelets 262 × 10⁹/L. Lipid profile normal; HbA1c 5.2%. Renal and hepatic panels within range.',
      vision: 'Visual acuity 20/15 both eyes with corrective lenses. Intraocular pressure 15/14 mmHg. Normal peripheral fields.',
      hearing: 'Audiometry within flight standards. Mild high-frequency notch consistent with occupational noise exposure; no functional deficit.',
      boneDensity:
        'Lumbar spine T-score −0.3, femoral neck −0.2. Within normal range for age; enhanced resistive exercise recommended during transit.',
      conditions:
        'Childhood asthma, last exacerbation age 14, in sustained remission. Mild lumbar muscle strain in 2034, fully resolved. No cardiac, renal or metabolic disease.',
      allergies: 'Seasonal grass pollen allergy. No medication allergies.',
      medications:
        'Albuterol metered-dose inhaler 90 µg as needed for wheeze, carried in the onboard medical kit. Cetirizine 10 mg as needed for allergies.',
      summary:
        'David is medically fit for the mission with an asthma-in-remission monitoring plan. Rescue inhaler and allergy medication must remain in the onboard kit. Any new wheeze, fever or oxygen requirement should trigger flight-surgeon review.',
    },
    initialAlerts: [
      {
        id: 'dc-1',
        severity: 'warning',
        title: 'Tachycardia — 126 BPM',
        time: '06:15 UTC',
        description: 'Heart rate is above the flight warning threshold. Review temperature, hydration and work-rest schedule; ECG recommended.',
        unread: true,
        source: 'Cardio monitor',
      },
      {
        id: 'dc-2',
        severity: 'critical',
        title: 'SpO₂ below 95% baseline',
        time: '06:12 UTC',
        description: 'Blood oxygen saturation is 92%. Verify the oximeter signal, cabin oxygen partial pressure and respiratory effort.',
        unread: true,
        source: 'Oxygen sensor',
      },
      {
        id: 'dc-3',
        severity: 'warning',
        title: 'Elevated core temperature',
        time: '06:08 UTC',
        description: 'Core temperature is 38.0 °C. Increase fluid intake, rest and monitor for additional infective symptoms.',
        unread: true,
        source: 'Temperature probe',
      },
      {
        id: 'dc-4',
        severity: 'warning',
        title: 'Cumulative dose approaching action level',
        time: '03:20 UTC',
        description: 'Cumulative radiation dose is 4.62 mSv against a 5 mSv mission action level. Shielding review recommended.',
        unread: false,
        source: 'Dosimeter',
      },
    ],
    inflight: {
      medications: [
        { name: 'Albuterol inhaler', dose: '90 µg', schedule: 'As needed · wheeze', status: 'Available' },
        { name: 'Cetirizine', dose: '10 mg', schedule: 'As needed · allergy', status: 'Available' },
        { name: 'Acetaminophen', dose: '500 mg', schedule: 'As needed · max 3 g/day', status: 'Active' },
      ],
      observations: [
        {
          time: 'Today · 06:30 UTC',
          author: 'Dr. Lena Ortiz',
          note: 'Reports feeling warm and unusually tired after a sleep-cycle disruption. Mild tachycardia and lower SpO₂ noted. Awaiting repeat observations and cabin atmosphere check.',
        },
        {
          time: 'Sol 217 · 19:40 UTC',
          author: 'Crew self-check',
          note: 'Dry cough after cabin humidity change; no wheeze. Used no rescue inhaler. Humidity adjusted overnight.',
        },
        {
          time: 'Sol 208 · 08:15 UTC',
          author: 'Dr. Marcus Bell',
          note: 'Asthma remains in remission. Inhaler technique reviewed; device expiry confirmed for 14 months.',
        },
      ],
      emergencyEvents: [
        {
          id: 'dc-e1',
          time: 'Sol 203 · 11:12 UTC',
          title: 'Respiratory assessment',
          severity: 'Warning',
          summary: 'Transient dry cough and chest tightness after exercise in low humidity. SpO₂ remained 96%; resolved after rest and humidification.',
          resolved: true,
        },
      ],
      previousSnapshots: [
        { label: '06:00 UTC', reading: 'HR 121 · SpO₂ 93% · 37.9 °C · RR 22' },
        { label: '00:00 UTC', reading: 'HR 104 · SpO₂ 94% · 37.6 °C · RR 20' },
        { label: 'Yesterday 18:00', reading: 'HR 96 · SpO₂ 95% · 37.3 °C · RR 18' },
      ],
    },
    wellnessSeed: {
      moodTrend: [
        { day: 'Mon', mood: 3, sleepQuality: 3 },
        { day: 'Tue', mood: 2, sleepQuality: 2 },
        { day: 'Wed', mood: 2, sleepQuality: 2 },
        { day: 'Thu', mood: 3, sleepQuality: 3 },
        { day: 'Fri', mood: 3, sleepQuality: 2 },
        { day: 'Sat', mood: 2, sleepQuality: 2 },
        { day: 'Sun', mood: 2, sleepQuality: 2 },
      ],
      bestReactionMs: 296,
      reactions: [334, 318, 296],
    },
    activitySeed: {
      exerciseGoal: 30,
      exerciseMinutes: 10,
      hydrationGoal: 3000,
      hydrationMl: 1000,
      sleepGoal: 8,
      sleepLogged: false,
      streakDays: 3,
      achievements: ['Medical drill completed'],
    },
  },
    {
    id: 'AST-005',
    name: 'Dr. Sarah Connor',
    age: 35,
    mission: 'Artemis VII',
    status: 'Normal',
    role: 'Biomedical Specialist',
    initials: 'SC',
    bloodType: 'A+',
    historySeed: 505,
    doseRate: 0,
    currentReadings: {
      heartRate: 0,
      spo2: 0,
      temperature: 0,
      respiration: 0,
      sleep: 0,
      radiation: 0,
    },
    previousReadings: {
      heartRate: 0,
      spo2: 0,
      temperature: 0,
      respiration: 0,
      sleep: 0,
      radiation: 0,
    },
    preFlight: {},
    initialAlerts: [],
    inflight: {
      medications: [],
      observations: [],
      emergencyEvents: [],
      previousSnapshots: [],
    },
    wellnessSeed: {
      moodTrend: [],
      bestReactionMs: 0,
      reactions: [],
    },
    activitySeed: {
      exerciseGoal: 0,
      exerciseMinutes: 0,
      hydrationGoal: 0,
      hydrationMl: 0,
      sleepGoal: 0,
      sleepLogged: false,
      streakDays: 0,
      achievements: [],
    },
  },
]


export const ASTRONAUTS = PROFILES.map(withHistory)

export const ASTRONAUT_MAP = Object.fromEntries(ASTRONAUTS.map((astronaut) => [astronaut.id, astronaut]))

export const DEMO_ASTRONAUT_ID = 'ASTRO_001'

export const getAstronaut = (id) => ASTRONAUT_MAP[id] ?? ASTRONAUTS[0]

export const normalizeAstronautId = (value) => value?.trim().toUpperCase().replace(/-/g, '_') ?? ''

export const findAstronautByLoginId = (value) => {
  const normalized = normalizeAstronautId(value)
  return ASTRONAUTS.find((astronaut) => astronaut.id === normalized) ?? null
}

export const initialReadingsByAstronaut = () =>
  Object.fromEntries(ASTRONAUTS.map((astronaut) => [astronaut.id, { ...astronaut.currentReadings }]))

export const initialPreviousByAstronaut = () =>
  Object.fromEntries(ASTRONAUTS.map((astronaut) => [astronaut.id, { ...astronaut.previousReadings }]))

export const initialAlertsByAstronaut = () =>
  Object.fromEntries(
    ASTRONAUTS.map((astronaut) => [
      astronaut.id,
      astronaut.initialAlerts.map((alert) => ({ ...alert })),
    ]),
  )

export const initialMessagesByAstronaut = () =>
  Object.fromEntries(
    ASTRONAUTS.map((astronaut) => [
      astronaut.id,
      [
        {
          id: `welcome-${astronaut.id}`,
          role: 'assistant',
          tag: 'SYSTEM',
          time: '06:40 UTC',
          content: `AstroGuardian Medical AI online for ${astronaut.name} (${astronaut.id}). I am running on the on-device rule engine in offline demo mode. Describe a symptom and I will return a crew-level assessment protocol. I provide decision support — I do not diagnose disease.`,
        },
      ],
    ]),
  )

export const initialWellnessByAstronaut = () =>
  Object.fromEntries(
    ASTRONAUTS.map((astronaut) => [
      astronaut.id,
      {
        ...astronaut.wellnessSeed,
        todayMood: null,
        todaySleepQuality: null,
      },
    ]),
  )

export const initialActivityByAstronaut = () =>
  Object.fromEntries(
    ASTRONAUTS.map((astronaut) => [astronaut.id, { ...astronaut.activitySeed }]),
  )
