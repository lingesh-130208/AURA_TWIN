import React from 'react';
import {
  MapPin,
  Navigation,
  Crosshair,
  Trash2,
  ExternalLink,
  Compass,
  Clock,
  Database,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { LocationDetails } from '../../types/traffic';

interface DestinationDetailsPanelProps {
  destination: LocationDetails | null;
  origin: LocationDetails | null;
  hasCalculatedRoutes: boolean;
  isCalculating: boolean;
  onStartRoute: () => void;
  onClearDestination: () => void;
  onViewOnMap: () => void;
  className?: string;
}

export const DestinationDetailsPanel: React.FC<DestinationDetailsPanelProps> = ({
  destination,
  origin,
  hasCalculatedRoutes,
  isCalculating,
  onStartRoute,
  onClearDestination,
  onViewOnMap,
  className = ''
}) => {
  if (!destination) return null;

  const canStartRoute = Boolean(origin && destination && !isCalculating);

  return (
    <div
      id="destination-details-panel"
      className={`p-4 sm:p-5 rounded-2xl bg-neutral-900/95 border border-rose-900/50 shadow-2xl space-y-4 backdrop-blur-md transition-all ${className}`}
    >
      {/* Header Badge */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-400">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono uppercase tracking-widest font-extrabold text-rose-400">
                DESTINATION SELECTED
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-neutral-300 border border-neutral-700">
                Verified Point
              </span>
            </div>
            <h3 className="text-sm font-bold text-white font-sans mt-0.5 leading-tight">
              {destination.name || 'Selected Destination'}
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={onClearDestination}
          className="p-1.5 rounded-lg bg-neutral-800/80 hover:bg-rose-950/80 text-neutral-400 hover:text-rose-300 border border-neutral-750 hover:border-rose-800 transition-colors"
          title="Clear destination"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Place Details Grid (No blank fields, shows 'Not available' if missing) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
        <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-850 space-y-1">
          <div className="text-[10px] text-neutral-400 flex items-center space-x-1">
            <Building2 className="w-3 h-3 text-neutral-500" />
            <span>FULL ADDRESS</span>
          </div>
          <div className="text-neutral-200 font-sans text-xs leading-relaxed line-clamp-2">
            {destination.address || 'Not available'}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-850 space-y-1">
          <div className="text-[10px] text-neutral-400 flex items-center space-x-1">
            <Compass className="w-3 h-3 text-neutral-500" />
            <span>CITY / DISTRICT / STATE</span>
          </div>
          <div className="text-neutral-200 text-xs">
            {destination.city || destination.district || 'Tamil Nadu'}, {destination.state || 'Tamil Nadu'}
          </div>
          {destination.district && destination.district !== destination.city && (
            <div className="text-[10px] text-neutral-400">
              District: {destination.district}
            </div>
          )}
        </div>

        <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-850 space-y-1">
          <div className="text-[10px] text-neutral-400 flex items-center space-x-1">
            <Crosshair className="w-3 h-3 text-neutral-500" />
            <span>COORDINATES</span>
          </div>
          <div className="text-neutral-300 text-[11px] font-mono">
            {destination.latitude.toFixed(5)}° N, {destination.longitude.toFixed(5)}° E
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-850 space-y-1">
          <div className="text-[10px] text-neutral-400 flex items-center space-x-1">
            <Database className="w-3 h-3 text-neutral-500" />
            <span>SOURCE & SELECTION TIME</span>
          </div>
          <div className="text-neutral-300 text-[11px] font-mono flex items-center justify-between">
            <span className="text-cyan-400">{destination.source || 'AURA Geocoder'}</span>
            <span className="text-neutral-400 flex items-center space-x-1">
              <Clock className="w-2.5 h-2.5" />
              <span>{destination.selectedTime || 'Just now'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Origin Requirement Notice if Origin missing */}
      {!origin && (
        <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs font-mono flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
          <span>Please choose your starting location (FROM) to calculate routes to this destination.</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onStartRoute}
          disabled={!canStartRoute}
          className={`flex-1 min-w-[160px] py-2.5 px-4 rounded-xl font-mono text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-lg ${
            canStartRoute
              ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-950 cursor-pointer'
              : 'bg-neutral-800 text-neutral-500 border border-neutral-750 cursor-not-allowed'
          }`}
        >
          <Navigation className={`w-3.5 h-3.5 ${isCalculating ? 'animate-spin' : ''}`} />
          <span>{isCalculating ? 'Calculating Route...' : hasCalculatedRoutes ? 'Recalculate Route' : 'Start Route'}</span>
        </button>

        <button
          type="button"
          onClick={onViewOnMap}
          className="py-2.5 px-3.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 hover:text-white border border-neutral-700 font-mono text-xs flex items-center space-x-1.5 transition-colors"
          title="Center map on destination"
        >
          <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
          <span>View on Map</span>
        </button>

        <button
          type="button"
          onClick={onClearDestination}
          className="py-2.5 px-3 rounded-xl bg-neutral-950 hover:bg-rose-950/60 text-neutral-400 hover:text-rose-300 border border-neutral-800 hover:border-rose-800 font-mono text-xs transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  );
};
