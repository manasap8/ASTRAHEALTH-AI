import {
  Activity,
  Bell,
  ChevronRight,
  FileText,
  Gauge,
  LogOut,
  Mic,
  RotateCcw,
  Settings,
  ShieldCheck,
  UserRound,
  Volume2,
} from 'lucide-react'
import { useMission } from '../context/MissionContext'
import { AstronautAvatar } from '../components/astronaut/AstronautAvatar'
import { AstronautSelector } from '../components/astronaut/AstronautSelector'
import { SectionHeader } from '../components/ui/SectionHeader'
import { ToggleSwitch } from '../components/ui/ToggleSwitch'
import { StatusPill } from '../components/ui/StatusPill'

const SPEEDS = [
  { value: 3000, label: 'Fast · 3 s' },
  { value: 6000, label: 'Normal · 6 s' },
  { value: 12000, label: 'Slow · 12 s' },
]

function PreferenceRow({ title, description, checked, onChange, icon: Icon }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-white/[0.05] py-2.5 last:border-0">
      <div className="flex min-w-0 items-start gap-2">
        {Icon && <Icon size={12} className="mt-0.5 shrink-0 text-slate-500" />}
        <div className="min-w-0">
          <div className="text-[9.5px] font-medium text-slate-300">{title}</div>
          <p className="mt-0.5 text-[8px] leading-relaxed text-slate-600">{description}</p>
        </div>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} label={title} />
    </div>
  )
}

