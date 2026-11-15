/**
 * Voice intent helpers for the prototype assistant.
 * These are intentionally simple keyword rules and do not require a cloud model.
 */

export const EMERGENCY_PHRASES = [
  'emergency help',
  'start emergency mode',
  'activate emergency mode',
  'emergency assistance',
  'i need emergency help',
]

const normalize = (text) =>
  text
    .toLowerCase()
    .replace(/[,!.?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export function isEmergencyPhrase(transcript) {
  const text = normalize(transcript)
  if (!text.includes('emergency')) return EMERGENCY_PHRASES.some((phrase) => text.includes(phrase))
  const addressed = ['astroguardian', 'astro guardian', 'guardian'].some((name) => text.includes(name))
  return addressed || EMERGENCY_PHRASES.some((phrase) => text.includes(phrase))
}

const NAVIGATION_RULES = [
  { page: 'dashboard', label: 'Dashboard', terms: ['open dashboard', 'go to dashboard', 'show dashboard', 'mission control'] },
  {
    page: 'health-monitoring',
    label: 'Health Monitoring',
    terms: ['open health monitoring', 'health monitoring', 'show health', 'vitals', 'my health'],
  },
  {
    page: 'medical-history',
    label: 'Medical History',
    terms: ['open medical history', 'medical history', 'my medical records', 'pre flight report', 'preflight report', 'medical report'],
  },
  {
    page: 'radiation',
    label: 'Radiation Monitoring',
    terms: ['show radiation levels', 'radiation levels', 'open radiation', 'radiation monitoring', 'radiation exposure'],
  },
  {
    page: 'mental-wellness',
    label: 'Mental Wellness',
    terms: ['open mental wellness', 'mental wellness', 'wellness', 'mood check'],
  },
  { page: 'digital-twin', label: 'Digital Twin', terms: ['open digital twin', 'digital twin', 'body map', 'show body'] },
  { page: 'health-activities', label: 'Health Activities', terms: ['open health activities', 'health activities', 'exercise goals', 'activities'] },
  { page: 'ai-assistant', label: 'AI Medical Assistant', terms: ['open ai assistant', 'open medical assistant', 'ai assistant'] },
  { page: 'settings', label: 'Settings', terms: ['open settings', 'settings', 'preferences'] },
]

export function parseNavigationCommand(transcript) {
  const text = normalize(transcript)
  if (!text) return null
  for (const rule of NAVIGATION_RULES) {
    if (rule.terms.some((term) => text.includes(term))) return rule
  }
  return null
}

export function matchVoiceOption(transcript, options = []) {
  const text = normalize(transcript)
  if (!text || !options.length) return null

  return (
    options.find((option) =>
      (option.aliases ?? [option.label]).some((alias) => {
        const value = normalize(alias)
        return text === value || text.includes(value)
      }),
    ) ?? null
  )
}

export function isStopSpeakingCommand(transcript) {
  const text = normalize(transcript)
  return ['stop speaking', 'stop talking', 'be quiet', 'silence'].some((phrase) => text.includes(phrase))
}

export function isStopListeningCommand(transcript) {
  const text = normalize(transcript)
  return ['stop listening', 'stop microphone', 'microphone off'].some((phrase) => text.includes(phrase))
}
