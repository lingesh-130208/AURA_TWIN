import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { UnauthorizedPage } from './components/UnauthorizedPage';
import { TelemetryInspector } from './components/TelemetryInspector';

// Admin Components
import { AdminOverview } from './components/admin/AdminOverview';
import { AdminWhatIfCenter } from './components/admin/AdminWhatIfCenter';
import { AdminCascadeExplorer } from './components/admin/AdminCascadeExplorer';
import { AdminForecastTimeline } from './components/admin/AdminForecastTimeline';
import { AdminRiskMap } from './components/admin/AdminRiskMap';
import { AdminIncidentCenter } from './components/admin/AdminIncidentCenter';
import { AdminEmergencyMode } from './components/admin/AdminEmergencyMode';
import { AdminHistoricalReplay } from './components/admin/AdminHistoricalReplay';
import { AdminModelMonitoring } from './components/admin/AdminModelMonitoring';
import { AdminSystemHealth } from './components/admin/AdminSystemHealth';
import { AdminAuditLog } from './components/admin/AdminAuditLog';
import { AdminCopilotModal } from './components/admin/AdminCopilotModal';

// Citizen Components
import { CitizenMap } from './components/citizen/CitizenMap';
import { CitizenRoutes } from './components/citizen/CitizenRoutes';
import { CitizenDisruptions } from './components/citizen/CitizenDisruptions';
import { CitizenChatbot } from './components/citizen/CitizenChatbot';
import { CitizenLiveVoiceModal } from './components/citizen/CitizenLiveVoiceModal';
import { CitizenToastContainer } from './components/citizen/CitizenToastContainer';

// Services & Types
import { AuthService } from './services/authService';
import { trafficStateService } from './services/trafficStateService';
import { citizenNotificationService } from './services/citizenNotificationService';
import { UserRole, Junction, RoadSegment, RouteAlternative } from './types/traffic';

