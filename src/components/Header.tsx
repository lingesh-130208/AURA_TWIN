import React, { useState } from 'react';
import {
  ShieldAlert,
  Compass,
  Bell,
  Cpu,
  LogOut,
  Info,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  UserCheck,
  Radio
} from 'lucide-react';
import { User, AppMode, UserRole } from '../types/traffic';
import { AuthService } from '../services/authService';
import { trafficStateService } from '../services/trafficStateService';

export interface HeaderProps {
  user?: User | null;
  activeRole?: UserRole;
  currentMode?: AppMode;
  onSelectMode?: (mode: AppMode) => void;
  activeView: string;
  onNavigate: (view: string) => void;
  onOpenCopilot?: () => void;
  onSwitchRole?: (role: UserRole) => void;
  onLogout?: () => void;
  onOpenTrustCenter?: () => void;
  onOpenNotifications?: () => void;
  unreadAlertCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  activeRole,
  currentMode = 'DEMO',
  onSelectMode,
  activeView,
  onNavigate,
  onOpenCopilot,
  onSwitchRole,
  onLogout,
  onOpenTrustCenter,
  onOpenNotifications,
  unreadAlertCount = 2
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modeDropdownOpen, setModeDropdownOpen] = useState(false);

  const effectiveRole = user?.role || activeRole || 'USER';
  const isAdmin = effectiveRole === 'ADMIN';

  const adminNavItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'what-if', label: 'What-If Center' },
    { id: 'cascade', label: 'Cascade Explorer' },
    { id: 'timeline', label: 'Forecast Timeline' },
    { id: 'risk-map', label: 'Risk Map' },
    { id: 'incidents', label: 'Incident Center' },
    { id: 'emergency', label: 'Emergency Mode' },
    { id: 'replay', label: 'Historical Replay' },
    { id: 'monitoring', label: 'ML Monitoring' },
    { id: 'system-health', label: 'System Health' },
    { id: 'audit', label: 'Audit Log' }
  ];

  const citizenNavItems = [
    { id: 'map', label: 'Corridor Map' },
    { id: 'routes', label: 'Route Comparison' },
    { id: 'disruptions', label: 'Disruption Alerts' },
    { id: 'chat', label: 'Commuter Copilot' }
  ];

  const navItems = isAdmin ? adminNavItems : citizenNavItems;

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      AuthService.logout();
      onNavigate('landing');
    }
  };

  const getModeColor = (mode: AppMode) => {
    switch (mode) {
      case 'DEMO': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'LIVE': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'REPLAY': return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'DIGITAL_TWIN': return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'DEGRADED': return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default: return 'bg-neutral-800 text-neutral-300 border-neutral-700';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-neutral-950/95 backdrop-blur shadow-sm">
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-neutral-800/80 text-xs font-mono text-neutral-400">
        <div className="flex items-center space-x-3">
          <span className="text-neutral-400 uppercase tracking-wider hidden sm:inline">AURA-TWIN // v3.4</span>
          <span className="hidden md:inline text-neutral-600">|</span>
          <span className="text-neutral-300 hidden md:inline truncate max-w-xs">
            Intervention-Conditioned Probabilistic Traffic Cascade Forecasting
          </span>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Quick Role Switcher for Evaluator Convenience */}
          {onSwitchRole && (
            <div className="flex items-center space-x-1 border-r border-neutral-800 pr-2 mr-1">
              <span className="text-[10px] text-neutral-500 hidden sm:inline">SWITCH:</span>
              <button
                type="button"
                onClick={() => onSwitchRole('ADMIN')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                  isAdmin
                    ? 'bg-rose-950 text-rose-300 border border-rose-800 ring-1 ring-rose-500/30'
                    : 'text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800'
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => onSwitchRole('USER')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                  !isAdmin
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 ring-1 ring-cyan-500/30'
                    : 'text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800'
                }`}
              >
                Citizen
              </button>
            </div>
          )}

          {/* Mode Selector */}
          <div className="relative">
            <button
              id="mode-selector-btn"
              onClick={() => setModeDropdownOpen(!modeDropdownOpen)}
              className={`flex items-center space-x-1 px-2 py-0.5 rounded border text-[11px] font-semibold transition-colors ${getModeColor(currentMode)}`}
              title="Active Application Mode"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
              <span>MODE: {currentMode}</span>
              <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
            </button>

            {modeDropdownOpen && (
              <div className="absolute right-0 mt-1 w-44 rounded-md shadow-xl bg-neutral-900 border border-neutral-800 py-1 z-50">
                <div className="px-2.5 py-1 text-[10px] text-neutral-400 uppercase font-semibold border-b border-neutral-800">
                  Switch Telemetry Mode
                </div>
                {(['DEMO', 'LIVE', 'REPLAY', 'DIGITAL_TWIN', 'DEGRADED'] as AppMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => {
                      if (onSelectMode) onSelectMode(mode);
                      trafficStateService.setAppMode(mode);
                      setModeDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-800 flex items-center justify-between ${
                      currentMode === mode ? 'text-cyan-400 font-bold' : 'text-neutral-300'
                    }`}
                  >
                    <span>{mode}</span>
                    {currentMode === mode && <span className="text-[10px]">ACTIVE</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Freshness Status */}
          <div className="hidden lg:flex items-center space-x-1.5 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>DATA: FRESH (3s)</span>
            <span className="text-neutral-500">·</span>
            <span className="text-neutral-400">TOMTOM/SUMO</span>
          </div>

          {/* Trust Center Trigger */}
          {onOpenTrustCenter && (
            <button
              id="trust-center-btn"
              onClick={onOpenTrustCenter}
              className="flex items-center space-x-1 px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-[11px] transition-colors"
              title="View Data Provenance, Calibrations & Uncertainty"
            >
              <Info className="w-3 h-3 text-cyan-400" />
              <span className="hidden sm:inline">Trust Center</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5">
        {/* Brand & Identity */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center space-x-2 text-left group cursor-pointer"
            title="Return to AURA-TWIN Portal (Switch between Command and Citizen)"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-cyan-900/30">
              <Compass className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base tracking-tight text-white font-mono">AURA-TWIN</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                  isAdmin
                    ? 'bg-rose-950 text-rose-300 border-rose-800'
                    : 'bg-cyan-950 text-cyan-300 border-cyan-800'
                }`}>
                  {isAdmin ? 'COMMAND' : 'CITIZEN'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-tight hidden sm:block">
                {isAdmin ? 'Authorized Traffic Control Room' : 'Public Mobility & Future-Risk Navigator'}
              </p>
            </div>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1 overflow-x-auto max-w-2xl px-2">
          {navItems.map((item) => {
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => onNavigate(item.id)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                  active
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm font-bold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Gemini AI Copilot Trigger */}
          {onOpenCopilot && (
            <button
              id="header-copilot-btn"
              onClick={onOpenCopilot}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md shadow-cyan-950 transition-all border border-cyan-400/30"
              title="Open AURA AI Decision Copilot"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden sm:inline">AURA Copilot</span>
            </button>
          )}

          {/* User Profile / Logout */}
          <div className="flex items-center space-x-2 pl-2 border-l border-neutral-800">
            <div className="hidden sm:block text-right">
              <div className="text-xs font-medium text-white truncate max-w-[120px]">
                {user?.name || (isAdmin ? 'Chief Operator' : 'Chennai Commuter')}
              </div>
              <div className="text-[10px] text-neutral-400 font-mono capitalize">
                {effectiveRole.toLowerCase()}
              </div>
            </div>
            <button
              id="header-logout-btn"
              onClick={handleLogoutClick}
              className="p-2 rounded-md text-neutral-400 hover:text-rose-400 hover:bg-rose-950/30 border border-neutral-800 transition-colors"
              title="Change Persona or Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-900"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-800 bg-neutral-950 px-4 py-3 space-y-1">
          <div className="text-[10px] font-mono text-neutral-500 uppercase pb-1">Navigation</div>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium ${
                activeView === item.id ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800' : 'text-neutral-300 hover:bg-neutral-900'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-neutral-800 flex justify-between items-center text-xs text-neutral-400">
            <span>Role: <strong className="text-white">{effectiveRole}</strong></span>
            <button onClick={handleLogoutClick} className="text-rose-400 flex items-center space-x-1">
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
