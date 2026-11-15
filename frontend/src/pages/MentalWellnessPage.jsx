import { useEffect, useRef, useState } from 'react'
import {
  Activity,
  CloudRain,
  Frown,
  Laugh,
  Meh,
  MoonStar,
  ShieldCheck,
  Smile,
  Sparkles,
  Timer,
  TrendingUp,
} from 'lucide-react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useMission } from '../context/MissionContext'
import { SectionHeader } from '../components/ui/SectionHeader'
import { StatusPill } from '../components/ui/StatusPill'

const MOOD_OPTIONS = [
  { value: 1, label: 'Very low', icon: Frown, tone: 'text-rose-300', border: 'border-rose-400/25', bg: 'bg-rose-500/[0.06]' },
  { value: 2, label: 'Low', icon: CloudRain, tone: 'text-amber-300', border: 'border-amber-400/25', bg: 'bg-amber-400/[0.05]' },
  { value: 3, label: 'Neutral', icon: Meh, tone: 'text-slate-300', border: 'border-slate-400/20', bg: 'bg-slate-400/[0.05]' },
  { value: 4, label: 'Good', icon: Smile, tone: 'text-cyan-300', border: 'border-cyan-300/25', bg: 'bg-cyan-400/[0.05]' },
  { value: 5, label: 'Great', icon: Laugh, tone: 'text-emerald-300', border: 'border-emerald-400/25', bg: 'bg-emerald-400/[0.05]' },
]

const QUALITY_LABELS = ['Very poor', 'Poor', 'Fair', 'Good', 'Excellent']

function WellnessTip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-cyan-300/25 bg-[#081326] px-2.5 py-2 shadow-xl">
      <div className="font-mono text-[7px] uppercase tracking-[0.1em] text-slate-500">{label}</div>
      {payload.map((entry) => (
        <div key={entry.name} className="mt-1 flex items-center gap-2 text-[9px]">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-400">{entry.name}</span>
          <span className="ml-auto font-mono text-slate-100">{entry.value} / 5</span>
        </div>
      ))}
    </div>
  )
}

