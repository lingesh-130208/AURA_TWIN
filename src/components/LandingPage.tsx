import React from 'react';
import {
  ShieldAlert,
  Compass,
  ArrowRight,
  Activity,
  GitBranch,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Database,
  Cpu,
  Radio,
  MapPin,
  Lock,
  UserCheck
} from 'lucide-react';

interface LandingPageProps {
  onSelectRoleLogin?: (role: 'ADMIN' | 'USER') => void;
  onSelectRole?: (role: 'ADMIN' | 'USER') => void;
  onExploreDemo?: () => void;
  onQuickLogin?: (role: 'ADMIN' | 'USER') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSelectRoleLogin,
  onSelectRole,
  onExploreDemo,
  onQuickLogin
}) => {
  const handleSelectRole = (role: 'ADMIN' | 'USER') => {
    if (onQuickLogin) {
      onQuickLogin(role);
    } else if (onSelectRole) {
      onSelectRole(role);
    } else if (onSelectRoleLogin) {
      onSelectRoleLogin(role);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between font-sans selection:bg-cyan-500 selection:text-neutral-950 relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-900/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-rose-900/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Application Bar */}
      <header className="px-6 py-4 border-b border-neutral-900 bg-neutral-950/80 backdrop-blur flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-mono text-base font-bold shadow-md shadow-cyan-950">
            Ω
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-tight text-white font-mono">AURA-TWIN</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300 font-bold">
                PLATFORM GATEWAY
              </span>
            </div>
            <p className="text-[11px] font-mono text-neutral-400 hidden sm:block">
              Real-Time AI Decision Intelligence for Preventing Traffic Gridlock
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>STATEWIDE TAMIL NADU CORRIDORS ACTIVE</span>
          </div>

          <button
            type="button"
            onClick={() => handleSelectRole('ADMIN')}
            className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-rose-300 text-xs font-bold transition-colors"
          >
            Operator Login
          </button>
        </div>
      </header>

      {/* Main Portal Screen */}
      <main className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full py-8 z-10">
        {/* Core Header */}
        <div className="text-center space-y-3 mb-8 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/80 text-cyan-300 text-xs font-mono font-semibold">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>INTERVENTION-CONDITIONED TRAFFIC CASCADE FORECASTING</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight font-mono">
            SELECT APPLICATION ENVIRONMENT
          </h1>

          <p className="text-sm sm:text-base text-neutral-300 font-normal leading-relaxed">
            Choose your interface to enter live corridor intelligence. AURA-TWIN reconstructs partially observed traffic states, predicts upstream spillbacks, and evaluates counterfactual interventions.
          </p>
        </div>

        {/* Two Application Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* AURA COMMAND (Traffic Authority / Operator System) */}
          <div
            id="portal-card-command"
            className="rounded-2xl border border-rose-900/60 bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950 p-6 sm:p-7 shadow-2xl flex flex-col justify-between relative group hover:border-rose-700/80 transition-all duration-300"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 shadow-inner">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                    OPERATOR RESTRICTED
                  </span>
                  <div className="text-[10px] font-mono text-neutral-400 mt-1">Demo: admin / 12345678</div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-black text-white font-mono tracking-tight flex items-center space-x-2">
                  <span>AURA COMMAND</span>
                </h2>
                <p className="text-xs text-rose-300/90 font-mono mt-0.5">
                  Statewide Traffic Authority & Control Room
                </p>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed">
                Full-scale operations system for traffic engineers and emergency dispatchers. Reconstruct traffic state, forecast shockwaves, test What-If signal/diversion interventions in real time, and deploy emergency green waves.
              </p>

              {/* Feature Chips */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-neutral-300 pt-2">
                <div className="flex items-center space-x-1.5 p-2 rounded-lg bg-neutral-950/80 border border-neutral-800">
                  <GitBranch className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="truncate">Cascade Explorer</span>
                </div>
                <div className="flex items-center space-x-1.5 p-2 rounded-lg bg-neutral-950/80 border border-neutral-800">
                  <Sliders className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="truncate">What-If Decision Lab</span>
                </div>
                <div className="flex items-center space-x-1.5 p-2 rounded-lg bg-neutral-950/80 border border-neutral-800">
                  <Cpu className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="truncate">SUMO Digital Twin</span>
                </div>
                <div className="flex items-center space-x-1.5 p-2 rounded-lg bg-neutral-950/80 border border-neutral-800">
                  <UserCheck className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="truncate">Human-in-the-Loop</span>
                </div>
              </div>
            </div>

            {/* Launch Button */}
            <div className="pt-6">
              <button
                type="button"
                id="enter-command-btn"
                onClick={() => handleSelectRole('ADMIN')}
                className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-rose-700 via-rose-600 to-red-700 hover:from-rose-600 hover:to-red-600 text-white font-mono font-bold text-sm flex items-center justify-center space-x-2 shadow-xl shadow-rose-950/50 transition-all border border-rose-500/50 cursor-pointer"
              >
                <span>ENTER AURA COMMAND</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* AURA CITIZEN (Public / Driver System) */}
          <div
            id="portal-card-citizen"
            className="rounded-2xl border border-cyan-900/60 bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950 p-6 sm:p-7 shadow-2xl flex flex-col justify-between relative group hover:border-cyan-700/80 transition-all duration-300"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-800 text-cyan-300 shadow-inner">
                  <Compass className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                    PUBLIC ACCESS
                  </span>
                  <div className="text-[10px] font-mono text-emerald-400 mt-1">● No Login Required</div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-black text-white font-mono tracking-tight flex items-center space-x-2">
                  <span>AURA CITIZEN</span>
                </h2>
                <p className="text-xs text-cyan-300/90 font-mono mt-0.5">
                  Public Driver Navigation & Future-Risk Protection
                </p>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed">
                Smart commuter navigator that evaluates both current travel time and future cascade risk along alternative paths. Explicit origin-destination routing prevents drivers from getting trapped in developing gridlocks.
              </p>

              {/* Feature Chips */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-neutral-300 pt-2">
                <div className="flex items-center space-x-1.5 p-2 rounded-lg bg-neutral-950/80 border border-neutral-800">
                  <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">Visual Arrival ETA</span>
                </div>
                <div className="flex items-center space-x-1.5 p-2 rounded-lg bg-neutral-950/80 border border-neutral-800">
                  <AlertTriangle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">Downstream Spillbacks</span>
                </div>
                <div className="flex items-center space-x-1.5 p-2 rounded-lg bg-neutral-950/80 border border-neutral-800">
                  <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">Risk Horizon Timing</span>
                </div>
                <div className="flex items-center space-x-1.5 p-2 rounded-lg bg-neutral-950/80 border border-neutral-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">Smart Reroutes</span>
                </div>
              </div>
            </div>

            {/* Launch Button */}
            <div className="pt-6">
              <button
                type="button"
                id="enter-citizen-btn"
                onClick={() => handleSelectRole('USER')}
                className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold text-sm flex items-center justify-center space-x-2 shadow-xl shadow-cyan-950/50 transition-all border border-cyan-500/50 cursor-pointer"
              >
                <span>ENTER AURA CITIZEN</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Data Provenance & Telemetry Integrity Strip */}
        <div className="mt-8 p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-neutral-400">
          <div className="flex items-center space-x-2">
            <span className="text-neutral-200 font-bold">DATA INTEGRITY STANDARDS:</span>
            <span className="text-neutral-500">Every metric carries strict provenance labeling:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 text-[10px]">
              OBSERVED (API Feed)
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-300 text-[10px]">
              ESTIMATED (Physical Kinematics)
            </span>
            <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 text-[10px]">
              PREDICTED (Graph Transformer)
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300 text-[10px]">
              SIMULATED (SUMO Digital Twin)
            </span>
          </div>
        </div>
      </main>

      {/* Portal Footer */}
      <footer className="px-6 py-4 border-t border-neutral-900 text-center text-xs font-mono text-neutral-500 flex flex-col sm:flex-row justify-between items-center z-10 gap-2">
        <div>AURA-TWIN Mobility Research & Deployment Architecture · v3.4</div>
        <div className="flex items-center space-x-3">
          <span>Tamil Nadu Corridor Graph</span>
          <span>·</span>
          <span>TraCI Interventions</span>
          <span>·</span>
          <span>Point Process Hazards</span>
        </div>
      </footer>
    </div>
  );
};
