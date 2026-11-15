import { useEffect, useRef, useState } from 'react'
import {
  Activity,
  Bell,
  ChevronDown,
  CircleUserRound,
  FileText,
  Info,
  LogOut,
  Menu,
  Radio,
  Settings,
  ShieldAlert,
  TriangleAlert,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { useMission } from '../../context/MissionContext'
import { MISSION } from '../../data/missionData'
import { AstronautSwitcher } from '../astronaut/AstronautSwitcher'
import { AstronautAvatar } from '../astronaut/AstronautAvatar'

const severityStyles = {
  critical: { icon: ShieldAlert, color: 'text-rose-300', border: 'border-rose-400/25', bg: 'bg-rose-500/10' },
  warning: { icon: TriangleAlert, color: 'text-amber-300', border: 'border-amber-400/25', bg: 'bg-amber-400/10' },
  info: { icon: Info, color: 'text-sky-300', border: 'border-sky-400/20', bg: 'bg-sky-400/[0.07]' },
}

export function TopBar({ onMenuClick, onLogout, onNavigate }) {
  const {
    alerts,
    unreadCount,
    markAlertsRead,
    networkOnline,
    selectedAstronaut,
  } = useMission()
  const [openMenu, setOpenMenu] = useState(null)
  const [clock, setClock] = useState(() => new Date())
  const barRef = useRef(null)

  useEffect(() => {
    const interval = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!openMenu) return undefined
    const handlePointer = (event) => {
      if (barRef.current && !barRef.current.contains(event.target)) setOpenMenu(null)
    }
    const handleKey = (event) => {
      if (event.key === 'Escape') setOpenMenu(null)
    }
    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('keydown', handleKey)
    }
  }, [openMenu])

  const toggleAlerts = () => {
    setOpenMenu((current) => {
      if (current === 'alerts') return null
      markAlertsRead()
      return 'alerts'
    })
  }

  const viewAllAlerts = () => {
    setOpenMenu(null)
    onNavigate('dashboard')
    setTimeout(() => {
      document.getElementById('alerts-panel')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 160)
  }

  const utcTime = clock.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  })

  return (
    <header
      ref={barRef}
      className="sticky top-0 z-30 border-b border-cyan-200/[0.08] bg-[#050b16]/80 backdrop-blur-xl"
    >
      <div className="flex h-[68px] items-center gap-3 px-4 sm:px-5 lg:px-7">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="rounded-lg border border-white/[0.08] p-2 text-slate-400 transition hover:border-cyan-300/25 hover:text-cyan-300 lg:hidden"
        >
          <Menu size={17} />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="hidden text-[8px] font-medium uppercase tracking-[0.18em] text-cyan-300/80 sm:inline">
              Mission control
            </span>
            <span className="hidden h-3 w-px bg-slate-700 sm:inline-block" />
            <h1 className="truncate font-display text-[12px] font-semibold tracking-wide text-slate-100 sm:text-[13px]">
              {MISSION.name}
            </h1>
            <span className="hidden rounded border border-cyan-300/15 bg-cyan-400/[0.06] px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-[0.12em] text-cyan-200/80 xl:inline">
              MARS-1
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.12em] text-slate-500">
            <span>Mission day {MISSION.day}</span>
            <span className="text-slate-700">/</span>
            <span className="hidden sm:inline">{selectedAstronaut.name}</span>
            <span className="hidden text-slate-700 sm:inline">/</span>
            <span className="hidden text-slate-500 md:inline">{utcTime} UTC</span>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <div
            title={networkOnline ? 'Network online' : 'Network offline'}
            className="hidden items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.025] px-2.5 py-1.5 md:flex"
          >
            {networkOnline ? (
              <Wifi size={11} className="text-emerald-400" />
            ) : (
              <WifiOff size={11} className="text-rose-400" />
            )}
            <span
              className={`font-mono text-[8px] uppercase tracking-[0.12em] ${
                networkOnline ? 'text-emerald-300/90' : 'text-rose-300'
              }`}
            >
              {networkOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          <div
            title="All physiological sensors are simulated"
            className="hidden items-center gap-1.5 rounded-full border border-cyan-300/20 bg-cyan-400/[0.06] px-2.5 py-1.5 sm:flex"
          >
            <Activity size={11} className="text-cyan-300" />
            <span className="hidden font-mono text-[8px] uppercase tracking-[0.12em] text-cyan-200/90 lg:inline">
              Sensors
            </span>
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-300" />
            </span>
            <span className="hidden font-mono text-[8px] uppercase tracking-[0.12em] text-cyan-200/90 xl:inline">
              Simulation active
            </span>
          </div>

          <span className="mx-0.5 hidden h-6 w-px bg-white/[0.07] sm:block" />

          <AstronautSwitcher />

          <div className="relative">
            <button
              type="button"
              onClick={toggleAlerts}
              className={`relative rounded-lg border p-2 transition ${
                openMenu === 'alerts'
                  ? 'border-cyan-300/35 bg-cyan-400/10 text-cyan-200'
                  : 'border-white/[0.08] text-slate-400 hover:border-cyan-300/25 hover:text-cyan-200'
              }`}
              aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
              aria-expanded={openMenu === 'alerts'}
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border border-[#050b16] bg-cyan-400 px-1 font-mono text-[8px] font-bold text-[#04121a]">
                  {unreadCount}
                </span>
              )}
            </button>

            {openMenu === 'alerts' && (
              <div className="glass-panel fade-in absolute -right-10 top-[calc(100%+10px)] z-50 w-[min(340px,calc(100vw-2rem))] overflow-hidden p-0 sm:right-0 sm:w-[360px]">
                <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Bell size={13} className="text-cyan-300" />
                    <span className="panel-title text-[12px] font-semibold text-slate-100">
                      Notifications
                    </span>
                  </div>
                  <span className="rounded-full border border-white/[0.08] px-2 py-0.5 font-mono text-[8px] text-slate-400">
                    {selectedAstronaut.id}
                  </span>
                </div>
                <div className="scroll-slim max-h-[320px] overflow-y-auto p-2">
                  {alerts.length === 0 && (
                    <p className="px-3 py-8 text-center text-[10px] text-slate-500">
                      No notifications for this astronaut.
                    </p>
                  )}
                  {alerts.slice(0, 5).map((alert) => {
                    const style = severityStyles[alert.severity] ?? severityStyles.info
                    const Icon = style.icon
                    return (
                      <div
                        key={alert.id}
                        className="flex gap-2.5 rounded-lg px-2 py-2.5 transition hover:bg-white/[0.03]"
                      >
                        <span
                          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${style.border} ${style.bg} ${style.color}`}
                        >
                          <Icon size={12} />
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-[11px] font-medium leading-snug text-slate-200">
                              {alert.title}
                            </p>
                            {alert.unread && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />}
                          </div>
                          <p className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.08em] text-slate-500">
                            {alert.time} · {alert.severity}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <button
                  type="button"
                  onClick={viewAllAlerts}
                  className="flex w-full items-center justify-center gap-1.5 border-t border-white/[0.07] py-2.5 font-mono text-[8px] uppercase tracking-[0.16em] text-cyan-300/85 transition hover:bg-cyan-400/[0.06] hover:text-cyan-200"
                >
                  <Radio size={10} />
                  View all alerts
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu((current) => (current === 'profile' ? null : 'profile'))}
              className={`flex items-center gap-1.5 rounded-lg border p-1.5 pr-2 transition ${
                openMenu === 'profile'
                  ? 'border-cyan-300/35 bg-cyan-400/10 text-cyan-200'
                  : 'border-white/[0.08] text-slate-400 hover:border-cyan-300/25 hover:text-cyan-200'
              }`}
              aria-label="Open profile menu"
              aria-expanded={openMenu === 'profile'}
            >
              <CircleUserRound size={17} />
              <ChevronDown size={11} className="hidden sm:block" />
            </button>

            {openMenu === 'profile' && (
              <div className="glass-panel fade-in absolute right-0 top-[calc(100%+10px)] z-50 w-[272px] overflow-hidden p-0">
                <div className="border-b border-white/[0.07] bg-gradient-to-br from-cyan-400/[0.08] to-transparent px-4 py-4">
                  <div className="flex items-center gap-3">
                    <AstronautAvatar astronaut={selectedAstronaut} size="lg" showStatus />
                    <div className="min-w-0">
                      <div className="truncate text-[12px] font-semibold text-slate-100">
                        {selectedAstronaut.name}
                      </div>
                      <div className="truncate font-mono text-[8px] uppercase tracking-[0.12em] text-cyan-300/70">
                        {selectedAstronaut.role}
                      </div>
                      <div className="mt-0.5 font-mono text-[8px] tracking-[0.08em] text-slate-500">
                        ID {selectedAstronaut.id} · {selectedAstronaut.age} yrs
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(null)
                      onNavigate('medical-history', { tab: 'preflight', openReport: true })
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[11px] text-slate-300 transition hover:bg-white/[0.04] hover:text-cyan-200"
                  >
                    <FileText size={14} className="text-slate-500" />
                    Pre-flight medical report
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(null)
                      onNavigate('settings')
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[11px] text-slate-300 transition hover:bg-white/[0.04] hover:text-cyan-200"
                  >
                    <Settings size={14} className="text-slate-500" />
                    Command settings
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(null)
                      onLogout()
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[11px] text-rose-300/90 transition hover:bg-rose-500/10 hover:text-rose-200"
                  >
                    <LogOut size={14} />
                    Log out of mission control
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