export function MentalWellnessPage({ onNavigate }) {
  const { selectedAstronaut, wellness, updateWellness, readings } = useMission()
  const [phase, setPhase] = useState('idle')
  const [reaction, setReaction] = useState(null)
  const [tooSoon, setTooSoon] = useState(false)
  const timeoutRef = useRef(null)
  const readyAtRef = useRef(0)

  useEffect(() => {
    setPhase('idle')
    setReaction(null)
    setTooSoon(false)
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [selectedAstronaut.id])

  const mood = wellness.todayMood
  const sleepQuality = wellness.todaySleepQuality
  const trend = wellness.moodTrend

  const setMood = (value) => {
    updateWellness((current) => ({
      ...current,
      todayMood: value,
      moodTrend: current.moodTrend.map((entry, index) =>
        index === current.moodTrend.length - 1 ? { ...entry, mood: value } : entry,
      ),
    }))
  }

  const setSleepQuality = (value) => {
    updateWellness((current) => ({
      ...current,
      todaySleepQuality: value,
      moodTrend: current.moodTrend.map((entry, index) =>
        index === current.moodTrend.length - 1 ? { ...entry, sleepQuality: value } : entry,
      ),
    }))
  }

  const startReactionTest = () => {
    setTooSoon(false)
    setReaction(null)
    setPhase('waiting')
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    const delay = 1500 + Math.random() * 2500
    timeoutRef.current = setTimeout(() => {
      readyAtRef.current = performance.now()
      setPhase('ready')
    }, delay)
  }

  const handleReactionClick = () => {
    if (phase === 'waiting') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      setTooSoon(true)
      setPhase('idle')
      return
    }
    if (phase === 'ready') {
      const elapsed = Math.round(performance.now() - readyAtRef.current)
      setReaction(elapsed)
      setPhase('result')
      updateWellness((current) => ({
        ...current,
        reactions: [...(current.reactions ?? []).slice(-4), elapsed],
        bestReactionMs: Math.min(current.bestReactionMs ?? elapsed, elapsed),
      }))
    }
  }

  const averageMood = (trend.reduce((sum, entry) => sum + entry.mood, 0) / trend.length).toFixed(1)
  const averageQuality = (
    trend.reduce((sum, entry) => sum + entry.sleepQuality, 0) / trend.length
  ).toFixed(1)

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-4">
      <div className="fade-up flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="eyebrow">Crew resilience</span>
            <span className="rounded border border-amber-300/15 bg-amber-400/[0.05] px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-[0.1em] text-amber-200/70">
              Sample wellness data
            </span>
          </div>
          <h1 className="panel-title mt-1 text-xl font-semibold text-slate-50">Mental Wellness</h1>
          <p className="mt-1 max-w-[720px] text-[11px] leading-relaxed text-slate-400">
            Daily check-ins, sleep quality and a simple reaction check for {selectedAstronaut.name}.
            These tools support crew well-being and do not diagnose mental health conditions.
          </p>
        </div>
        <StatusPill level="info" label="Non-diagnostic support" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="glass-panel p-4 sm:p-5">
          <SectionHeader
            icon={Smile}
            eyebrow="Daily check-in"
            title="How are you feeling today?"
            description="A private self-report — no diagnosis is inferred."
            actions={
              mood ? (
                <span className="flex items-center gap-1 rounded border border-emerald-400/20 bg-emerald-400/[0.05] px-1.5 py-0.5 font-mono text-[6.5px] uppercase tracking-[0.08em] text-emerald-300/80">
                  <ShieldCheck size={8} />
                  Saved
                </span>
              ) : null
            }
          />
          <div className="mt-3 grid grid-cols-5 gap-1.5">
            {MOOD_OPTIONS.map((option) => {
              const Icon = option.icon
              const active = mood === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMood(option.value)}
                  aria-pressed={active}
                  className={`flex flex-col items-center gap-1.5 rounded-lg border px-1 py-2.5 transition ${
                    active
                      ? `${option.border} ${option.bg} ${option.tone}`
                      : 'border-white/[0.06] bg-white/[0.02] text-slate-500 hover:border-cyan-300/20 hover:text-slate-300'
                  }`}
                >
                  <Icon size={19} strokeWidth={1.7} />
                  <span className="text-center font-mono text-[6px] uppercase leading-tight tracking-[0.03em]">
                    {option.label}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="mt-3 rounded-lg border border-white/[0.05] bg-black/15 px-2.5 py-2">
            <p className="text-[8.5px] leading-relaxed text-slate-500">
              {mood
                ? `Today’s check-in is recorded as “${MOOD_OPTIONS.find((option) => option.value === mood)?.label}”. You can change it at any time.`
                : 'Choose the option that best matches your mood. The check-in is stored only in this browser session.'}
            </p>
          </div>
        </section>

        <section className="glass-panel p-4 sm:p-5">
          <SectionHeader
            icon={MoonStar}
            eyebrow="Sleep quality"
            title="Last night’s rest"
            description="Subjective sleep quality alongside measured duration."
            actions={
              <span className="rounded border border-white/[0.06] bg-white/[0.02] px-1.5 py-0.5 font-mono text-[7px] text-slate-500">
                {Number(readings.sleep).toFixed(1)} h measured
              </span>
            }
          />
          <div className="mt-4 flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setSleepQuality(value)}
                aria-pressed={sleepQuality === value}
                aria-label={`Sleep quality ${value}: ${QUALITY_LABELS[value - 1]}`}
                className={`flex h-9 flex-1 items-center justify-center rounded-lg border transition ${
                  sleepQuality && value <= sleepQuality
                    ? 'border-cyan-300/30 bg-cyan-400/[0.12] text-cyan-200'
                    : 'border-white/[0.06] bg-white/[0.02] text-slate-600 hover:border-cyan-300/20'
                }`}
              >
                <span className="font-mono text-[10px]">{value}</span>
              </button>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between font-mono text-[6.5px] uppercase tracking-[0.06em] text-slate-600">
            <span>Very poor</span>
            <span className="text-cyan-200/60">
              {sleepQuality ? QUALITY_LABELS[sleepQuality - 1] : 'Not rated'}
            </span>
            <span>Excellent</span>
          </div>
          <div className="mt-4 rounded-lg border border-white/[0.05] bg-black/15 p-2.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[6.5px] uppercase tracking-[0.1em] text-slate-600">
                Sleep duration vs goal
              </span>
              <span className="font-mono text-[7px] text-cyan-200/60">8 h target</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#0a1526]">
              <div
                className={`h-full rounded-full ${
                  readings.sleep >= 7 ? 'bg-gradient-to-r from-emerald-400/70 to-cyan-300/70' : 'bg-amber-400/70'
                }`}
                style={{ width: `${Math.min(100, (readings.sleep / 8) * 100)}%` }}
              />
            </div>
            <p className="mt-1.5 text-[8px] leading-relaxed text-slate-500">
              Measured sleep is simulated telemetry; quality is your subjective rating.
            </p>
          </div>
        </section>

        <section className="glass-panel p-4 sm:p-5">
          <SectionHeader
            icon={Timer}
            eyebrow="Cognitive check"
            title="Reaction time"
            description="A simple attention check, not a clinical test."
            actions={
              <span className="rounded border border-white/[0.06] bg-white/[0.02] px-1.5 py-0.5 font-mono text-[7px] text-slate-500">
                Best {wellness.bestReactionMs ?? '—'} ms
              </span>
            }
          />

          <div className="mt-3 flex min-h-[142px] flex-col items-center justify-center rounded-xl border border-white/[0.06] bg-black/20 p-3 text-center">
            {phase === 'waiting' && (
              <>
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-300/30 bg-amber-400/10">
                  <Timer size={22} className="text-amber-300" />
                </span>
                <p className="mt-2 text-[11px] font-medium text-amber-200">Wait for green…</p>
                <p className="mt-0.5 font-mono text-[7px] uppercase tracking-[0.06em] text-slate-600">
                  Click only when the target appears
                </p>
              </>
            )}
            {phase === 'ready' && (
              <button
                type="button"
                onClick={handleReactionClick}
                className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-emerald-300/60 bg-emerald-400/20 text-emerald-100 shadow-[0_0_40px_-8px_rgba(52,211,153,0.7)] transition hover:scale-105"
              >
                <span className="font-display text-[12px] font-semibold">CLICK</span>
              </button>
            )}
            {phase === 'idle' && (
              <>
                <Activity size={22} className="text-cyan-300/60" />
                <p className="mt-2 text-[9.5px] leading-relaxed text-slate-500">
                  {tooSoon
                    ? 'Too soon — wait for the green target.'
                    : 'Measure how quickly you respond to a visual cue.'}
                </p>
                <button
                  type="button"
                  onClick={startReactionTest}
                  className="btn-ghost mt-2.5 h-8 px-3 text-[9.5px]"
                >
                  {tooSoon ? 'Try again' : 'Start test'}
                </button>
              </>
            )}
            {phase === 'result' && (
              <>
                <span className="font-display text-[30px] font-semibold leading-none text-emerald-300">
                  {reaction}
                  <span className="ml-1 font-mono text-[10px] text-slate-500">ms</span>
                </span>
                <p className="mt-1 text-[9px] text-slate-500">Reaction recorded for this session.</p>
                <div className="mt-2 flex gap-1.5">
                  <button type="button" onClick={startReactionTest} className="btn-ghost h-7 px-2.5 text-[8.5px]">
                    Try again
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between font-mono text-[6.5px] text-slate-600">
            <span>Recent: {wellness.reactions?.join(' · ') || '—'} ms</span>
            <span>Session only</span>
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <section className="glass-panel p-4 sm:p-5 xl:col-span-8">
          <SectionHeader
            icon={TrendingUp}
            eyebrow="Seven-day pattern"
            title="Mental wellness trends"
            description="Self-reported mood and sleep quality. Higher values indicate better reported wellbeing."
            actions={<StatusPill level="info" label="Self-report" />}
          />
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            <div className="rounded-lg border border-white/[0.06] bg-black/15 px-2.5 py-2">
              <div className="font-mono text-[6.5px] uppercase tracking-[0.1em] text-slate-600">
                Average mood
              </div>
              <div className="mt-1 font-display text-[19px] font-semibold text-cyan-200">{averageMood} / 5</div>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-black/15 px-2.5 py-2">
              <div className="font-mono text-[6.5px] uppercase tracking-[0.1em] text-slate-600">
                Average sleep quality
              </div>
              <div className="mt-1 font-display text-[19px] font-semibold text-blue-200">
                {averageQuality} / 5
              </div>
            </div>
          </div>
          <div className="mt-2.5 rounded-xl border border-white/[0.05] bg-black/15 p-2">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trend} margin={{ top: 12, right: 12, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(148,180,220,0.06)" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} dy={4} />
                <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tickLine={false} axisLine={false} width={40} />
                <Tooltip content={<WellnessTip />} cursor={{ stroke: 'rgba(34,211,238,0.15)' }} />
                <Line
                  type="monotone"
                  dataKey="mood"
                  name="Mood"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  dot={{ r: 2.5, fill: '#22d3ee', strokeWidth: 0 }}
                  activeDot={{ r: 3.5 }}
                />
                <Line
                  type="monotone"
                  dataKey="sleepQuality"
                  name="Sleep quality"
                  stroke="#818cf8"
                  strokeWidth={1.8}
                  dot={{ r: 2.2, fill: '#818cf8', strokeWidth: 0 }}
                  activeDot={{ r: 3.2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center gap-4 font-mono text-[6.5px] uppercase tracking-[0.08em] text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="h-[2px] w-3 rounded bg-cyan-300" /> Mood
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-[2px] w-3 rounded bg-indigo-400" /> Sleep quality
            </span>
            <span className="ml-auto normal-case tracking-[0.02em]">Sample trend + today’s check-in</span>
          </div>
        </section>

        <div className="space-y-4 xl:col-span-4">
          <section className="glass-panel p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-400/80" />
              <span className="panel-title text-[11px] font-semibold text-slate-200">
                Supportive check-in
              </span>
            </div>
            <p className="mt-2 text-[9.5px] leading-relaxed text-slate-500">
              Feeling low, anxious or overwhelmed is important information, not a diagnosis. Share it
              with the flight surgeon or crew psychologist when you are ready. If you feel unsafe,
              tell a crewmate immediately.
            </p>
            <div className="mt-3 rounded-lg border border-cyan-300/15 bg-cyan-400/[0.04] p-2.5">
              <div className="flex items-center gap-1.5 font-mono text-[6.5px] uppercase tracking-[0.1em] text-cyan-200/60">
                <Sparkles size={9} />
                Suggested next step
              </div>
              <p className="mt-1 text-[8.5px] leading-relaxed text-slate-400">
                Try two minutes of paced breathing, then check in with a crewmate or the flight
                surgeon if the feeling persists.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('ai-assistant')}
              className="btn-ghost mt-3 h-8 w-full text-[9px]"
            >
              Talk to the AI assistant
            </button>
            <p className="mt-2 font-mono text-[6.5px] uppercase leading-relaxed tracking-[0.06em] text-slate-600">
              Not a diagnostic instrument. Mental wellness data is simulated/self-reported in this
              prototype.
            </p>
          </section>

          <section className="glass-panel p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <MoonStar size={13} className="text-blue-300/80" />
              <span className="panel-title text-[11px] font-semibold text-slate-200">
                Sleep coaching
              </span>
            </div>
            <div className="mt-2 space-y-1.5">
              {[
                'Protect a consistent sleep window aligned with the cabin lighting cycle.',
                'Limit screens and stimulants in the hour before sleep.',
                'Use paced breathing if you wake during the rest period.',
              ].map((tip) => (
                <div key={tip} className="flex items-start gap-2 text-[8.5px] leading-relaxed text-slate-500">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-cyan-300/60" />
                  {tip}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] px-4 py-3 font-mono text-[7px] uppercase leading-relaxed tracking-[0.08em] text-slate-600">
        Mental wellness check-ins are self-reported and simulated · they do not diagnose mental health
        conditions · contact the flight surgeon for clinical support
      </div>
    </div>
  )
}