export default function App() {
  const [currentUser, setCurrentUser] = useState(AuthService.getCurrentUser());
  const [isLanding, setIsLanding] = useState(!AuthService.isAuthenticated());
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginRoleTarget, setLoginRoleTarget] = useState<UserRole>('ADMIN');
  const [activeView, setActiveView] = useState<string>(currentUser?.role === 'ADMIN' ? 'overview' : 'map');

  // Unauthorized attempt tracker
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  // Selected entities for inspection
  const [selectedJunction, setSelectedJunction] = useState<Junction | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<RoadSegment | null>(null);

  // Selected Citizen Route
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-b');

  // Modals
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  // Network State
  const [junctions, setJunctions] = useState(trafficStateService.getJunctions());
  const [segments, setSegments] = useState(trafficStateService.getSegments());
  const [incidents, setIncidents] = useState(trafficStateService.getIncidents());
  const [routes, setRoutes] = useState(trafficStateService.getRoutes());

  // Google Maps Platform Quota Banner State
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuota = () => setIsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  // Listen to state changes
  useEffect(() => {
    const unsub = trafficStateService.subscribe(() => {
      setJunctions(trafficStateService.getJunctions());
      setSegments(trafficStateService.getSegments());
      setIncidents(trafficStateService.getIncidents());
      setRoutes(trafficStateService.getRoutes());
    });
    return unsub;
  }, []);

  const handleRoleSelectFromLanding = (role: UserRole) => {
    setLoginRoleTarget(role);
    setIsLanding(false);
    setIsLoginOpen(true);
  };

  const handleLoginSuccess = (role: UserRole) => {
    const user = AuthService.getCurrentUser();
    setCurrentUser(user);
    setIsLoginOpen(false);
    setIsLanding(false);
    setIsUnauthorized(false);
    setActiveView(role === 'ADMIN' ? 'overview' : 'map');
  };

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
    setIsLanding(true);
    setIsUnauthorized(false);
  };

  const handleQuickSwitchRole = (newRole: UserRole) => {
    if (newRole === 'ADMIN') {
      AuthService.login('admin', '12345678', 'ADMIN');
      setCurrentUser(AuthService.getCurrentUser());
      setActiveView('overview');
      setIsUnauthorized(false);
    } else {
      AuthService.login('citizen', 'user123', 'USER');
      setCurrentUser(AuthService.getCurrentUser());
      setActiveView('map');
      setIsUnauthorized(false);
    }
  };

  const handleSelectRoute = (routeId: string) => {
    setSelectedRouteId(routeId);
    citizenNotificationService.evaluateActiveRoute(routeId, (rId) => handleSelectRoute(rId));
  };

  useEffect(() => {
    if (currentUser?.role !== 'ADMIN' && !isLanding) {
      citizenNotificationService.evaluateActiveRoute(selectedRouteId, (rId) => handleSelectRoute(rId));
    }
  }, [selectedRouteId, currentUser?.role, isLanding]);

  const handleNavigate = (view: string) => {
    // Authorization check
    const adminViews = ['overview', 'what-if', 'cascade', 'timeline', 'risk-map', 'incidents', 'emergency', 'replay', 'monitoring', 'system-health', 'audit'];
    if (adminViews.includes(view) && currentUser?.role !== 'ADMIN') {
      setIsUnauthorized(true);
      return;
    }

    setIsUnauthorized(false);
    setActiveView(view);
  };

  const handleSelectJunction = (j: Junction) => {
    setSelectedJunction(j);
    setSelectedSegment(null);
  };

  const handleSelectSegment = (s: RoadSegment) => {
    setSelectedSegment(s);
    setSelectedJunction(null);
  };

  // Render Landing Page
  if (isLanding) {
    return (
      <LandingPage
        onSelectRole={handleRoleSelectFromLanding}
        onQuickLogin={(role) => {
          handleQuickSwitchRole(role);
          setIsLanding(false);
        }}
      />
    );
  }

  // Render Login Page
  if (isLoginOpen) {
    return (
      <LoginPage
        initialRole={loginRoleTarget}
        onLoginSuccess={handleLoginSuccess}
        onCancel={() => {
          setIsLoginOpen(false);
          setIsLanding(true);
        }}
      />
    );
  }

  // Render Unauthorized Access Page (Section 5)
  if (isUnauthorized) {
    return (
      <UnauthorizedPage
        onReturnToCitizen={() => {
          setIsUnauthorized(false);
          setActiveView('map');
        }}
        onAdminLogin={() => {
          setIsUnauthorized(false);
          setLoginRoleTarget('ADMIN');
          setIsLoginOpen(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-cyan-500/30">
      {/* Google Maps Quota Warning Banner (Section 8) */}
      {isQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Top Application Header */}
      <Header
        activeRole={currentUser?.role || 'USER'}
        activeView={activeView}
        onNavigate={handleNavigate}
        onSwitchRole={handleQuickSwitchRole}
        onLogout={handleLogout}
        onOpenCopilot={() => setIsCopilotOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 relative">
        {/* Floating Telemetry Inspector when node/link is clicked */}
        {(selectedJunction || selectedSegment) && (
          <TelemetryInspector
            junction={selectedJunction}
            segment={selectedSegment}
            onClose={() => {
              setSelectedJunction(null);
              setSelectedSegment(null);
            }}
            onOpenWhatIf={() => {
              setSelectedJunction(null);
              setSelectedSegment(null);
              handleNavigate('what-if');
            }}
            isAdmin={currentUser?.role === 'ADMIN'}
          />
        )}

        {/* View Routing */}
        {currentUser?.role === 'ADMIN' ? (
          <>
            {activeView === 'overview' && (
              <AdminOverview
                junctions={junctions}
                segments={segments}
                incidents={incidents}
                onNavigate={handleNavigate}
                onSelectJunction={handleSelectJunction}
                onSelectSegment={handleSelectSegment}
                selectedJunctionCode={selectedJunction?.code}
                selectedSegmentId={selectedSegment?.id}
              />
            )}
            {activeView === 'what-if' && (
              <AdminWhatIfCenter
                onNavigate={handleNavigate}
                onOpenCopilot={() => setIsCopilotOpen(true)}
              />
            )}
            {activeView === 'cascade' && (
              <AdminCascadeExplorer />
            )}
            {activeView === 'timeline' && (
              <AdminForecastTimeline />
            )}
            {activeView === 'risk-map' && (
              <AdminRiskMap
                junctions={junctions}
                segments={segments}
                onSelectJunction={handleSelectJunction}
                onSelectSegment={handleSelectSegment}
                selectedJunctionCode={selectedJunction?.code}
                selectedSegmentId={selectedSegment?.id}
              />
            )}
            {activeView === 'incidents' && (
              <AdminIncidentCenter
                incidents={incidents}
                onOpenWhatIf={() => handleNavigate('what-if')}
              />
            )}
            {activeView === 'emergency' && (
              <AdminEmergencyMode />
            )}
            {activeView === 'replay' && (
              <AdminHistoricalReplay />
            )}
            {activeView === 'monitoring' && (
              <AdminModelMonitoring />
            )}
            {activeView === 'system-health' && (
              <AdminSystemHealth />
            )}
            {activeView === 'audit' && (
              <AdminAuditLog />
            )}
          </>
        ) : (
          <>
            <CitizenToastContainer />
            {activeView === 'map' && (
              <CitizenMap
                routes={routes}
                selectedRouteId={selectedRouteId}
                onSelectRoute={handleSelectRoute}
                junctions={junctions}
                segments={segments}
                onOpenVoiceModal={() => setIsVoiceOpen(true)}
                onOpenChatbot={() => handleNavigate('chat')}
              />
            )}
            {activeView === 'routes' && (
              <CitizenRoutes
                routes={routes}
                selectedRouteId={selectedRouteId}
                onSelectRoute={handleSelectRoute}
              />
            )}
            {activeView === 'disruptions' && (
              <CitizenDisruptions
                onSelectRouteB={() => {
                  handleSelectRoute('route-b');
                  handleNavigate('map');
                }}
              />
            )}
            {activeView === 'chat' && (
              <CitizenChatbot />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-4 px-6 text-center text-xs text-neutral-500 font-mono flex flex-col sm:flex-row justify-between items-center max-w-7xl mx-auto w-full gap-2">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>AURA-TWIN Digital Twin v3.4 · Live Corridor Calibration</span>
        </div>
        <div>
          Role: <strong className={currentUser?.role === 'ADMIN' ? 'text-rose-400' : 'text-cyan-400'}>{currentUser?.role || 'GUEST'}</strong>
          {' · '}
          <button onClick={() => setIsLanding(true)} className="hover:text-neutral-300 underline">
            Change Persona
          </button>
        </div>
      </footer>

      {/* Modals */}
      {isCopilotOpen && (
        <AdminCopilotModal
          onClose={() => setIsCopilotOpen(false)}
          onNavigateToWhatIf={() => {
            setIsCopilotOpen(false);
            handleNavigate('what-if');
          }}
        />
      )}

      {isVoiceOpen && (
        <CitizenLiveVoiceModal
          onClose={() => setIsVoiceOpen(false)}
        />
      )}
    </div>
  );
}
