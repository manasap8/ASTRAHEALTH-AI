import { useEffect, useState } from 'react'
import { MissionProvider } from './context/MissionContext'
import { LoginPage } from './components/login/LoginPage'
import { Sidebar } from './components/layout/Sidebar'
import { TopBar } from './components/layout/TopBar'
import { Dashboard } from './components/dashboard/Dashboard'
import { MedicalHistoryPage } from './pages/MedicalHistoryPage'
import { HealthMonitoringPage } from './pages/HealthMonitoringPage'
import { RadiationPage } from './pages/RadiationPage'
import { DigitalTwinPage } from './pages/DigitalTwinPage'
import { AIAssistantPage } from './pages/AIAssistantPage'
import { MentalWellnessPage } from './pages/MentalWellnessPage'
import { HealthActivitiesPage } from './pages/HealthActivitiesPage'
import { SettingsPage } from './pages/SettingsPage'
import { PlaceholderPage } from './components/PlaceholderPage'
import { Starfield } from './components/ui/Starfield'

const PAGE_COMPONENTS = {
  dashboard: Dashboard,
  'medical-history': MedicalHistoryPage,
  'health-monitoring': HealthMonitoringPage,
  radiation: RadiationPage,
  'digital-twin': DigitalTwinPage,
  'ai-assistant': AIAssistantPage,
  'mental-wellness': MentalWellnessPage,
  'health-activities': HealthActivitiesPage,
  settings: SettingsPage,
}

export default function App() {
  const [session, setSession] = useState(null)
  const [activePage, setActivePage] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [activePage, session])

  const handleLogin = (astronaut) => {
    setSession(astronaut)
    setActivePage('dashboard')
    setMobileNavOpen(false)
  }

  const handleLogout = () => {
    setSession(null)
    setActivePage('dashboard')
    setMobileNavOpen(false)
  }

  const handleNavigate = (id) => {
    setActivePage(id)
    setMobileNavOpen(false)
    if (id === 'medical-history') {
      // The params are handled by the page itself via useMission and URL params
    }
  }

  const ActivePage = PAGE_COMPONENTS[activePage]

  if (!session) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <MissionProvider
      initialAstronautId={session.id}
      onLogout={handleLogout}
    >
      <div className="relative min-h-screen">
        <div className="app-backdrop" />
        <Starfield count={46} />

        <div className="relative z-10 flex min-h-screen">
          <Sidebar
            activePage={activePage}
            onNavigate={handleNavigate}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
            mobileOpen={mobileNavOpen}
            onCloseMobile={() => setMobileNavOpen(false)}
            session={session}
            onLogout={handleLogout}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <TopBar
              session={session}
              onMenuClick={() => setMobileNavOpen(true)}
              onLogout={handleLogout}
              onNavigate={handleNavigate}
            />

            <main className="flex-1 px-4 py-5 sm:px-5 lg:px-7">
              <div key={activePage} className="fade-in">
                {ActivePage
                  ? <ActivePage onNavigate={handleNavigate} />
                  : <PlaceholderPage moduleId={activePage} onNavigate={handleNavigate} />}
              </div>
            </main>
          </div>
        </div>
      </div>
    </MissionProvider>
  )
}