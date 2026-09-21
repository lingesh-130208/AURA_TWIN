import React, { useState } from 'react';
import {
  Compass,
  Navigation,
  AlertTriangle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Volume2,
  Mic,
  ArrowRight,
  TrendingDown,
  Info,
  MapPin,
  Search,
  HelpCircle,
  RotateCcw,
  Layers,
  Crosshair
} from 'lucide-react';
import { RouteAlternative, Junction, RoadSegment, LocationDetails, RouteTrafficSummary } from '../../types/traffic';
import { MapLibreMap } from '../MapLibreMap';
import { GoogleMapsView } from '../GoogleMapsView';
import { DestinationDetailsPanel } from './DestinationDetailsPanel';
import { CitizenTripPlanner } from './CitizenTripPlanner';
import { RouteVisualEtaDisplay } from './RouteVisualEtaDisplay';
import { CitizenDisruptionSimulator } from './CitizenDisruptionSimulator';
import { GeminiService } from '../../services/geminiService';

interface CitizenMapProps {
  routes: RouteAlternative[];
  selectedRouteId: string;
  onSelectRoute: (routeId: string) => void;
  junctions: Junction[];
  segments: RoadSegment[];
  origin: LocationDetails | null;
  destination: LocationDetails | null;
  clickedLocation: LocationDetails | null;
  onSelectOrigin: (loc: LocationDetails | null) => void;
  onSelectDestination: (loc: LocationDetails | null) => void;
  onMapClick: (lat: number, lng: number) => void;
  onSetClickedAsDestination: () => void;
  onSetClickedAsOrigin: () => void;
  onFindRoutes: () => void;
  onResetTrip: () => void;
  hasCalculatedRoutes: boolean;
  isCalculatingRoutes?: boolean;
  routingError?: string | null;
  trafficSummary?: RouteTrafficSummary | null;
  onOpenVoiceModal?: () => void;
  onOpenChatbot?: () => void;
}

