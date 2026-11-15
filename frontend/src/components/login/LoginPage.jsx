import { useState } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
  LockKeyhole,
  Orbit,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { Logo } from '../ui/Logo'
import { Starfield } from '../ui/Starfield'
import { Modal } from '../ui/Modal'
import { MissionPanel } from './MissionPanel'
import {
  ASTRONAUTS,
  DEMO_ASTRONAUT_ID,
  findAstronautByLoginId,
} from '../../data/astronauts'

const REMEMBER_KEY = 'astroguardian.remembered-id'

export function LoginPage({ onLogin }) {
  const [astronautId, setAstronautId] = useState(() => {
    try {
      return localStorage.getItem(REMEMBER_KEY) ?? ''
    } catch {
      return ''
    }
  })
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(() => {
    try {
      return Boolean(localStorage.getItem(REMEMBER_KEY))
    } catch {
      return false
    }
  })
  const [error, setError] = useState('')
  const [recoveryOpen, setRecoveryOpen] = useState(false)

  const savePreference = (id) => {
    try {
      if (remember) localStorage.setItem(REMEMBER_KEY, id)
      else localStorage.removeItem(REMEMBER_KEY)
    } catch {
      /* storage can be unavailable in private browsing */
    }
  }

  const signIn = (session) => {
    savePreference(session.id)
    onLogin(session)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!astronautId.trim() || !password.trim()) {
      setError('Enter both your astronaut ID and access code to continue.')
      return
    }
    const crew = findAstronautByLoginId(astronautId)
    if (!crew) {
      setError('Astronaut ID not recognised. Use ASTRO_001, ASTRO_002 or ASTRO_003 below.')
      return
    }
    setError('')
    signIn(crew)
  }

  const handleDemoLogin = () => {
    setRecoveryOpen(false)
    setError('')
    signIn(ASTRONAUTS.find((astronaut) => astronaut.id === DEMO_ASTRONAUT_ID) ?? ASTRONAUTS[0])
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="app-backdrop" />
      <Starfield count={120} />

      <div className="pointer-events-none absolute -left-40 top-1/3 h-[520px] w-[520px] rounded-full border border-cyan-300/[0.07]" />
      <div className="pointer-events-none absolute -left-24 top-[38%] h-[360px] w-[360px] rounded-full border border-cyan-300/[0.09]" />
      <div className="pointer-events-none absolute right-[-10%] top-[-18%] h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle,rgba(14,116,144,0.16),transparent_62%)] blur-2xl" />
      <div className="pointer-events-none absolute bottom-[-30%] left-[20%] h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.14),transparent_65%)] blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-5 py-6 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between gap-4">
          <Logo size={44} />
          <div className="hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-1.5 sm:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-emerald-300/90">
              Flight network online
            </span>
          </div>
          <div className="flex items-center gap-2 sm:hidden">
            <span className="pulse-dot text-emerald-400" />
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-300">
              Online
            </span>
          </div>
        </header>

        <main className="flex flex-1 items-center py-8 sm:py-10 lg:py-8">
          <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,1.04fr)_minmax(0,0.96fr)] lg:gap-14 xl:gap-20">
            <section className="fade-up mx-auto w-full max-w-[500px] lg:mx-0">
              <div className="mb-6 flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full border border-cyan-300/20 bg-cyan-400/[0.07] px-2.5 py-1">
                  <Orbit size={11} className="text-cyan-300" />
                  <span className="eyebrow text-[9px]! tracking-[0.18em]!">Deep-space medical system</span>
                </span>
                <span className="font-mono text-[9px] tracking-[0.16em] text-slate-600">v1.0</span>
              </div>

              <h1 className="font-display text-[2.4rem] font-semibold leading-[1.06] tracking-[-0.02em] text-slate-50 sm:text-[3rem]">
                Intelligent Healthcare.
                <br />
                <span className="bg-gradient-to-r from-cyan-300 via-cyan-200 to-blue-400 bg-clip-text text-transparent text-glow-cyan">
                  Beyond Earth.
                </span>
              </h1>
              <p className="mt-4 max-w-[430px] text-[13.5px] leading-relaxed text-slate-400">
                Autonomous astronaut health monitoring and medical assistance for space missions.
              </p>

              <form onSubmit={handleSubmit} className="glass-panel mt-7 p-5 sm:p-6" noValidate>
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Fingerprint size={16} className="text-cyan-300" />
                    <span className="eyebrow text-[9px]!">Astronaut authentication</span>
                  </div>
                  <span className="flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.16em] text-slate-500">
                    <LockKeyhole size={10} />
                    Encrypted
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="astronaut-id" className="mb-1.5 block text-[11px] font-medium text-slate-300">
                      Astronaut ID
                    </label>
                    <div className="field-wrap">
                      <span className="pl-3.5 text-slate-500">
                        <UserRound size={15} />
                      </span>
                      <input
                        id="astronaut-id"
                        name="astronautId"
                        type="text"
                        autoComplete="username"
                        autoCapitalize="characters"
                        spellCheck={false}
                        value={astronautId}
                        onChange={(event) => {
                          setAstronautId(event.target.value)
                          if (error) setError('')
                        }}
                        placeholder="ASTRO_001"
                        className="field-input font-mono tracking-[0.08em]"
                        aria-invalid={Boolean(error)}
                      />
                      <span className="pr-3 font-mono text-[9px] uppercase tracking-[0.14em] text-slate-600">
                        Crew
                      </span>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="access-code" className="mb-1.5 block text-[11px] font-medium text-slate-300">
                      Password
                    </label>
                    <div className="field-wrap">
                      <span className="pl-3.5 text-slate-500">
                        <KeyRound size={15} />
                      </span>
                      <input
                        id="access-code"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) => {
                          setPassword(event.target.value)
                          if (error) setError('')
                        }}
                        placeholder="Enter access code"
                        className="field-input"
                        aria-invalid={Boolean(error)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((visible) => !visible)}
                        className="flex h-10 items-center px-3 text-slate-500 transition hover:text-cyan-300"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                {error && (
                  <p
                    role="alert"
                    className="mt-3 rounded-lg border border-rose-400/25 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-200"
                  >
                    {error}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between gap-3">
                  <label className="flex cursor-pointer select-none items-center gap-2 text-[11px] text-slate-400">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(event) => setRemember(event.target.checked)}
                      className="h-3.5 w-3.5 cursor-pointer rounded border-slate-600 bg-slate-900 accent-cyan-400"
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={() => setRecoveryOpen(true)}
                    className="text-[11px] font-medium text-cyan-300/85 transition hover:text-cyan-200 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <button type="submit" className="btn-primary mt-5 h-11 w-full text-[13px]">
                  Login to mission control
                  <ArrowRight size={16} />
                </button>

                <div className="my-4 flex items-center gap-3">
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent to-cyan-200/15" />
                  <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-slate-600">
                    or explore the demo
                  </span>
                  <span className="h-px flex-1 bg-gradient-to-l from-transparent to-cyan-200/15" />
                </div>

                <button type="button" onClick={handleDemoLogin} className="btn-ghost h-11 w-full text-[12px]">
                  <Sparkles size={15} className="text-cyan-300" />
                  Demo Login
                  <span className="rounded border border-cyan-300/20 bg-cyan-400/10 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.12em] text-cyan-300">
                    Judges
                  </span>
                </button>

                <div className="mt-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="h-px flex-1 bg-white/[0.06]" />
                    <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-slate-600">
                      Sample crew profiles
                    </span>
                    <span className="h-px flex-1 bg-white/[0.06]" />
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {ASTRONAUTS.map((astronaut) => (
                      <button
                        key={astronaut.id}
                        type="button"
                        onClick={() => signIn(astronaut)}
                        className="group flex flex-col items-center gap-1 rounded-lg border border-white/[0.07] bg-white/[0.02] px-1 py-2 transition hover:border-cyan-300/30 hover:bg-cyan-400/[0.06]"
                        title={`Sign in as ${astronaut.name} (${astronaut.id})`}
                      >
                        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-400/[0.07] font-display text-[8px] font-semibold text-cyan-100">
                          {astronaut.initials}
                        </span>
                        <span className="w-full truncate text-center text-[8.5px] text-slate-300">
                          {astronaut.name.split(' ')[0]}
                        </span>
                        <span className="font-mono text-[6.5px] tracking-[0.05em] text-slate-600 group-hover:text-cyan-300/60">
                          {astronaut.id}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <p className="mt-3 text-center font-mono text-[9px] leading-relaxed tracking-[0.03em] text-slate-600">
                  Prototype authentication · any password is accepted for sample profiles
                </p>

                <div className="mt-4 flex items-center justify-center gap-1.5 border-t border-white/[0.06] pt-3.5 text-[9px] text-slate-500">
                  <ShieldCheck size={11} className="text-emerald-400/80" />
                  Simulation environment — no live astronaut data
                </div>
              </form>
            </section>

            <div className="fade-up w-full lg:justify-self-end" style={{ animationDelay: '120ms' }}>
              <MissionPanel />
            </div>
          </div>
        </main>

        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.05] pt-4 text-[9px] text-slate-600">
          <div className="flex items-center gap-2 font-mono uppercase tracking-[0.16em]">
            <CheckCircle2 size={11} className="text-emerald-400/70" />
            AstroGuardian · prototype build
          </div>
          <div className="flex items-center gap-3 font-mono uppercase tracking-[0.14em]">
            <span>Sol 218</span>
            <span className="text-slate-700">/</span>
            <span>Simulated mission data</span>
          </div>
        </footer>
      </div>

      <Modal
        open={recoveryOpen}
        onClose={() => setRecoveryOpen(false)}
        title="Credential recovery"
        eyebrow="Mission control support"
        icon={LockKeyhole}
        footer={
          <>
            <button type="button" onClick={() => setRecoveryOpen(false)} className="btn-ghost h-9 px-3.5 text-[11px]">
              Cancel
            </button>
            <button type="button" onClick={handleDemoLogin} className="btn-primary h-9 px-3.5 text-[11px]">
              <Sparkles size={13} />
              Use Demo Login
            </button>
          </>
        }
      >
        <p>
          Astronaut credentials are managed by mission control’s identity office. In this prototype,
          authentication is simulated — no real account is required.
        </p>
        <div className="mt-3 rounded-lg border border-cyan-300/15 bg-cyan-400/[0.05] p-3 text-[12px] text-slate-300">
          <span className="font-medium text-cyan-200">Fast path:</span> choose Demo Login to enter the
          dashboard as Alex Morgan, or pick Sarah Williams or David Chen from the sample crew profiles.
        </div>
      </Modal>
    </div>
  )
}
