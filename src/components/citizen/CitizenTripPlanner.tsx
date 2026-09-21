import React, { useState, useEffect, useRef } from 'react';
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
  ArrowUpDown,
  CheckCircle2,
  Building2,
  X,
  Loader2
} from 'lucide-react';
import { LocationDetails } from '../../types/traffic';
import { routingService } from '../../services/routingService';

interface CitizenTripPlannerProps {
  origin: LocationDetails | null;
  destination: LocationDetails | null;
  onSelectOrigin: (loc: LocationDetails | null) => void;
  onSelectDestination: (loc: LocationDetails | null) => void;
  onFindRoutes: () => void;
  onResetTrip: () => void;
  hasCalculatedRoutes: boolean;
  isCalculating?: boolean;
  errorMessage?: string | null;
}

const COMMON_ORIGINS: LocationDetails[] = [
  {
    name: 'Anna Nagar West, Chennai',
    address: 'Anna Nagar West, Chennai, Tamil Nadu 600040',
    city: 'Chennai',
    state: 'Tamil Nadu',
    latitude: 13.0878,
    longitude: 80.2038,
    source: 'Quick Preset'
  },
  {
    name: 'Tiruchirappalli Central Bus Stand',
    address: 'Rockins Road, Cantonment, Tiruchirappalli, Tamil Nadu 620001',
    city: 'Tiruchirappalli',
    state: 'Tamil Nadu',
    latitude: 10.7963,
    longitude: 78.6856,
    source: 'Quick Preset'
  },
  {
    name: 'Gandhipuram Bus Stand, Coimbatore',
    address: '7th Street, Gandhipuram, Coimbatore, Tamil Nadu 641012',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    latitude: 11.0168,
    longitude: 76.9678,
    source: 'Quick Preset'
  },
  {
    name: 'Mattuthavani Bus Stand, Madurai',
    address: 'Melur Road, Mattuthavani, Madurai, Tamil Nadu 625007',
    city: 'Madurai',
    state: 'Tamil Nadu',
    latitude: 9.9452,
    longitude: 78.1568,
    source: 'Quick Preset'
  }
];

const COMMON_DESTINATIONS: LocationDetails[] = [
  {
    name: 'SRM TRP Engineering College',
    address: 'NH-45, Mannachanallur Taluk, Irungalur, Tiruchirappalli, Tamil Nadu 621105',
    city: 'Tiruchirappalli',
    state: 'Tamil Nadu',
    latitude: 10.9632,
    longitude: 78.7381,
    source: 'Quick Preset'
  },
  {
    name: 'Chennai International Airport (MAA)',
    address: 'GST Road, Meenambakkam, Chennai, Tamil Nadu 600027',
    city: 'Chennai',
    state: 'Tamil Nadu',
    latitude: 12.9815,
    longitude: 80.1637,
    source: 'Quick Preset'
  },
  {
    name: 'Srirangam Sri Ranganathaswamy Temple',
    address: 'Srirangam, Tiruchirappalli, Tamil Nadu 620006',
    city: 'Tiruchirappalli',
    state: 'Tamil Nadu',
    latitude: 10.8624,
    longitude: 78.6901,
    source: 'Quick Preset'
  },
  {
    name: 'Central Plaza Commercial Nexus (J7)',
    address: 'Grand Trunk Spine, Thousand Lights, Chennai, Tamil Nadu 600006',
    city: 'Chennai',
    state: 'Tamil Nadu',
    latitude: 13.0674,
    longitude: 80.2600,
    source: 'Quick Preset'
  }
];