export const CitizenMap: React.FC<CitizenMapProps> = ({
  routes,
  selectedRouteId,
  onSelectRoute,
  junctions,
  segments,
  origin,
  destination,
  clickedLocation,
  onSelectOrigin,
  onSelectDestination,
  onMapClick,
  onSetClickedAsDestination,
  onSetClickedAsOrigin,
  onFindRoutes,
  onResetTrip,
  hasCalculatedRoutes,
  isCalculatingRoutes = false,
  routingError = null,
  trafficSummary = null,
  onOpenVoiceModal,
  onOpenChatbot
}) => {
  const [explainingRoute, setExplainingRoute] = useState<string | null>(null);
  const [citizenExplanation, setCitizenExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [mapEngine, setMapEngine] = useState<'GOOGLE_MAPS' | 'MAPLIBRE'>('GOOGLE_MAPS');

  const selectedRoute = hasCalculatedRoutes
    ? routes.find((r) => r.id === selectedRouteId) || routes[0]
    : null;

  const handleExplain = async (routeId: string) => {
    setIsExplaining(true);
    setExplainingRoute(routeId);
    setCitizenExplanation(null);

    const r = routes.find((rt) => rt.id === routeId) || selectedRoute;
    if (!r) return;

    const exp = await GeminiService.explainToCitizen(r.name, r.tag, {
      currentTravelTime: r.currentTravelTimeMinutes,
      predictedTravelTime: r.predictedTravelTimeMinutes,
      predictedRiskPercent: r.predictedRiskPercent,
      tradeoff: r.tradeoffDescription
    });

    setIsExplaining(false);
    setCitizenExplanation(exp);
  };

  return (
    <div className="space-y-5">
      {/* Dynamic Corridor Disruption Alert Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/80 via-neutral-900 to-neutral-900 border border-amber-700/70 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-xl bg-amber-900/60 border border-amber-700 text-amber-300 shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2 font-mono text-[10px]">
              <span className="px-1.5 py-0.5 rounded bg-amber-900 text-amber-200 font-bold uppercase">
                AURA TRAFFIC INTELLIGENCE
              </span>
              <span className="text-neutral-400">Tamil Nadu Highway & Urban Network</span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white mt-0.5">
              Live Arterial Telemetry & Counterfactual Risk Analysis
            </h2>
            <p className="text-xs text-neutral-300 mt-0.5 max-w-2xl">
              Search any Tamil Nadu destination or click on the map to inspect real road geometry, avoid developing queue spillbacks, and calculate arrival-time certainty.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0 w-full md:w-auto">
          {onOpenVoiceModal && (
            <button
              onClick={onOpenVoiceModal}
              className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-md cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>Voice Assistant</span>
            </button>
          )}

          {onOpenChatbot && (
            <button
              onClick={onOpenChatbot}
              className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-neutral-700 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Commuter Copilot</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Trip Planner (Search Origin and Destination) */}
      <CitizenTripPlanner
        origin={origin}
        destination={destination}
        onSelectOrigin={onSelectOrigin}
        onSelectDestination={onSelectDestination}
        onFindRoutes={onFindRoutes}
        onResetTrip={onResetTrip}
        hasCalculatedRoutes={hasCalculatedRoutes}
        isCalculating={isCalculatingRoutes}
        errorMessage={routingError}
      />

      {/* Map Click Selection Banner (if user clicked anywhere on the map) */}
      {clickedLocation && !destination && (
        <div className="p-3.5 rounded-xl bg-neutral-900/90 border border-amber-500/50 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-amber-950 border border-amber-750 text-amber-400">
              <Crosshair className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-amber-400 uppercase font-bold">
                Map Location Clicked
              </div>
              <div className="text-xs font-semibold text-white">{clickedLocation.name}</div>
              <div className="text-[11px] text-neutral-400">{clickedLocation.address}</div>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onSetClickedAsDestination}
              className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold transition-colors cursor-pointer"
            >
              Set as Destination
            </button>
            <button
              type="button"
              onClick={onSetClickedAsOrigin}
              className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-colors cursor-pointer"
            >
              Set as Origin
            </button>
          </div>
        </div>
      )}

      {/* Destination Details Panel (CRITICAL: Shown after selecting a destination) */}
      {destination && (
        <DestinationDetailsPanel
          destination={destination}
          origin={origin}
          hasCalculatedRoutes={hasCalculatedRoutes}
          isCalculating={isCalculatingRoutes}
          onStartRoute={onFindRoutes}
          onClearDestination={() => onSelectDestination(null)}
          onViewOnMap={() => {}}
        />
      )}

      {/* Active Commuter Disruption Simulator */}
      {hasCalculatedRoutes && routes.length > 0 && (
        <CitizenDisruptionSimulator
          selectedRouteId={selectedRouteId}
          routes={routes}
          onSelectRoute={onSelectRoute}
        />
      )}

      {/* Main Map View and Route Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left / Center: Map View (2 Cols on desktop) */}
        <div className="lg:col-span-2 space-y-3">
          {/* Visual ETA Display for Selected Route */}
          {hasCalculatedRoutes && selectedRoute && (
            <RouteVisualEtaDisplay
              route={selectedRoute}
              allRoutes={routes}
              onSelectRoute={onSelectRoute}
            />
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center space-x-2">
              <Navigation className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Interactive Road Network & Corridor Navigation
              </h3>
            </div>

            <div className="flex items-center space-x-3">
              {/* Map Engine Selector */}
              <div className="flex items-center bg-neutral-900 border border-neutral-700 rounded-lg p-0.5 shadow-sm">
                <button
                  type="button"
                  onClick={() => setMapEngine('GOOGLE_MAPS')}
                  className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-colors flex items-center space-x-1 cursor-pointer ${
                    mapEngine === 'GOOGLE_MAPS'
                      ? 'bg-cyan-600 text-white shadow-sm font-semibold'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Google Maps</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMapEngine('MAPLIBRE')}
                  className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-colors flex items-center space-x-1 cursor-pointer ${
                    mapEngine === 'MAPLIBRE'
                      ? 'bg-neutral-700 text-white shadow-sm font-semibold'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>MapLibre</span>
                </button>
              </div>

              {hasCalculatedRoutes && selectedRoute ? (
                <span className="text-xs font-mono text-cyan-400 font-semibold hidden sm:inline">
                  {selectedRoute.name} ({selectedRoute.distanceKm} km · {selectedRoute.currentTravelTimeMinutes} min)
                </span>
              ) : destination ? (
                <span className="text-xs font-mono text-rose-400 font-semibold hidden sm:inline">
                  Destination: {destination.name}
                </span>
              ) : (
                <span className="text-xs font-mono text-neutral-500 hidden sm:inline">
                  Click map or type above
                </span>
              )}
            </div>
          </div>

          {/* Map Core: Google Maps or MapLibre */}
          {mapEngine === 'GOOGLE_MAPS' ? (
            <GoogleMapsView
              junctions={junctions}
              segments={segments}
              incidents={[]}
              routes={hasCalculatedRoutes ? routes : []}
              selectedRouteId={hasCalculatedRoutes ? selectedRouteId : ''}
              onSelectRoute={onSelectRoute}
              origin={origin}
              destination={destination}
              clickedLocation={clickedLocation}
              onMapClick={onMapClick}
              onSetClickedAsDestination={onSetClickedAsDestination}
              onSetClickedAsOrigin={onSetClickedAsOrigin}
              interactiveMode="CITIZEN"
              className="h-[500px]"
            />
          ) : (
            <MapLibreMap
              junctions={junctions}
              segments={segments}
              routes={hasCalculatedRoutes ? routes : []}
              selectedRouteId={hasCalculatedRoutes ? selectedRouteId : ''}
              onSelectRoute={onSelectRoute}
              origin={origin}
              destination={destination}
              clickedLocation={clickedLocation}
              onMapClick={onMapClick}
              onSetClickedAsDestination={onSetClickedAsDestination}
              onSetClickedAsOrigin={onSetClickedAsOrigin}
              interactiveMode="CITIZEN"
              className="h-[500px]"
            />
          )}
        </div>

        {/* Right Column: Route Alternatives & Future-Risk Analysis */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
              <div className="flex items-center space-x-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  Corridor Comparison
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">
                {hasCalculatedRoutes ? `${routes.length} Route Options` : 'Awaiting Route'}
              </span>
            </div>

            {!hasCalculatedRoutes ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-500">
                  <Navigation className="w-5 h-5" />
                </div>
                <div className="text-xs font-mono text-neutral-400">No active route calculated</div>
                <p className="text-[11px] text-neutral-500 max-w-xs mx-auto">
                  Select your starting point and destination in the planner above, then click Calculate Route.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {routes.map((route) => {
                  const isSelected = selectedRouteId === route.id;
                  return (
                    <div
                      key={route.id}
                      onClick={() => onSelectRoute(route.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-neutral-850 border-cyan-500 ring-2 ring-cyan-500/30 shadow-lg'
                          : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                route.tag === 'LOWER_FUTURE_RISK'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : route.tag === 'FASTEST'
                                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                                  : 'bg-purple-950 text-purple-300 border border-purple-800'
                              }`}
                            >
                              {route.tagLabel || route.tag}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-white mt-1 font-sans">
                            {route.name}
                          </div>
                        </div>

                        <div className="text-right font-mono">
                          <div className="text-sm font-black text-white">
                            {route.currentTravelTimeMinutes}m
                          </div>
                          <div className="text-[10px] text-neutral-400">
                            {route.distanceKm} km
                          </div>
                        </div>
                      </div>

                      {/* Tradeoff description */}
                      <p className="text-[11px] text-neutral-400 mt-2 line-clamp-2 leading-relaxed">
                        {route.tradeoffDescription || 'Predictive route kinematic model.'}
                      </p>

                      {/* Future Risk Metrics */}
                      <div className="mt-3 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px] font-mono">
                        <span className="text-neutral-400">Arrival Duration:</span>
                        <span
                          className={`font-bold ${
                            route.predictedTravelTimeMinutes > route.currentTravelTimeMinutes
                              ? 'text-rose-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {route.predictedTravelTimeMinutes} min (
                          {route.predictedTravelTimeMinutes - route.currentTravelTimeMinutes >= 0 ? '+' : ''}
                          {route.predictedTravelTimeMinutes - route.currentTravelTimeMinutes}m delay)
                        </span>
                      </div>

                      <div className="mt-1 flex items-center justify-between text-[10px] font-mono">
                        <span className="text-neutral-400">Gridlock Risk:</span>
                        <span
                          className={`font-bold ${
                            route.gridlockRiskPercent > 50
                              ? 'text-rose-400'
                              : route.gridlockRiskPercent > 25
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {route.gridlockRiskPercent}% probability
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Traffic Condition & Source Metadata */}
          {hasCalculatedRoutes && trafficSummary && (
            <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl space-y-2 text-xs font-mono">
              <div className="text-[10px] uppercase font-bold text-neutral-400 flex items-center justify-between">
                <span>ROUTE TRAFFIC SUMMARY</span>
                <span className="text-cyan-400 font-bold">{trafficSummary.status} TELEMETRY</span>
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Flow Speed:</span>
                  <span className="text-white font-bold">{trafficSummary.averageSpeedKmh} km/h avg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Condition:</span>
                  <span
                    className={`font-bold ${
                      trafficSummary.condition === 'CONGESTED'
                        ? 'text-rose-400'
                        : trafficSummary.condition === 'MODERATE'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {trafficSummary.condition}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Risk Window:</span>
                  <span className="text-neutral-200">{trafficSummary.riskWindow}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Cascade Exposure:</span>
                  <span className="text-neutral-200">{trafficSummary.cascadeExposure}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
