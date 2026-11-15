import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Radio,
  X,
} from 'lucide-react'
import { Logo } from '../ui/Logo'
import { NAVIGATION } from '../../data/navigation'
import { MISSION } from '../../data/missionData'
import { useMission } from '../../context/MissionContext'
import { AstronautAvatar } from '../astronaut/AstronautAvatar'

export function Sidebar({
  activePage,
  onNavigate,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  onLogout,
}) {
  const { selectedAstronaut } = useMission()

  const handleNavigate = (id) => {
    onNavigate(id)
    onCloseMobile()
  }

  return (
    <>
      <div
        role="presentation"
        onClick={onCloseMobile}
        className={`fixed inset-0 z-40 bg-[#02050b]/75 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-[100dvh] w-[268px] flex-col border-r border-cyan-200/[0.09] bg-[#060c17]/95 backdrop-blur-2xl transition-all duration-300 lg:sticky lg:top-0 lg:z-30 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'lg:w-[80px]' : 'lg:w-[254px]'}`}
      >
        <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-cyan-300/20 to-transparent" />

        <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-white/[0.06] px-4">
          <div className="lg:hidden">
            <Logo size={36} subtitle={false} />
          </div>
          <div className="hidden lg:block">
            {collapsed ? <Logo size={34} showText={false} /> : <Logo size={36} subtitle={false} />}
          </div>
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden rounded-lg border border-white/[0.08] p-1.5 text-slate-500 transition hover:border-cyan-300/25 hover:text-cyan-300 lg:flex"
          >
            {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
          </button>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation"
            className="rounded-lg border border-white/[0.08] p-1.5 text-slate-400 transition hover:text-cyan-300 lg:hidden"
          >
            <X size={16} />
          </button>
        </div>

        <div className={`px-4 pb-3 pt-4 ${collapsed ? 'lg:px-3' : ''}`}>
          <div
            className={`flex items-center gap-2 rounded-lg border border-cyan-300/[0.12] bg-cyan-400/[0.04] px-2.5 py-2 ${
              collapsed ? 'lg:justify-center lg:px-1' : ''
            }`}
          >
            <span className="pulse-dot shrink-0 text-emerald-400" />
            <div className={`min-w-0 ${collapsed ? 'lg:hidden' : ''}`}>
              <div className="font-mono text-[8px] uppercase tracking-[0.16em] text-emerald-300/80">
                Mission link active
              </div>
              <div className="truncate font-mono text-[8px] tracking-[0.08em] text-slate-600">
                SOL {MISSION.day} · DSN LOCK
              </div>
            </div>
          </div>
        </div>

        <nav className="scroll-slim flex-1 overflow-y-auto px-3 pb-3">
          <div
            className={`mb-2 px-3 font-mono text-[8px] uppercase tracking-[0.22em] text-slate-600 ${
              collapsed ? 'lg:hidden' : ''
            }`}
          >
            Mission modules
          </div>
          <ul className="space-y-1">
            {NAVIGATION.map((item) => {
              const Icon = item.icon
              const active = activePage === item.id
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleNavigate(item.id)}
                    title={collapsed ? item.label : undefined}
                    aria-current={active ? 'page' : undefined}
                    className={`group relative flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-[12px] transition-all duration-200 ${
                      active
                        ? 'border-cyan-300/20 bg-gradient-to-r from-cyan-400/[0.14] to-blue-500/[0.04] text-cyan-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
                        : 'border-transparent text-slate-400 hover:border-white/[0.06] hover:bg-white/[0.03] hover:text-slate-200'
                    } ${collapsed ? 'lg:justify-center lg:px-2' : ''}`}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.7)]" />
                    )}
                    <Icon
                      size={16}
                      strokeWidth={active ? 2 : 1.7}
                      className={`shrink-0 transition ${active ? 'text-cyan-300' : 'text-slate-500 group-hover:text-cyan-300/80'}`}
                    />
                    <span className={`truncate ${collapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
                    {active && (
                      <span className={`ml-auto h-1 w-1 rounded-full bg-cyan-300 ${collapsed ? 'lg:hidden' : ''}`} />
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="shrink-0 border-t border-white/[0.06] p-3">
          <div
            className={`mb-2.5 rounded-lg border border-emerald-400/15 bg-emerald-400/[0.045] px-3 py-2 ${
              collapsed ? 'lg:hidden' : ''
            }`}
          >
            <div className="flex items-center gap-2">
              <Radio size={11} className="text-emerald-400" />
              <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-emerald-300">
                Simulation mode
              </span>
            </div>
            <p className="mt-1 text-[9px] leading-relaxed text-slate-500">
              All telemetry is generated for this prototype.
            </p>
          </div>

          <div
            className={`flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.025] p-2 ${
              collapsed ? 'lg:flex-col lg:gap-1.5 lg:border-0 lg:bg-transparent lg:p-0' : ''
            }`}
          >
            <AstronautAvatar astronaut={selectedAstronaut} size="md" showStatus />
            <div className={`min-w-0 flex-1 ${collapsed ? 'lg:hidden' : ''}`}>
              <div className="truncate text-[11px] font-medium text-slate-200">{selectedAstronaut.name}</div>
              <div className="truncate font-mono text-[8px] uppercase tracking-[0.1em] text-slate-500">
                {selectedAstronaut.id}
              </div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              title="Log out"
              aria-label="Log out"
              className="rounded-md border border-transparent p-1.5 text-slate-500 transition hover:border-rose-400/25 hover:bg-rose-500/10 hover:text-rose-300"
            >
              <LogOut size={14} />
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleCollapse}
            className={`mt-2 hidden w-full items-center justify-center gap-1.5 rounded-md py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-slate-600 transition hover:text-cyan-300 lg:flex ${
              collapsed ? 'lg:py-0' : ''
            }`}
          >
            {collapsed ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
            <span className={collapsed ? 'lg:hidden' : ''}>Collapse panel</span>
          </button>
        </div>
      </aside>
    </>
  )
}
