import {
  Activity,
  Bot,
  Brain,
  ClipboardList,
  Dumbbell,
  LayoutDashboard,
  PersonStanding,
  Radiation,
  Settings,
} from 'lucide-react'

export const NAVIGATION = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Live simulated vitals, alerts and AI decision support.',
    planned: ['Crew vitals overview', 'AI medical assistant', 'Alert escalation workflow'],
  },
  {
    id: 'digital-twin',
    label: 'Digital Twin',
    icon: PersonStanding,
    description: 'Interactive body-region telemetry with a Three.js-ready visualisation surface.',
    planned: ['Three.js anatomy model', 'Region-level drill-down', 'Longitudinal body map'],
  },
  {
    id: 'health-monitoring',
    label: 'Health Monitoring',
    icon: Activity,
    description: 'Longitudinal physiological trends and flight-surgeon thresholds.',
    planned: ['Custom metric thresholds', 'Trend anomaly detection', 'Clinical notes export'],
  },
  {
    id: 'ai-assistant',
    label: 'AI Medical Assistant',
    icon: Bot,
    description: 'Offline symptom triage and protocol guidance for the crew.',
    planned: ['On-device model runtime', 'Voice symptom capture', 'Protocol library'],
  },
  {
    id: 'radiation',
    label: 'Radiation Monitoring',
    icon: Radiation,
    description: 'Cumulative dose, solar particle alerts and shielding protocol.',
    planned: ['Live dose-rate chart', 'Solar event forecasts', 'Shelter drill workflow'],
  },
  {
    id: 'mental-wellness',
    label: 'Mental Wellness',
    icon: Brain,
    description: 'Sleep, mood and crew resilience check-ins.',
    planned: ['Daily mood journal', 'Sleep continuity analysis', 'Private crew psychologist channel'],
  },
  {
    id: 'health-activities',
    label: 'Health Activities',
    icon: Dumbbell,
    description: 'Exercise prescriptions and load-bearing countermeasures.',
    planned: ['Resistive exercise plans', 'Bone-load tracking', 'Recovery score'],
  },
  {
    id: 'medical-history',
    label: 'Medical History',
    icon: ClipboardList,
    description: 'Crew medical timeline, interventions and exam records.',
    planned: ['Encounter timeline', 'Medication log', 'Flight-surgeon sign-off'],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    description: 'Simulation parameters, alert thresholds and interface preferences.',
    planned: ['Threshold editor', 'Simulation speed', 'Notification preferences'],
  },
]

export const getModule = (id) => NAVIGATION.find((item) => item.id === id) ?? NAVIGATION[0]
