import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  ASTRONAUTS,
  ASTRONAUT_MAP,
  DEMO_ASTRONAUT_ID,
  getAstronaut,
  initialActivityByAstronaut,
  initialAlertsByAstronaut,
  initialMessagesByAstronaut,
  initialPreviousByAstronaut,
  initialReadingsByAstronaut,
  initialWellnessByAstronaut,
} from '../data/astronauts'
import {
  BODY_REGIONS,
  EMERGENCY_SCENARIOS,
  METRIC_ORDER,
  METRICS,
  getStatus,
  worstStatus,
} from '../data/missionData'
import {
  SYMPTOM_LOCATION_PROMPT,
  SYMPTOM_OPTIONS,
  getAssistantReply,
  getSymptomOptionReply,
} from '../lib/assistant'

const MissionContext = createContext(null)
const API_BASE_URL = 'https://astrahealth-ai-backend-z596.onrender.com'
const mapBackendReadings = (records) => {
  return Object.fromEntries(
    records.map((record) => [
      record.astronaut_id,
      {
        heartRate: record.heart_rate,
        spo2: record.spo2,
        temperature: record.body_temperature,
        respiration: record.respiratory_rate,
        sleep: record.sleep_hours,
        radiation: record.radiation_exposure,
      },
    ]),
  )
}
const CLAMPS = {
  heartRate: [38, 190],
  spo2: [72, 100],
  temperature: [34.5, 41.5],
  respiration: [5, 40],
  sleep: [0, 12],
  radiation: [0, 20],
}

const DEFAULT_PREFERENCES = {
  notifications: { critical: true, warning: true, info: false },
  voice: { enabled: true, autoSpeak: true, rate: 1 },
  simulation: { liveUpdates: true, speed: 6000 },
}

const nowStamp = () =>
  `${new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  })} UTC`

const makeMessage = (role, content, extra = {}) => ({
  id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  role,
  content,
  time: nowStamp(),
  ...extra,
})

export function MissionProvider({ children, initialAstronautId, onLogout }) {
  const [selectedAstronautId, setSelectedAstronautId] = useState(() =>
    ASTRONAUT_MAP[initialAstronautId] ? initialAstronautId : DEMO_ASTRONAUT_ID,
  )
  const [readingsByAstronaut, setReadingsByAstronaut] = useState(initialReadingsByAstronaut)
  const [previousByAstronaut, setPreviousByAstronaut] = useState(initialPreviousByAstronaut)
  const [alertsByAstronaut, setAlertsByAstronaut] = useState(initialAlertsByAstronaut)
  const [messagesByAstronaut, setMessagesByAstronaut] = useState(initialMessagesByAstronaut)
  const [wellnessByAstronaut, setWellnessByAstronaut] = useState(initialWellnessByAstronaut)
  const [activityByAstronaut, setActivityByAstronaut] = useState(initialActivityByAstronaut)
  const [scenarioByAstronaut, setScenarioByAstronaut] = useState({})
  const [regionOverridesByAstronaut, setRegionOverridesByAstronaut] = useState({})
  const [selectedRegion, setSelectedRegion] = useState('heart')
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES)
  const [toast, setToast] = useState(null)
  const [networkOnline, setNetworkOnline] = useState(
    typeof navigator === 'undefined' ? true : navigator.onLine,
  )
const [backendConnected, setBackendConnected] = useState(false)
const [mlPredictionsByAstronaut, setMlPredictionsByAstronaut] = useState({})
  const readingsMapRef = useRef(readingsByAstronaut)
  const emergencyIndex = useRef(0)

  const selectedAstronaut = getAstronaut(selectedAstronautId)
  const readings = readingsByAstronaut[selectedAstronautId] ?? selectedAstronaut.currentReadings
  const previousReadings =
    previousByAstronaut[selectedAstronautId] ?? selectedAstronaut.previousReadings
  const alerts = alertsByAstronaut[selectedAstronautId] ?? []
  const messages = messagesByAstronaut[selectedAstronautId] ?? []
  const activeScenario = scenarioByAstronaut[selectedAstronautId] ?? null
  const regionOverrides = regionOverridesByAstronaut[selectedAstronautId] ?? {}
  const wellness = wellnessByAstronaut[selectedAstronautId]
  const activities = activityByAstronaut[selectedAstronautId]

  const pushToast = useCallback((nextToast) => {
    setToast({ id: Date.now(), ...nextToast })
  }, [])

  useEffect(() => {
    readingsMapRef.current = readingsByAstronaut
  }, [readingsByAstronaut])

  useEffect(() => {
    const goOnline = () => setNetworkOnline(true)
    const goOffline = () => setNetworkOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])
