import React, { useState } from 'react';
import {
  Navigation,
  MapPin,
  Compass,
  ArrowRight,
  Crosshair,
  Search,
  RotateCcw,
  AlertCircle,
  Clock,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface CitizenTripPlannerProps {
  origin: string;
  destination: string;
  onOriginChange: (origin: string) => void;
  onDestinationChange: (destination: string) => void;
  onFindRoutes: () => void;
  onResetTrip: () => void;
  hasCalculatedRoutes: boolean;
  isCalculating?: boolean;
}

const COMMON_ORIGINS = [
  'Anna Nagar West, Chennai',
  'Trichy Central Bus Stand',
  'Gandhipuram, Coimbatore',
  'Madurai Periyar Terminal',
  'Salem New Bus Stand'
];

const COMMON_DESTINATIONS = [
  'Chennai International Airport (MAA)',
  'SRM TRP Engineering College, Trichy',
  'Tidel Park, Coimbatore',
  'Mattuthavani Integrated Bus Stand, Madurai',
  'Central Plaza Commercial Apex'
];

export const CitizenTripPlanner: React.FC<CitizenTripPlannerProps> = ({
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
  onFindRoutes,
  onResetTrip,
  hasCalculatedRoutes,
  isCalculating = false
}) => {
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationStatus(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const lat = position.coords.latitude.toFixed(4);
        const lng = position.coords.longitude.toFixed(4);
        onOriginChange(`Current GPS Location (${lat}, ${lng})`);
        setLocationStatus('Location detected successfully.');
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus('Location permission was denied. Please enter your starting point manually.');
        } else {
          setLocationStatus('Unable to retrieve location. Please enter your starting point manually.');
        }
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const isOriginValid = origin.trim().length > 0;
  const isDestinationValid = destination.trim().length > 0;
  const canCalculate = isOriginValid && isDestinationValid && !isCalculating;

  return (
    <div
      id="citizen-trip-planner"
      className="p-4 sm:p-5 rounded-2xl bg-neutral-900/95 border border-neutral-800 shadow-2xl space-y-4"
    >
      {/* Title & Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Trip Planner & Future-Risk Route Engine
            </h2>
            <p className="text-[11px] text-neutral-400 font-mono">
              Calculate arrival ETA and forecast downstream cascade bottlenecks before departing
            </p>
          </div>
        </div>

        {hasCalculatedRoutes && (
          <button
            type="button"
            onClick={onResetTrip}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-mono transition-colors border border-neutral-700"
          >
            <RotateCcw className="w-3 h-3" />
            <span>New Trip</span>
          </button>
        )}
      </div>

      {/* Input Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Origin Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <label htmlFor="origin-input" className="text-neutral-300 font-semibold flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Starting Location (FROM)</span>
            </label>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center space-x-1 transition-colors"
            >
              <Crosshair className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Locating...' : 'Use Current Location'}</span>
            </button>
          </div>

          <div className="relative">
            <input
              id="origin-input"
              type="text"
              value={origin}
              onChange={(e) => onOriginChange(e.target.value)}
              placeholder="Enter starting point (e.g. Anna Nagar, Trichy Station)"
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
            />
            {origin && (
              <button
                type="button"
                onClick={() => onOriginChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Origin Suggestions */}
          {!origin && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] text-neutral-500 font-mono self-center">Quick:</span>
              {COMMON_ORIGINS.slice(0, 3).map((org) => (
                <button
                  key={org}
                  type="button"
                  onClick={() => onOriginChange(org)}
                  className="px-2 py-0.5 rounded-md bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-[10px] font-mono text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                  {org.split(',')[0]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Destination Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <label htmlFor="destination-input" className="text-neutral-300 font-semibold flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>Destination (TO)</span>
            </label>
            <span className="text-[10px] text-neutral-500 font-mono">Explicit Search Required</span>
          </div>

          <div className="relative">
            <input
              id="destination-input"
              type="text"
              value={destination}
              onChange={(e) => onDestinationChange(e.target.value)}
              placeholder="Where do you want to go? (e.g. SRM TRP, Airport)"
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
            />
            {destination && (
              <button
                type="button"
                onClick={() => onDestinationChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Destination Suggestions */}
          {!destination && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] text-neutral-500 font-mono self-center">Quick:</span>
              {COMMON_DESTINATIONS.slice(0, 3).map((dest) => (
                <button
                  key={dest}
                  type="button"
                  onClick={() => onDestinationChange(dest)}
                  className="px-2 py-0.5 rounded-md bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-[10px] font-mono text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                  {dest.split('(')[0].split(',')[0]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Geolocation Notice / Warnings */}
      {locationStatus && (
        <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono flex items-center space-x-2 text-neutral-300">
          <AlertCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>{locationStatus}</span>
        </div>
      )}

      {/* Validation Message & Action Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="text-xs font-mono">
          {!isOriginValid && !isDestinationValid ? (
            <span className="text-neutral-500">Please enter your starting location and destination.</span>
          ) : !isOriginValid ? (
            <span className="text-amber-400 font-medium">Please enter your starting location.</span>
          ) : !isDestinationValid ? (
            <span className="text-amber-400 font-medium">Where do you want to go? Enter your destination.</span>
          ) : (
            <span className="text-emerald-400 flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Ready to calculate routes with live traffic & future risk.</span>
            </span>
          )}
        </div>

        <button
          id="find-routes-btn"
          type="button"
          disabled={!canCalculate}
          onClick={onFindRoutes}
          className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-lg ${
            canCalculate
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white cursor-pointer shadow-cyan-950'
              : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-850'
          }`}
        >
          <Navigation className={`w-3.5 h-3.5 ${isCalculating ? 'animate-spin' : ''}`} />
          <span>{isCalculating ? 'Calculating Telemetry...' : 'Find Routes & Predict Cascades'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
