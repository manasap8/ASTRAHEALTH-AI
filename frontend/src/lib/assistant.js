/**
 * Rule-based on-device medical assistant.
 * Everything here is decision support for a simulation — never a diagnosis.
 */

const includesAny = (text, terms) => terms.some((term) => text.includes(term))

export function getAssistantReply(question, readings) {
  const q = question.toLowerCase().trim()
  const hr = Math.round(readings.heartRate)
  const spo2 = Math.round(readings.spo2)
  const temp = Number(readings.temperature).toFixed(1)
  const rr = Math.round(readings.respiration)
  const sleep = Number(readings.sleep).toFixed(1)
  const dose = Number(readings.radiation).toFixed(2)

  if (includesAny(q, ['chest', 'heart', 'palpitat', 'tight', 'arrhythm', 'pulse'])) {
    return `I am recording a cardiovascular symptom report against your simulated baseline (HR ${hr} BPM, SpO₂ ${spo2}%). This is decision support, not a diagnosis.

Recommended next steps:
1. Sit down and rest; avoid strenuous activity until assessed.
2. Record a 12-lead ECG and a blood-pressure reading if the equipment is available.
3. Note when the symptom started, its duration, and whether it radiates to the arm, jaw or back.
4. Seek urgent review if you also have breathlessness, sweating, fainting or pulse irregularity.
5. The flight surgeon should review the ECG trace before any EVA or exercise.`
  }

  if (includesAny(q, ['breath', 'oxygen', 'hypox', 'suffocat', 'wheez', 'lung', 'air'])) {
    return `Your reported respiratory symptom is being compared with the simulated SpO₂ (${spo2}%) and respiration rate (${rr} br/min). This is decision support, not a diagnosis.

Recommended next steps:
1. Verify cabin O₂ partial pressure and your mask or cannula seal.
2. Sit upright and rest; apply supplemental oxygen if SpO₂ is below 94% on the flight-surgeon protocol.
3. Recheck SpO₂ and respiration every 60 seconds and log the values.
4. Watch for confusion, cyanosis, or increasing work of breathing — these are escalation signs.
5. Escalate to mission control if saturation remains below 90% after two readings.`
  }

  if (includesAny(q, ['head', 'dizzy', 'migraine', 'vision', 'eye', 'faint', 'vertigo'])) {
    return `I have logged a neurological symptom report. Your simulated sleep duration is ${sleep} hours and core temperature ${temp} °C. This is decision support, not a diagnosis.

Recommended next steps:
1. Stop tasks that need fine motor control or sharp attention.
2. Check for dehydration and take 300–500 ml of water slowly.
3. Measure blood pressure and pulse sitting, then standing.
4. Report any new visual field loss, weakness, confusion or severe sudden headache immediately.
5. Notify the flight surgeon if the symptom persists beyond 30 minutes.`
  }

  if (includesAny(q, ['stomach', 'abdom', 'nausea', 'vomit', 'belly', 'digest'])) {
    return `I have recorded an abdominal symptom report. Current simulated observations: HR ${hr} BPM, temperature ${temp} °C. This is decision support, not a diagnosis.

Recommended next steps:
1. Stop eating solid food temporarily and sip clear fluids.
2. Note whether the discomfort is upper or lower, constant or cramping, and whether it moves.
3. Check for fever, vomiting, blood in stool, or inability to keep fluids down.
4. Isolate shared food items and log the last meal for the flight surgeon.
5. Escalate immediately for severe or worsening pain, especially with fever or guarding.`
  }

  if (includesAny(q, ['sleep', 'insomnia', 'tired', 'fatigue', 'exhaust', 'restless', 'awake'])) {
    return `Your simulated sleep is currently ${sleep} hours against a 7.5-hour mission target. This is decision support, not a diagnosis.

Recommended next steps:
1. Dim the cabin lights and limit screen exposure for the next hour.
2. Keep the next sleep window protected; avoid caffeine within 6 hours of it.
3. Try 10 minutes of slow breathing (4 seconds in, 6 seconds out) before sleep.
4. Log any snoring, apnoea or unusual daytime sleepiness for the flight surgeon.
5. If fatigue interferes with safety-critical tasks, hand them over and report it.`
  }

  if (includesAny(q, ['radiation', 'solar', 'dose', 'exposure'])) {
    return `Your simulated cumulative dose is ${dose} mSv. I have flagged this query for the radiation protocol. This is decision support, not a diagnosis.

Recommended next steps:
1. Confirm the current dose rate and any active solar particle alert.
2. Move to the shielded sleep quarters if the dose rate is elevated.
3. Keep hydrated and record any nausea, headache, skin changes or visual symptoms.
4. Do not begin an EVA while a radiation alert is active.
5. Request a radiation-surgeon consult from mission control for dose above 5 mSv.`
  }

  if (includesAny(q, ['fever', 'temperature', 'chill', 'hot', 'cold', 'sick'])) {
    return `Your simulated core temperature is ${temp} °C (HR ${hr} BPM). This is decision support, not a diagnosis.

Recommended next steps:
1. Re-measure temperature with a second method if available.
2. Increase fluid intake and rest; avoid heavy exercise.
3. Check for other signs of illness: sore throat, cough, rash, abdominal pain or urinary symptoms.
4. Isolate shared equipment and inform the flight surgeon if temperature exceeds 38 °C.
5. Escalate promptly if there is confusion, rapid breathing or a spreading rash.`
  }

  if (includesAny(q, ['bone', 'muscle', 'sprain', 'injur', 'joint', 'back', 'pain', 'arm', 'leg'])) {
    return `I have logged a musculoskeletal symptom report. Your simulated recovery indicator is derived from ${sleep} hours of sleep. This is decision support, not a diagnosis.

Recommended next steps:
1. Protect the area and stop loading it; use the station’s splint kit if needed.
2. Apply cold therapy for an acute injury and elevate if possible.
3. Check distal pulses, sensation and movement before and after any dressing.
4. Log pain score and function hourly, and notify the flight surgeon for worsening symptoms.
5. Do not resume resistive exercise until cleared.`
  }

  if (includesAny(q, ['anxious', 'anxiety', 'stress', 'panic', 'depress', 'mental', 'lonely', 'mood'])) {
    return `Thanks for flagging how you are feeling. This is a private decision-support check, not a psychological diagnosis.

Recommended next steps:
1. Try a 2-minute paced breathing exercise and name three things you can see and hear.
2. Message the crew psychologist or flight surgeon — confidential support is available on the mission timeline.
3. Protect sleep and hydration; both strongly affect mood in confinement.
4. Tell a crewmate if you feel unsafe or unable to perform safety-critical duties.
5. Use the Mental Wellness module for the full resilience protocol.`
  }

  if (includesAny(q, ['water', 'hydrat', 'thirst', 'drink'])) {
    return `Hydration status is not directly measured in this prototype. Your simulated readings are HR ${hr} BPM and SpO₂ ${spo2}%. This is decision support, not a diagnosis.

Recommended next steps:
1. Take 300–500 ml of water slowly and repeat in 30 minutes if tolerated.
2. Check urine colour against the crew hydration chart.
3. Increase intake before exercise or EVA preparation.
4. Report dizziness, dark urine or reduced output to the flight surgeon.
5. Add electrolytes if sweating or fluid loss has been significant.`
  }

  return `I can help you interpret symptoms and follow mission medical protocols. Current simulated snapshot: HR ${hr} BPM, SpO₂ ${spo2}%, temp ${temp} °C, respiration ${rr} br/min, sleep ${sleep} h, cumulative dose ${dose} mSv. This is decision support, not a diagnosis.

Try describing:
• What the symptom is and when it started.
• Whether it is getting worse, and what makes it better or worse.
• Any related symptoms such as chest pain, breathlessness or dizziness.

I can then suggest a crew-level protocol and escalation step. For an immediate life-threatening event, use Emergency Simulation or Emergency Voice Mode to walk through the escalation workflow.`
}