export function SettingsPage({ onLogout, onNavigate }) {
  const {
    selectedAstronaut,
    preferences,
    updatePreferences,
    resetSimulation,
    resetAllSimulations,
    notify,
  } = useMission()

  const setNotification = (key, value) =>
    updatePreferences('notifications', { [key]: value })

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-4">
      <div className="fade-up flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="eyebrow">Command configuration</span>
            <StatusPill level="info" label="Prototype settings" />
          </div>
          <h1 className="panel-title mt-1 text-xl font-semibold text-slate-50">Settings</h1>
          <p className="mt-1 max-w-[700px] text-[11px] leading-relaxed text-slate-400">
            Astronaut, notification, voice and simulation preferences. Changes apply immediately for
            this browser session.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 font-mono text-[7.5px] uppercase tracking-[0.08em] text-slate-500">
          <Settings size={11} className="text-cyan-300/70" />
          No backend connected
        </div>
      </div>

      <AstronautSelector
        title="Astronaut profile"
        hint="Selection is shared with the dashboard and every clinical module."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="glass-panel p-4 sm:p-5">
          <SectionHeader
            icon={UserRound}
            eyebrow="Crew identity"
            title="Profile details"
            description="Currently selected sample astronaut."
          />
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-cyan-300/[0.12] bg-gradient-to-r from-cyan-400/[0.06] to-transparent p-3">
            <AstronautAvatar astronaut={selectedAstronaut} size="xl" showStatus />
            <div className="min-w-0">
              <div className="font-display text-[16px] font-semibold text-slate-100">
                {selectedAstronaut.name}
              </div>
              <div className="font-mono text-[8px] uppercase tracking-[0.1em] text-cyan-300/65">
                {selectedAstronaut.id} · {selectedAstronaut.role}
              </div>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-[7px] uppercase tracking-[0.05em] text-slate-500">
                <span>{selectedAstronaut.age} years</span>
                <span>Blood {selectedAstronaut.bloodType}</span>
                <span>{selectedAstronaut.status}</span>
              </div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-white/[0.06] bg-black/15 p-2.5">
              <div className="font-mono text-[6.5px] uppercase tracking-[0.1em] text-slate-600">
                Mission
              </div>
              <div className="mt-1 text-[9px] text-slate-300">{selectedAstronaut.mission}</div>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-black/15 p-2.5">
              <div className="font-mono text-[6.5px] uppercase tracking-[0.1em] text-slate-600">
                Pre-flight report
              </div>
              <div className="mt-1 font-mono text-[8.5px] text-emerald-300/80">
                {selectedAstronaut.preFlight.reportId}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('medical-history', { tab: 'preflight', openReport: true })}
            className="btn-ghost mt-3 h-9 w-full text-[9.5px]"
          >
            <FileText size={12} className="text-cyan-300/80" />
            Open pre-flight medical report
            <ChevronRight size={12} />
          </button>
        </section>

        <section className="glass-panel p-4 sm:p-5">
          <SectionHeader
            icon={Bell}
            eyebrow="Alert routing"
            title="Notification preferences"
            description="Choose which simulated feed categories are highlighted."
          />
          <div className="mt-2">
            <PreferenceRow
              title="Critical health alerts"
              description="SpO₂, tachycardia and emergency escalation events."
              icon={ShieldCheck}
              checked={preferences.notifications.critical}
              onChange={(value) => setNotification('critical', value)}
            />
            <PreferenceRow
              title="Warning alerts"
              description="Threshold deviations, sleep debt and radiation bands."
              icon={Activity}
              checked={preferences.notifications.warning}
              onChange={(value) => setNotification('warning', value)}
            />
            <PreferenceRow
              title="Normal notifications"
              description="Routine health checks and mission system updates."
              icon={Bell}
              checked={preferences.notifications.info}
              onChange={(value) => setNotification('info', value)}
            />
          </div>
          <p className="mt-2 border-t border-white/[0.05] pt-2 font-mono text-[6.5px] uppercase leading-relaxed tracking-[0.06em] text-slate-600">
            Preferences are saved in local state for this prototype. Alert severity is never hidden
            from the clinical record.
          </p>
        </section>

        <section className="glass-panel p-4 sm:p-5">
          <SectionHeader
            icon={Volume2}
            eyebrow="Speech interface"
            title="Voice assistant settings"
            description="Browser speech depends on device support and microphone permission."
          />
          <div className="mt-2">
            <PreferenceRow
              title="Voice output"
              description="Enable spoken assistant responses and emergency instructions."
              icon={Volume2}
              checked={preferences.voice.enabled}
              onChange={(value) => updatePreferences('voice', { enabled: value })}
            />
            <PreferenceRow
              title="Auto-speak answers"
              description="Speak new decision-support answers automatically."
              icon={Mic}
              checked={preferences.voice.autoSpeak}
              onChange={(value) => updatePreferences('voice', { autoSpeak: value })}
            />
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between font-mono text-[7px] uppercase tracking-[0.08em] text-slate-500">
              <span>Speech rate</span>
              <span className="text-cyan-200/70">{preferences.voice.rate.toFixed(2)}×</span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.5"
              step="0.05"
              value={preferences.voice.rate}
              onChange={(event) =>
                updatePreferences('voice', { rate: Number(event.target.value) })
              }
              className="mt-1.5 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/[0.08] accent-cyan-400"
              aria-label="Speech rate"
            />
            <div className="mt-1 flex justify-between font-mono text-[6.5px] text-slate-600">
              <span>Slower</span>
              <span>Faster</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('ai-assistant')}
            className="btn-ghost mt-3 h-9 w-full text-[9.5px]"
          >
            <Mic size={12} className="text-cyan-300/80" />
            Open voice assistant
            <ChevronRight size={12} />
          </button>
          <p className="mt-2 font-mono text-[6.5px] uppercase leading-relaxed tracking-[0.06em] text-slate-600">
            Voice input uses the browser Web Speech API when available. Not all browsers or devices
            permit continuous microphone access.
          </p>
        </section>

        <section className="glass-panel p-4 sm:p-5">
          <SectionHeader
            icon={Gauge}
            eyebrow="Prototype telemetry"
            title="Simulation settings"
            description="Control generated readings and reset astronaut baselines."
          />
          <div className="mt-2">
            <PreferenceRow
              title="Live simulated updates"
              description="Refresh all astronaut vitals on a timer."
              icon={Activity}
              checked={preferences.simulation.liveUpdates}
              onChange={(value) => updatePreferences('simulation', { liveUpdates: value })}
            />
          </div>
          <div className="mt-2">
            <div className="mb-1.5 font-mono text-[7px] uppercase tracking-[0.08em] text-slate-500">
              Update interval
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {SPEEDS.map((speed) => {
                const active = preferences.simulation.speed === speed.value
                return (
                  <button
                    key={speed.value}
                    type="button"
                    onClick={() => updatePreferences('simulation', { speed: speed.value })}
                    className={`rounded-lg border px-1.5 py-2 text-center font-mono text-[7px] transition ${
                      active
                        ? 'border-cyan-300/30 bg-cyan-400/[0.08] text-cyan-200'
                        : 'border-white/[0.06] bg-white/[0.02] text-slate-500 hover:border-cyan-300/20'
                    }`}
                  >
                    {speed.label}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={resetSimulation}
              className="btn-ghost h-9 px-2 text-[8.5px]"
            >
              <RotateCcw size={11} className="text-cyan-300/80" />
              Reset {selectedAstronaut.name.split(' ')[0]}’s baseline
            </button>
            <button
              type="button"
              onClick={resetAllSimulations}
              className="btn-ghost h-9 px-2 text-[8.5px]"
            >
              <RotateCcw size={11} className="text-cyan-300/80" />
              Reset all astronauts
            </button>
          </div>
          <p className="mt-2 font-mono text-[6.5px] uppercase leading-relaxed tracking-[0.06em] text-slate-600">
            All readings are generated in the frontend. No physical sensors or database connections
            are active.
          </p>
        </section>
      </div>

      <section className="glass-panel flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <div className="font-mono text-[7px] uppercase tracking-[0.1em] text-slate-600">
            Session control
          </div>
          <p className="mt-1 text-[10px] text-slate-400">
            Signing out returns to the AstroGuardian login screen. Sample data remains available for
            the next demo session.
          </p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="flex h-9 items-center gap-1.5 rounded-lg border border-rose-400/30 bg-rose-500/[0.08] px-4 text-[10px] font-medium text-rose-200 transition hover:border-rose-300/50 hover:bg-rose-500/[0.15]"
        >
          <LogOut size={13} />
          Log out
        </button>
      </section>

      <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] px-4 py-3 font-mono text-[7px] uppercase leading-relaxed tracking-[0.08em] text-slate-600">
        Settings are stored locally for this prototype · database-backed preferences can be added by
        the medical administrator later · no clinical configuration is authoritative here
      </div>
    </div>
  )
}