useEffect(() => {
  let isMounted = true

  const fetchHealthData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health-data/latest`)

      if (!response.ok) {
        throw new Error('Failed to fetch health data')
      }

      const records = await response.json()
      console.log('Backend ML predictions:', records.map(record => ({
  astronaut: record.astronaut_id,
  prediction: record.ml_prediction,
})))
      const mappedData = mapBackendReadings(records)
      setMlPredictionsByAstronaut(
  Object.fromEntries(
    records.map(record => [
      record.astronaut_id,
      record.ml_prediction
    ])
  )
)

      if (!isMounted) return

      setReadingsByAstronaut((prev) => {
        const next = { ...prev, ...mappedData }
        readingsMapRef.current = next
        return next
      })

      setBackendConnected(true)
    } catch (error) {
      console.error('Backend connection error:', error)
      if (isMounted) setBackendConnected(false)
    }
  }

  fetchHealthData()
  const interval = setInterval(fetchHealthData, 6000)

  return () => {
    isMounted = false
    clearInterval(interval)
  }
}, [])

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(null), 5200)
    return () => clearTimeout(timer)
  }, [toast])

  /* Periodic simulated telemetry — every reading is generated. */
  useEffect(() => {
    if (!preferences.simulation.liveUpdates || backendConnected) return undefined

    const interval = setInterval(() => {
      const currentMap = readingsMapRef.current
      const nextMap = {}

      ASTRONAUTS.forEach((astronaut) => {
        const current = currentMap[astronaut.id] ?? astronaut.currentReadings
        const scenario = scenarioByAstronaut[astronaut.id]
        const scenarioReadings = scenario?.readings ?? {}
        const next = {}

        METRIC_ORDER.forEach((key) => {
          const meta = METRICS[key]
          const scenarioValue = scenarioReadings[key]
          const target =
            scenarioValue !== undefined
              ? scenarioValue
              : scenario
                ? current[key]
                : astronaut.currentReadings[key]
          const isSlow = key === 'sleep' || key === 'radiation'
          const drift = (Math.random() - 0.5) * 2 * meta.jitter * (isSlow ? 0.5 : 1)
          const [min, max] = CLAMPS[key]
          const value = Math.min(max, Math.max(min, target + drift))
          next[key] = Number(value.toFixed(meta.precision))
        })

        nextMap[astronaut.id] = next
      })

      setPreviousByAstronaut(currentMap)
      setReadingsByAstronaut(nextMap)
      readingsMapRef.current = nextMap
    }, preferences.simulation.speed)

    return () => clearInterval(interval)
  }, [preferences.simulation.liveUpdates, preferences.simulation.speed, scenarioByAstronaut, backendConnected])

  const metricStatuses = useMemo(
    () =>
      Object.fromEntries(
        METRIC_ORDER.map((key) => [key, getStatus(key, readings[key])]),
      ),
    [readings],
  )

  const regionStatuses = useMemo(() => {
    const statuses = {}
    BODY_REGIONS.forEach((region) => {
      let status = metricStatuses[region.statusKey]
      if (region.id === 'lungs') {
        status = worstStatus(metricStatuses.spo2, metricStatuses.respiration)
      }
      if (region.id === 'brain') {
        status = worstStatus(metricStatuses.sleep, metricStatuses.temperature)
      }
      statuses[region.id] = status
    })

    Object.entries(regionOverrides).forEach(([id, level]) => {
      statuses[id] = {
        level,
        label: level === 'critical' ? 'Critical' : level === 'warning' ? 'Warning' : 'Optimal',
      }
    })

    return statuses
  }, [metricStatuses, regionOverrides])

  const selectAstronaut = useCallback(
    (id) => {
      if (!ASTRONAUT_MAP[id] || id === selectedAstronautId) return
      setSelectedAstronautId(id)
      setSelectedRegion('heart')
      const astronaut = ASTRONAUT_MAP[id]
      pushToast({
        type: 'info',
        title: 'Astronaut profile switched',
        message: `Now monitoring ${astronaut.name} · ${astronaut.id}`,
      })
    },
    [pushToast, selectedAstronautId],
  )

  const triggerEmergency = useCallback(() => {
    const baseScenario = EMERGENCY_SCENARIOS[emergencyIndex.current % EMERGENCY_SCENARIOS.length]
    emergencyIndex.current += 1
    const astronaut = getAstronaut(selectedAstronautId)
    const scenario = {
      ...baseScenario,
      title: baseScenario.title.replace('crew member AG-2041', `${astronaut.name} (${astronaut.id})`),
    }

    const current = readingsMapRef.current[astronaut.id] ?? astronaut.currentReadings
    setPreviousByAstronaut((prev) => ({ ...prev, [astronaut.id]: current }))
    setReadingsByAstronaut((prev) => {
      const next = {
        ...prev,
        [astronaut.id]: { ...astronaut.currentReadings, ...scenario.readings },
      }
      readingsMapRef.current = next
      return next
    })
    setScenarioByAstronaut((prev) => ({ ...prev, [astronaut.id]: scenario }))
    setRegionOverridesByAstronaut((prev) => ({ ...prev, [astronaut.id]: scenario.regions }))
    setSelectedRegion(scenario.region)
    setAlertsByAstronaut((prev) => ({
      ...prev,
      [astronaut.id]: [
        {
          id: `sim-${Date.now()}`,
          severity: scenario.severity,
          title: scenario.title,
          time: nowStamp(),
          description: scenario.description,
          unread: true,
          source: 'Emergency simulation',
          simulated: true,
        },
        ...(prev[astronaut.id] ?? []),
      ],
    }))
    setMessagesByAstronaut((prev) => ({
      ...prev,
      [astronaut.id]: [
        ...(prev[astronaut.id] ?? []),
        makeMessage(
          'assistant',
          `Subject: ${astronaut.name} (${astronaut.id}).\n\n${scenario.assistant}`,
          {
            tag: 'EMERGENCY PROTOCOL',
            severity: scenario.severity,
            emergency: true,
          },
        ),
      ],
    }))
    pushToast({
      type: scenario.severity,
      title: 'Emergency simulation active',
      message: `${scenario.name} — ${astronaut.name}’s biosignals and body regions updated.`,
    })
    return scenario
  }, [pushToast, selectedAstronautId])

  const resetSimulation = useCallback(() => {
    const astronaut = getAstronaut(selectedAstronautId)
    const current = readingsMapRef.current[astronaut.id] ?? astronaut.currentReadings
    setPreviousByAstronaut((prev) => ({ ...prev, [astronaut.id]: current }))
    setReadingsByAstronaut((prev) => {
      const next = { ...prev, [astronaut.id]: { ...astronaut.currentReadings } }
      readingsMapRef.current = next
      return next
    })
    setScenarioByAstronaut((prev) => {
      const next = { ...prev }
      delete next[astronaut.id]
      return next
    })
    setRegionOverridesByAstronaut((prev) => {
      const next = { ...prev }
      delete next[astronaut.id]
      return next
    })
    setSelectedRegion('heart')
    setAlertsByAstronaut((prev) => ({
      ...prev,
      [astronaut.id]: [
        {
          id: `reset-${Date.now()}`,
          severity: 'info',
          title: 'Simulation reset — baseline restored',
          time: nowStamp(),
          description: `All simulated readings for ${astronaut.name} have returned to the flight baseline. Emergency flags cleared.`,
          unread: false,
          source: 'Simulation control',
        },
        ...(prev[astronaut.id] ?? []).filter((alert) => !alert.simulated),
      ],
    }))
    setMessagesByAstronaut((prev) => ({
      ...prev,
      [astronaut.id]: [
        ...(prev[astronaut.id] ?? []),
        makeMessage(
          'assistant',
          `Simulation reset complete for ${astronaut.name}. Heart rate, SpO₂, temperature, respiration, sleep and cumulative dose are back at the flight baseline. Emergency flags have been cleared.`,
          { tag: 'SYSTEM' },
        ),
      ],
    }))
    pushToast({
      type: 'success',
      title: 'Flight baseline restored',
      message: `${astronaut.name}’s simulated readings are back to baseline.`,
    })
  }, [pushToast, selectedAstronautId])

  const resetAllSimulations = useCallback(() => {
    const nextMap = Object.fromEntries(
      ASTRONAUTS.map((astronaut) => [astronaut.id, { ...astronaut.currentReadings }]),
    )
    setReadingsByAstronaut(nextMap)
    readingsMapRef.current = nextMap
    setPreviousByAstronaut(initialPreviousByAstronaut())
    setScenarioByAstronaut({})
    setRegionOverridesByAstronaut({})
    setSelectedRegion('heart')
    setAlertsByAstronaut((prev) =>
      Object.fromEntries(
        Object.entries(prev).map(([id, list]) => [id, list.filter((alert) => !alert.simulated)]),
      ),
    )
    pushToast({
      type: 'success',
      title: 'All simulations reset',
      message: 'Every astronaut profile is back at its flight baseline.',
    })
  }, [pushToast])

  const askAssistant = useCallback(
    (question) => {
      const text = question.trim()
      if (!text) return ''
      const astronaut = getAstronaut(selectedAstronautId)
      const currentReadings =
        readingsMapRef.current[astronaut.id] ?? astronaut.currentReadings
      const reply = getAssistantReply(text, currentReadings)
      setMessagesByAstronaut((prev) => ({
        ...prev,
        [astronaut.id]: [
          ...(prev[astronaut.id] ?? []),
          makeMessage('user', text),
          makeMessage('assistant', reply, { tag: 'DECISION SUPPORT' }),
        ],
      }))
      return reply
    },
    [selectedAstronautId],
  )

  const sendAssistantExchange = useCallback(
    (userText, assistantText, extra = {}) => {
      if (!assistantText?.trim()) return ''
      setMessagesByAstronaut((prev) => ({
        ...prev,
        [selectedAstronautId]: [
          ...(prev[selectedAstronautId] ?? []),
          ...(userText?.trim() ? [makeMessage('user', userText.trim())] : []),
          makeMessage('assistant', assistantText, { tag: 'DECISION SUPPORT', ...extra }),
        ],
      }))
      return assistantText
    },
    [selectedAstronautId],
  )

  const startSymptomTriage = useCallback(() => {
    setMessagesByAstronaut((prev) => ({
      ...prev,
      [selectedAstronautId]: [
        ...(prev[selectedAstronautId] ?? []),
        makeMessage('assistant', SYMPTOM_LOCATION_PROMPT, {
          tag: 'TRIAGE',
          options: SYMPTOM_OPTIONS,
          optionPrompt: true,
        }),
      ],
    }))
    return { prompt: SYMPTOM_LOCATION_PROMPT, options: SYMPTOM_OPTIONS }
  }, [selectedAstronautId])

  const selectAssistantOption = useCallback(
    (option) => {
      const astronaut = getAstronaut(selectedAstronautId)
      const currentReadings =
        readingsMapRef.current[astronaut.id] ?? astronaut.currentReadings
      const reply = getSymptomOptionReply(option.value, currentReadings)
      setMessagesByAstronaut((prev) => ({
        ...prev,
        [selectedAstronautId]: [
          ...(prev[selectedAstronautId] ?? []),
          makeMessage('user', option.label),
          makeMessage('assistant', reply, { tag: 'TRIAGE' }),
        ],
      }))
      return reply
    },
    [selectedAstronautId],
  )

  const markAlertsRead = useCallback(() => {
    setAlertsByAstronaut((prev) => ({
      ...prev,
      [selectedAstronautId]: (prev[selectedAstronautId] ?? []).map((alert) => ({
        ...alert,
        unread: false,
      })),
    }))
  }, [selectedAstronautId])

  const updateWellness = useCallback(
    (patch) => {
      setWellnessByAstronaut((prev) => {
        const current = prev[selectedAstronautId]
        const next = typeof patch === 'function' ? patch(current) : { ...current, ...patch }
        return { ...prev, [selectedAstronautId]: next }
      })
    },
    [selectedAstronautId],
  )

  const updateActivity = useCallback(
    (patch) => {
      setActivityByAstronaut((prev) => {
        const current = prev[selectedAstronautId]
        const next = typeof patch === 'function' ? patch(current) : { ...current, ...patch }
        return { ...prev, [selectedAstronautId]: next }
      })
    },
    [selectedAstronautId],
  )

  const updatePreferences = useCallback((section, patch) => {
    setPreferences((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...patch },
    }))
  }, [])

  const unreadCount = alerts.filter((alert) => alert.unread).length

  const value = useMemo(
    () => ({
      astronauts: ASTRONAUTS,
      selectedAstronaut,
      selectedAstronautId,
      selectAstronaut,
      readings,
      previousReadings,
      metricStatuses,
      regionStatuses,
      selectedRegion,
      setSelectedRegion,
      activeScenario,
      alerts,
      unreadCount,
      markAlertsRead,
      messages,
      askAssistant,
      sendAssistantExchange,
      startSymptomTriage,
      selectAssistantOption,
      triggerEmergency,
      resetSimulation,
      resetAllSimulations,
      wellness,
      updateWellness,
      activities,
      updateActivity,
      preferences,
      updatePreferences,
      networkOnline,
      toast,
      notify: pushToast,
      dismissToast: () => setToast(null),
      onLogout,
    }),
    [
      selectedAstronaut,
      selectedAstronautId,
      selectAstronaut,
      readings,
      previousReadings,
      metricStatuses,
      regionStatuses,
      selectedRegion,
      activeScenario,
      alerts,
      unreadCount,
      markAlertsRead,
      messages,
      askAssistant,
      sendAssistantExchange,
      startSymptomTriage,
      selectAssistantOption,
      triggerEmergency,
      resetSimulation,
      resetAllSimulations,
      wellness,
      updateWellness,
      activities,
      updateActivity,
      preferences,
      updatePreferences,
      networkOnline,
      toast,
      pushToast,
      onLogout,
    ],
  )

  return <MissionContext.Provider value={value}>{children}</MissionContext.Provider>
}

export function useMission() {
  const context = useContext(MissionContext)
  if (!context) throw new Error('useMission must be used inside MissionProvider')
  return context
}