export const SUGGESTED_QUESTIONS = [
  'I have a headache and feel dizzy',
  'My chest feels tight',
  'I am short of breath',
  'I slept badly — should I worry?',
]

export const SYMPTOM_LOCATION_PROMPT =
  'Where are you experiencing discomfort? Choose one option below, or say the location aloud if voice mode is active.'

export const SYMPTOM_OPTIONS = [
  { value: 'head', label: 'Head', aliases: ['head', 'headache', 'migraine', 'skull'] },
  { value: 'chest', label: 'Chest', aliases: ['chest', 'heart', 'ribs'] },
  { value: 'stomach', label: 'Stomach', aliases: ['stomach', 'abdomen', 'belly', 'gut'] },
  { value: 'limbs', label: 'Arms or legs', aliases: ['arms', 'arm', 'legs', 'leg', 'limb', 'shoulder', 'knee'] },
  { value: 'other', label: 'Other', aliases: ['other', 'elsewhere', 'somewhere else', 'whole body'] },
]

export function getSymptomOptionReply(value, readings) {
  const hr = Math.round(readings.heartRate)
  const spo2 = Math.round(readings.spo2)
  const temp = Number(readings.temperature).toFixed(1)

  switch (value) {
    case 'head':
      return `Head and neurological symptoms recorded. Current simulated observations: HR ${hr} BPM, SpO₂ ${spo2}%, temperature ${temp} °C. This is decision support, not a diagnosis.

Next assessment steps:
1. Stop fine-motor or safety-critical tasks and rest in a dimmed cabin.
2. Check hydration and take 300 ml of water slowly.
3. Measure blood pressure and pulse sitting and standing.
4. Escalate immediately for sudden severe headache, weakness, confusion or vision loss.
5. Ask the flight surgeon to review if symptoms persist beyond 30 minutes.`
    case 'chest':
      return `Chest discomfort recorded. Current simulated observations: HR ${hr} BPM, SpO₂ ${spo2}%. This is decision support, not a diagnosis.

Next assessment steps:
1. Stop activity and sit down; do not proceed with EVA preparation.
2. Record a 12-lead ECG and blood pressure if available.
3. Note radiation of the pain to the arm, jaw or back, plus sweating or nausea.
4. Apply supplemental oxygen if SpO₂ falls below 94% on the approved protocol.
5. Escalate to the flight surgeon immediately for persistent or severe chest pain.`
    case 'stomach':
      return `Abdominal discomfort recorded. Current simulated temperature is ${temp} °C and heart rate ${hr} BPM. This is decision support, not a diagnosis.

Next assessment steps:
1. Stop solid food temporarily and sip clear fluids.
2. Localise the discomfort and note whether it is constant, cramping or moving.
3. Check for fever, vomiting, diarrhoea, blood or inability to keep fluids down.
4. Log the last meal and isolate shared food items for review.
5. Escalate for severe pain, guarding, fever or persistent vomiting.`
    case 'limbs':
      return `Arm or leg discomfort recorded. Current simulated observations: HR ${hr} BPM. This is decision support, not a diagnosis.

Next assessment steps:
1. Protect the limb and stop load-bearing activity.
2. Check colour, warmth, sensation, movement and distal pulses.
3. Use cold therapy and compression for a suspected soft-tissue injury.
4. Log pain and function every hour; report any new numbness or swelling.
5. Do not resume resistive exercise until the flight surgeon clears you.`
    default:
      return `I have recorded discomfort in another area. Current simulated observations: HR ${hr} BPM, SpO₂ ${spo2}%, temperature ${temp} °C. This is decision support, not a diagnosis.

Next assessment steps:
1. Describe the location, severity (0–10), onset and what makes it better or worse.
2. Check vital signs and repeat any abnormal reading after five minutes of rest.
3. Note associated symptoms such as fever, breathlessness, rash or vomiting.
4. Avoid safety-critical tasks until the symptom is assessed.
5. Notify the flight surgeon for severe, persistent or worsening symptoms.`
  }
}
