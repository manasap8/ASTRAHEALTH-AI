import {
  Award,
  Check,
  Droplets,
  Dumbbell,
  Flame,
  MoonStar,
  Plus,
  Sparkles,
  Trophy,
} from 'lucide-react'
import { useMission } from '../context/MissionContext'
import { SectionHeader } from '../components/ui/SectionHeader'
import { StatusPill } from '../components/ui/StatusPill'

function ProgressBar({ value, goal, tone }) {
  const percent = Math.min(100, Math.round((value / goal) * 100))
  const tones = {
    cyan: 'from-cyan-400/80 to-blue-400/70',
    emerald: 'from-emerald-400/80 to-cyan-300/70',
    violet: 'from-indigo-400/80 to-cyan-300/60',
  }
  return (
    <div className="mt-2.5">
      <div className="h-2.5 overflow-hidden rounded-full border border-white/[0.04] bg-[#0a1526]">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${tones[tone]} transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="mt-1 flex items-center justify-between font-mono text-[6.5px] uppercase tracking-[0.06em] text-slate-600">
        <span>{percent}% complete</span>
        <span>{value} / {goal}</span>
      </div>
    </div>
  )
}

export function HealthActivitiesPage({ onNavigate }) {
  const { selectedAstronaut, activities, updateActivity, readings } = useMission()

  const sleepGoal = activities.sleepGoal
  const sleepLogged = activities.sleepLogged || readings.sleep >= sleepGoal
  const exerciseDone = activities.exerciseMinutes >= activities.exerciseGoal
  const hydrationDone = activities.hydrationMl >= activities.hydrationGoal
  const completedCount = [exerciseDone, hydrationDone, sleepLogged].filter(Boolean).length
  const streak = activities.streakDays
  const dynamicAchievements = [
    ...(exerciseDone ? ['Daily exercise goal'] : []),
    ...(hydrationDone ? ['Hydration target reached'] : []),
    ...(sleepLogged ? ['Sleep check logged'] : []),
    ...(completedCount === 3 ? ['Perfect health day'] : []),
  ]
  const achievements = [...new Set([...activities.achievements, ...dynamicAchievements])]

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-4">
      <div className="fade-up flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="eyebrow">Countermeasures</span>
            <span className="rounded border border-amber-300/15 bg-amber-400/[0.05] px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-[0.1em] text-amber-200/70">
              Prototype activity data
            </span>
          </div>
          <h1 className="panel-title mt-1 text-xl font-semibold text-slate-50">Health Activities</h1>
          <p className="mt-1 max-w-[700px] text-[11px] leading-relaxed text-slate-400">
            Daily exercise, hydration and sleep goals for {selectedAstronaut.name}. Progress is saved
            for this browser session and is ready to be replaced by backend activity records.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-lg border border-amber-400/20 bg-amber-400/[0.05] px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-[0.08em] text-amber-200/80">
            <Flame size={11} />
            {streak}-day streak
          </span>
          <StatusPill level={completedCount === 3 ? 'normal' : 'info'} label={`${completedCount} / 3 goals`} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="glass-panel p-4 sm:p-5">
          <SectionHeader
            icon={Dumbbell}
            eyebrow="Daily movement"
            title="Exercise goal"
            description="Resistive and aerobic countermeasure minutes."
            actions={
              <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-400/[0.06] text-cyan-300">
                <Dumbbell size={13} />
              </span>
            }
          />
          <div className="mt-3 flex items-end justify-between gap-2">
            <div>
              <span className="font-display text-[28px] font-semibold leading-none text-slate-100">
                {activities.exerciseMinutes}
              </span>
              <span className="ml-1 font-mono text-[9px] text-slate-500">min</span>
            </div>
            <span className="font-mono text-[8px] uppercase tracking-[0.07em] text-slate-600">
              goal {activities.exerciseGoal} min
            </span>
          </div>
          <ProgressBar value={activities.exerciseMinutes} goal={activities.exerciseGoal} tone="cyan" />
          <button
            type="button"
            onClick={() =>
              updateActivity((current) => ({
                ...current,
                exerciseMinutes: Math.min(current.exerciseGoal, current.exerciseMinutes + 10),
              }))
            }
            disabled={exerciseDone}
            className={`mt-3 flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border text-[9.5px] font-medium transition ${
              exerciseDone
                ? 'cursor-default border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-300'
                : 'border-cyan-300/25 bg-cyan-400/[0.08] text-cyan-100 hover:bg-cyan-400/[0.15]'
            }`}
          >
            {exerciseDone ? <Check size={13} /> : <Plus size={13} />}
            {exerciseDone ? 'Daily exercise goal complete' : 'Log 10 minutes of exercise'}
          </button>
          <p className="mt-2 font-mono text-[6.5px] uppercase tracking-[0.06em] text-slate-600">
            Simulated baseline · log actual crew activity later via backend
          </p>
        </section>

        <section className="glass-panel p-4 sm:p-5">
          <SectionHeader
            icon={Droplets}
            eyebrow="Fluid balance"
            title="Hydration tracking"
            description="Crew-reported intake for the current mission day."
            actions={
              <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-blue-300/20 bg-blue-400/[0.06] text-blue-300">
                <Droplets size={13} />
              </span>
            }
          />
          <div className="mt-3 flex items-end justify-between gap-2">
            <div>
              <span className="font-display text-[28px] font-semibold leading-none text-slate-100">
                {(activities.hydrationMl / 1000).toFixed(2)}
              </span>
              <span className="ml-1 font-mono text-[9px] text-slate-500">L</span>
            </div>
            <span className="font-mono text-[8px] uppercase tracking-[0.07em] text-slate-600">
              goal {(activities.hydrationGoal / 1000).toFixed(1)} L
            </span>
          </div>
          <ProgressBar value={activities.hydrationMl} goal={activities.hydrationGoal} tone="emerald" />
          <button
            type="button"
            onClick={() =>
              updateActivity((current) => ({
                ...current,
                hydrationMl: Math.min(current.hydrationGoal, current.hydrationMl + 250),
              }))
            }
            disabled={hydrationDone}
            className={`mt-3 flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border text-[9.5px] font-medium transition ${
              hydrationDone
                ? 'cursor-default border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-300'
                : 'border-blue-300/25 bg-blue-400/[0.08] text-blue-100 hover:bg-blue-400/[0.15]'
            }`}
          >
            {hydrationDone ? <Check size={13} /> : <Plus size={13} />}
            {hydrationDone ? 'Hydration goal reached' : 'Log 250 ml of water'}
          </button>
          <p className="mt-2 font-mono text-[6.5px] uppercase tracking-[0.06em] text-slate-600">
            {Math.max(0, activities.hydrationGoal - activities.hydrationMl)} ml remaining today
          </p>
        </section>

        <section className="glass-panel p-4 sm:p-5">
          <SectionHeader
            icon={MoonStar}
            eyebrow="Rest & recovery"
            title="Sleep goal"
            description="Protected rest window and measured sleep duration."
            actions={
              <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-indigo-300/20 bg-indigo-400/[0.06] text-indigo-300">
                <MoonStar size={13} />
              </span>
            }
          />
          <div className="mt-3 flex items-end justify-between gap-2">
            <div>
              <span className="font-display text-[28px] font-semibold leading-none text-slate-100">
                {Number(readings.sleep).toFixed(1)}
              </span>
              <span className="ml-1 font-mono text-[9px] text-slate-500">hrs</span>
            </div>
            <span className="font-mono text-[8px] uppercase tracking-[0.07em] text-slate-600">
              goal {sleepGoal} hrs
            </span>
          </div>
          <ProgressBar
            value={Math.min(readings.sleep, sleepGoal)}
            goal={sleepGoal}
            tone="violet"
          />
          <button
            type="button"
            onClick={() => updateActivity({ sleepLogged: true })}
            disabled={sleepLogged}
            className={`mt-3 flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border text-[9.5px] font-medium transition ${
              sleepLogged
                ? 'cursor-default border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-300'
                : 'border-indigo-300/25 bg-indigo-400/[0.08] text-indigo-100 hover:bg-indigo-400/[0.15]'
            }`}
          >
            {sleepLogged ? <Check size={13} /> : <MoonStar size={13} />}
            {sleepLogged ? 'Sleep check logged' : 'Mark sleep goal complete'}
          </button>
          <p className="mt-2 font-mono text-[6.5px] uppercase tracking-[0.06em] text-slate-600">
            Measured sleep is simulated telemetry · check-in is self-reported
          </p>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <section className="glass-panel p-4 sm:p-5 xl:col-span-7">
          <SectionHeader
            icon={Trophy}
            eyebrow="Streaks & recognition"
            title="Achievements"
            description="Milestones are illustrative prototype data, not a clinical reward system."
            actions={<StatusPill level={completedCount === 3 ? 'normal' : 'info'} label={`${completedCount} / 3 today`} />}
          />
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {achievements.map((achievement, index) => (
              <div
                key={achievement}
                className="flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-300/20 bg-gradient-to-br from-amber-400/15 to-cyan-400/[0.04] text-amber-300">
                  {index === 0 ? <Trophy size={14} /> : <Award size={14} />}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-[9.5px] font-medium text-slate-200">{achievement}</div>
                  <div className="font-mono text-[6.5px] uppercase tracking-[0.06em] text-slate-600">
                    {dynamicAchievements.includes(achievement) ? 'Unlocked today' : 'Mission achievement'}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-cyan-300/[0.12] bg-cyan-400/[0.04] px-3 py-2.5">
            <Flame size={15} className="text-amber-300" />
            <div>
              <div className="text-[10px] font-medium text-slate-200">
                {streak}-day activity streak
              </div>
              <div className="font-mono text-[7px] uppercase tracking-[0.06em] text-slate-600">
                {completedCount === 3
                  ? 'All daily goals complete — tomorrow extends the streak.'
                  : `${3 - completedCount} goal${3 - completedCount === 1 ? '' : 's'} remaining to complete today.`}
              </div>
            </div>
          </div>
        </section>

        <section className="glass-panel p-4 sm:p-5 xl:col-span-5">
          <SectionHeader
            icon={Sparkles}
            eyebrow="Mission readiness"
            title="Today’s summary"
            description="A snapshot of activity and recovery for the flight surgeon."
          />
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              ['Exercise', `${activities.exerciseMinutes} / ${activities.exerciseGoal} min`, exerciseDone],
              ['Hydration', `${(activities.hydrationMl / 1000).toFixed(2)} / ${(activities.hydrationGoal / 1000).toFixed(1)} L`, hydrationDone],
              ['Sleep', `${Number(readings.sleep).toFixed(1)} / ${sleepGoal} h`, sleepLogged],
              ['Streak', `${streak} days`, completedCount === 3],
            ].map(([label, value, done]) => (
              <div key={label} className="rounded-lg border border-white/[0.06] bg-black/15 p-2.5">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-[6.5px] uppercase tracking-[0.08em] text-slate-600">
                    {label}
                  </span>
                  <span className={`h-1.5 w-1.5 rounded-full ${done ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                </div>
                <div className="mt-1 font-mono text-[10px] text-slate-200">{value}</div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onNavigate('health-monitoring')}
            className="btn-ghost mt-3 h-9 w-full text-[9.5px]"
          >
            Review health monitoring
          </button>
          <p className="mt-2 font-mono text-[6.5px] uppercase leading-relaxed tracking-[0.06em] text-slate-600">
            Activity goals are prototype values and can be configured by the medical administrator.
          </p>
        </section>
      </div>

      <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] px-4 py-3 font-mono text-[7px] uppercase leading-relaxed tracking-[0.08em] text-slate-600">
        Simulated activity data for demonstration · not clinical exercise prescription · follow
        flight-surgeon and mission fitness guidance
      </div>
    </div>
  )
}
