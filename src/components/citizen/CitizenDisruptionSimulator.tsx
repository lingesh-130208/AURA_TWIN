import React, { useState } from 'react';
import { Zap, Volume2, VolumeX, AlertTriangle, ShieldCheck, RefreshCw, BellRing } from 'lucide-react';
import { citizenNotificationService } from '../../services/citizenNotificationService';
import { RouteAlternative } from '../../types/traffic';

interface CitizenDisruptionSimulatorProps {
  selectedRouteId: string;
  routes: RouteAlternative[];
  onSelectRoute: (routeId: string) => void;
}

export const CitizenDisruptionSimulator: React.FC<CitizenDisruptionSimulatorProps> = ({
  selectedRouteId,
  routes,
  onSelectRoute
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const activeRoute = routes.find(r => r.id === selectedRouteId) || routes[0];
  const isMuted = citizenNotificationService.isSoundMuted();

  const handleSimulateDisruption = () => {
    citizenNotificationService.simulateDisruptionOnRoute(selectedRouteId, onSelectRoute);
  };

  const handleTriggerEvaluation = () => {
    citizenNotificationService.evaluateActiveRoute(selectedRouteId, onSelectRoute, true);
  };

  const handleToggleSound = () => {
    citizenNotificationService.toggleSound();
  };

  return (
    <div className="rounded-xl bg-neutral-900/90 border border-neutral-800 p-3 sm:p-4 text-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-400">
            <BellRing className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2 font-mono text-[10px]">
              <span className="font-bold text-white uppercase tracking-wider">
                AURA Commuter Safety Radar
              </span>
              <span className="text-neutral-500">·</span>
              <span className="text-cyan-400 font-semibold">Active: {activeRoute.name}</span>
            </div>
            <p className="text-neutral-400 text-[11px] mt-0.5">
              Live monitoring corridor telemetry for sudden bottlenecks or gridlock shockwaves.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleToggleSound}
            title={isMuted ? 'Unmute alert chimes' : 'Mute alert chimes'}
            className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-300 hover:text-white border border-neutral-700 flex items-center space-x-1 transition-colors"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-neutral-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
            <span className="text-[11px] font-mono hidden md:inline">{isMuted ? 'Muted' : 'Audio On'}</span>
          </button>

          <button
            type="button"
            onClick={handleSimulateDisruption}
            id="simulate-disruption-btn"
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md transition-all active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>Simulate Route Disruption</span>
          </button>
        </div>
      </div>
    </div>
  );
};
