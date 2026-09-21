import React from 'react';
import { Navigation, Clock, ShieldCheck, AlertTriangle, ArrowRight, CheckCircle2, Compass } from 'lucide-react';
import { RouteAlternative, LocationDetails } from '../../types/traffic';
import { CitizenDisruptionSimulator } from './CitizenDisruptionSimulator';
import { CitizenTripPlanner } from './CitizenTripPlanner';
import { DestinationDetailsPanel } from './DestinationDetailsPanel';

interface CitizenRoutesProps {
  routes: RouteAlternative[];
  selectedRouteId: string;
  onSelectRoute: (routeId: string) => void;
  origin: LocationDetails | null;
  destination: LocationDetails | null;
  onSelectOrigin: (loc: LocationDetails | null) => void;
  onSelectDestination: (loc: LocationDetails | null) => void;
  hasCalculatedRoutes: boolean;
  onFindRoutes: () => void;
  onResetTrip: () => void;
  isCalculating?: boolean;
}

export const CitizenRoutes: React.FC<CitizenRoutesProps> = ({
  routes,
  selectedRouteId,
  onSelectRoute,
  origin,
  destination,
  onSelectOrigin,
  onSelectDestination,
  hasCalculatedRoutes = false,
  onFindRoutes,
  onResetTrip,
  isCalculating = false
}) => {
  const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300">
              <Navigation className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-extrabold text-white tracking-tight font-mono">CORRIDOR ROUTE COMPARISON</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700 font-bold">
              PREDICTIVE NAVIGATION
            </span>
          </div>
          <p className="text-xs text-neutral-300 mt-1">
            Comparing current duration against arrival-time forecast to protect commuters from impending gridlock.
          </p>
        </div>
      </div>

      {/* Trip Planner */}
      <CitizenTripPlanner
        origin={origin}
        destination={destination}
        onSelectOrigin={onSelectOrigin}
        onSelectDestination={onSelectDestination}
        onFindRoutes={onFindRoutes}
        onResetTrip={onResetTrip}
        hasCalculatedRoutes={hasCalculatedRoutes}
        isCalculating={isCalculating}
      />

      {/* Destination Details Panel */}
      {destination && (
        <DestinationDetailsPanel
          destination={destination}
          origin={origin}
          hasCalculatedRoutes={hasCalculatedRoutes}
          isCalculating={isCalculating}
          onStartRoute={onFindRoutes}
          onClearDestination={() => onSelectDestination(null)}
          onViewOnMap={() => {}}
        />
      )}

      {!hasCalculatedRoutes ? (
        /* Empty Guidance State */
        <div className="p-8 rounded-2xl bg-neutral-900/60 border border-dashed border-neutral-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center mx-auto text-cyan-400">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white font-mono">
            No Routes Calculated Yet
          </h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">
            Please enter your starting location and where you want to go in the trip planner above. Once specified, AURA-TWIN will compute candidate corridors with live durations and arrival-time cascade risks.
          </p>
        </div>
      ) : (
        <>
          {/* Disruption Radar & Test Tool */}
          <CitizenDisruptionSimulator
            selectedRouteId={selectedRouteId}
            routes={routes}
            onSelectRoute={onSelectRoute}
          />

          {/* Routes Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {routes.map((route) => {
              const isSelected = selectedRouteId === route.id;
              return (
                <div
                  key={route.id}
                  onClick={() => onSelectRoute(route.id)}
                  className={`p-5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-neutral-900 border-cyan-500 ring-2 ring-cyan-500/40 shadow-xl'
                      : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-750'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        route.tag === 'LOWER_FUTURE_RISK'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : route.tag === 'FASTEST'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                          : 'bg-purple-950 text-purple-300 border border-purple-800'
                      }`}
                    >
                      {route.tagLabel || route.tag}
                    </span>
                    <span className="text-xs font-mono text-neutral-400">{route.distanceKm} km</span>
                  </div>

                  <h3 className="text-base font-bold text-white mt-3 font-sans">{route.name}</h3>

                  <div className="mt-4 grid grid-cols-2 gap-2 bg-neutral-950/70 p-3 rounded-lg border border-neutral-850">
                    <div>
                      <div className="text-[10px] font-mono text-neutral-400">Current Trip</div>
                      <div className="text-lg font-black text-white font-mono">{route.currentTravelTimeMinutes} min</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-neutral-400">Forecast Delay</div>
                      <div
                        className={`text-lg font-black font-mono ${
                          route.predictedTravelTimeMinutes > route.currentTravelTimeMinutes
                            ? 'text-rose-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {route.predictedTravelTimeMinutes} min
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-300 mt-3 leading-relaxed">
                    {route.tradeoffDescription}
                  </p>

                  <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-neutral-400">Future Risk Index</span>
                    <span className="text-xs font-mono font-bold text-neutral-200">
                      {route.futureRiskSeverity} ({route.predictedRiskPercent}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