export const CitizenTripPlanner: React.FC<CitizenTripPlannerProps> = ({
  origin,
  destination,
  onSelectOrigin,
  onSelectDestination,
  onFindRoutes,
  onResetTrip,
  hasCalculatedRoutes,
  isCalculating = false,
  errorMessage = null
}) => {
  // Text input values
  const [originText, setOriginText] = useState('');
  const [destinationText, setDestinationText] = useState('');

  // Geocoding search states
  const [originResults, setOriginResults] = useState<LocationDetails[]>([]);
  const [destinationResults, setDestinationResults] = useState<LocationDetails[]>([]);
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);
  const [isSearchingDestination, setIsSearchingDestination] = useState(false);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);

  // Geolocation states
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Sync inputs with selected locations
  useEffect(() => {
    if (origin) {
      setOriginText(origin.name || origin.address);
    } else {
      setOriginText('');
    }
  }, [origin]);

  useEffect(() => {
    if (destination) {
      setDestinationText(destination.name || destination.address);
    } else {
      setDestinationText('');
    }
  }, [destination]);

  // Debounced Origin Search
  useEffect(() => {
    if (!originText || originText.trim().length < 2 || (origin && originText === (origin.name || origin.address))) {
      setOriginResults([]);
      setIsSearchingOrigin(false);
      return;
    }

    setIsSearchingOrigin(true);
    const timer = setTimeout(async () => {
      try {
        const results = await routingService.searchLocations(originText);
        setOriginResults(results);
        setShowOriginDropdown(true);
      } catch (err) {
        console.warn('Origin search error:', err);
      } finally {
        setIsSearchingOrigin(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [originText, origin]);

  // Debounced Destination Search
  useEffect(() => {
    if (
      !destinationText ||
      destinationText.trim().length < 2 ||
      (destination && destinationText === (destination.name || destination.address))
    ) {
      setDestinationResults([]);
      setIsSearchingDestination(false);
      return;
    }

    setIsSearchingDestination(true);
    const timer = setTimeout(async () => {
      try {
        const results = await routingService.searchLocations(destinationText);
        setDestinationResults(results);
        setShowDestinationDropdown(true);
      } catch (err) {
        console.warn('Destination search error:', err);
      } finally {
        setIsSearchingDestination(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [destinationText, destination]);

  // Browser Geolocation for Origin
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationStatus('Requesting browser GPS permission...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const loc = await routingService.reverseGeocode(lat, lon);
          onSelectOrigin(loc);
          setLocationStatus(null);
        } catch {
          onSelectOrigin({
            name: 'Current Device Location',
            address: `GPS: ${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            source: 'Browser Geolocation'
          });
          setLocationStatus(null);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus('Location permission was denied. Search for your starting location instead.');
        } else {
          setLocationStatus('Unable to retrieve location. Please search for your starting location.');
        }
      },
      { timeout: 9000, enableHighAccuracy: true }
    );
  };

  // Swap Origin and Destination
  const handleSwap = () => {
    const tempOrigin = origin;
    onSelectOrigin(destination);
    onSelectDestination(tempOrigin);
  };

  // Clear Origin
  const handleClearOrigin = () => {
    onSelectOrigin(null);
    setOriginText('');
    setOriginResults([]);
    setShowOriginDropdown(false);
  };

  // Clear Destination
  const handleClearDestination = () => {
    onSelectDestination(null);
    setDestinationText('');
    setDestinationResults([]);
    setShowDestinationDropdown(false);
  };

  const hasValidOrigin = Boolean(origin && origin.latitude && origin.longitude);
  const hasValidDestination = Boolean(destination && destination.latitude && destination.longitude);
  const canCalculate = hasValidOrigin && hasValidDestination && !isCalculating;

  return (
    <div
      id="citizen-trip-planner"
      className="p-4 sm:p-5 rounded-2xl bg-neutral-900/95 border border-neutral-800 shadow-2xl space-y-4 relative"
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
              Real geocoding and road-following routes with AURA downstream cascade risk prediction
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
            <span>Reset Trip</span>
          </button>
        )}
      </div>

      {/* Inputs Grid with Swap button in the center */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 relative">
        {/* Origin (FROM) Input */}
        <div className="space-y-1.5 relative">
          <div className="flex items-center justify-between text-xs font-mono">
            <label htmlFor="origin-input" className="text-neutral-300 font-semibold flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Starting Location (FROM)</span>
            </label>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center space-x-1 transition-colors cursor-pointer"
            >
              <Crosshair className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Locating...' : 'Use My Location'}</span>
            </button>
          </div>

          <div className="relative">
            <input
              id="origin-input"
              type="text"
              value={originText}
              onChange={(e) => {
                setOriginText(e.target.value);
                setShowOriginDropdown(true);
              }}
              onFocus={() => setShowOriginDropdown(true)}
              placeholder="Search origin: e.g. Anna Nagar, Trichy Station..."
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-500 rounded-xl pl-3.5 pr-8 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
            />
            {isSearchingOrigin && (
              <div className="absolute right-8 top-1/2 -translate-y-1/2 text-cyan-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              </div>
            )}
            {originText && (
              <button
                type="button"
                onClick={handleClearOrigin}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white p-1"
                title="Clear origin"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Origin Search Results Dropdown */}
          {showOriginDropdown && originResults.length > 0 && (
            <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-neutral-950 border border-neutral-750 rounded-xl shadow-2xl max-h-60 overflow-y-auto divide-y divide-neutral-850">
              <div className="px-3 py-1.5 text-[10px] font-mono text-neutral-400 uppercase tracking-wider bg-neutral-900">
                Select Starting Point ({originResults.length} matches)
              </div>
              {originResults.map((res, i) => (
                <div
                  key={`${res.name}-${i}`}
                  onClick={() => {
                    onSelectOrigin(res);
                    setOriginText(res.name);
                    setShowOriginDropdown(false);
                  }}
                  className="p-2.5 hover:bg-neutral-800/80 cursor-pointer transition-colors text-left group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-xs text-white group-hover:text-cyan-400 font-sans">
                      {res.name}
                    </div>
                    <span className="text-[9px] font-mono px-1 rounded bg-neutral-800 text-neutral-400 shrink-0">
                      {res.city || 'TN'}
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">{res.address}</div>
                  <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                    {res.latitude.toFixed(4)}°, {res.longitude.toFixed(4)}° · {res.source}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Origin Presets if none selected */}
          {!origin && !originText && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] text-neutral-500 font-mono self-center">Presets:</span>
              {COMMON_ORIGINS.slice(0, 3).map((org) => (
                <button
                  key={org.name}
                  type="button"
                  onClick={() => onSelectOrigin(org)}
                  className="px-2 py-0.5 rounded-md bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-[10px] font-mono text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                  {org.name.split(',')[0]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Destination (TO) Input */}
        <div className="space-y-1.5 relative">
          <div className="flex items-center justify-between text-xs font-mono">
            <label htmlFor="destination-input" className="text-neutral-300 font-semibold flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>Destination (TO)</span>
            </label>
            <span className="text-[10px] text-neutral-500 font-mono">Search & Select</span>
          </div>

          <div className="relative">
            <input
              id="destination-input"
              type="text"
              value={destinationText}
              onChange={(e) => {
                setDestinationText(e.target.value);
                setShowDestinationDropdown(true);
              }}
              onFocus={() => setShowDestinationDropdown(true)}
              placeholder="Search destination: e.g. SRM TRP, Airport..."
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-rose-500 rounded-xl pl-3.5 pr-8 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all font-mono"
            />
            {isSearchingDestination && (
              <div className="absolute right-8 top-1/2 -translate-y-1/2 text-rose-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              </div>
            )}
            {destinationText && (
              <button
                type="button"
                onClick={handleClearDestination}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white p-1"
                title="Clear destination"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Destination Search Results Dropdown */}
          {showDestinationDropdown && destinationResults.length > 0 && (
            <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-neutral-950 border border-neutral-750 rounded-xl shadow-2xl max-h-60 overflow-y-auto divide-y divide-neutral-850">
              <div className="px-3 py-1.5 text-[10px] font-mono text-neutral-400 uppercase tracking-wider bg-neutral-900">
                Select Destination ({destinationResults.length} matches)
              </div>
              {destinationResults.map((res, i) => (
                <div
                  key={`${res.name}-${i}`}
                  onClick={() => {
                    onSelectDestination(res);
                    setDestinationText(res.name);
                    setShowDestinationDropdown(false);
                  }}
                  className="p-2.5 hover:bg-neutral-800/80 cursor-pointer transition-colors text-left group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-xs text-white group-hover:text-rose-400 font-sans">
                      {res.name}
                    </div>
                    <span className="text-[9px] font-mono px-1 rounded bg-neutral-800 text-neutral-400 shrink-0">
                      {res.city || 'TN'}
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">{res.address}</div>
                  <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                    {res.latitude.toFixed(4)}°, {res.longitude.toFixed(4)}° · {res.source}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Destination Presets if none selected */}
          {!destination && !destinationText && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] text-neutral-500 font-mono self-center">Presets:</span>
              {COMMON_DESTINATIONS.slice(0, 3).map((dest) => (
                <button
                  key={dest.name}
                  type="button"
                  onClick={() => onSelectDestination(dest)}
                  className="px-2 py-0.5 rounded-md bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-[10px] font-mono text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                  {dest.name.split(',')[0]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Geolocation status / error */}
      {locationStatus && (
        <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono flex items-center space-x-2 text-neutral-300">
          <AlertCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>{locationStatus}</span>
        </div>
      )}

      {/* Global Error Banner if passed from parent */}
      {errorMessage && (
        <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800 text-xs font-mono flex items-center space-x-2 text-rose-300">
          <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Validation Message & Action Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="text-xs font-mono">
          {!hasValidOrigin && !hasValidDestination ? (
            <span className="text-neutral-500">Please choose your starting location and destination.</span>
          ) : !hasValidOrigin ? (
            <span className="text-amber-400 font-medium">Please choose your starting location (FROM).</span>
          ) : !hasValidDestination ? (
            <span className="text-amber-400 font-medium">Please select a destination (TO).</span>
          ) : (
            <span className="text-emerald-400 flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Ready to calculate real road route with downstream cascade risk.</span>
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {hasValidOrigin && hasValidDestination && (
            <button
              type="button"
              onClick={handleSwap}
              className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 text-xs font-mono transition-colors"
              title="Swap Origin and Destination"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          )}

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
            <span>{isCalculating ? 'Calculating Real Road Route...' : 'Calculate Route & Risk'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
