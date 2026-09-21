import React from 'react';
import { Navigation, Clock, ShieldCheck, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { RouteAlternative } from '../../types/traffic';
import { CitizenDisruptionSimulator } from './CitizenDisruptionSimulator';

interface CitizenRoutesProps {
  routes: RouteAlternative[];
  selectedRouteId: string;
  onSelectRoute: (routeId: string) => void;
}

export const CitizenRoutes: React.FC<CitizenRoutesProps> = ({
  routes,
  selectedRouteId,
  onSelectRoute
}) => {
  const selectedRoute = routes.find(r => r.id === selectedRouteId) || routes[1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300">
              <Navigation className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-extrabold text-white tracking-tight">CORRIDOR ROUTE COMPARISON</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700 font-bold">
              PREDICTIVE NAVIGATION
            </span>
          </div>
          <p className="text-xs text-neutral-300 mt-1">
            Comparing current duration against arrival-time forecast to protect commuters from impending gridlock.
          </p>
        </div>
      </div>

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
                <span className="text-base font-bold text-white">{route.name}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                  route.tag === 'LOWER_FUTURE_RISK'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : route.tag === 'FASTEST'
                    ? 'bg-rose-950 text-rose-300 border-rose-800'
                    : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                }`}>
                  {route.tagLabel}
                </span>
              </div>

              <div className="text-xs text-neutral-400 font-mono mt-1">
                Distance: {route.distanceKm} km · Via {(route.viaRoads || []).join(', ')}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                  <div className="text-[10px] text-neutral-400">CURRENT TIME</div>
                  <div className="text-lg font-bold text-white mt-0.5">
                    {route.currentTravelTimeMinutes} min
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                  <div className="text-[10px] text-neutral-400">ARRIVAL FORECAST</div>
                  <div className={`text-lg font-bold mt-0.5 ${
                    route.predictedTravelTimeMinutes > route.currentTravelTimeMinutes + 5 ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {route.predictedTravelTimeMinutes} min
                  </div>
                </div>
              </div>

              <div className="mt-3 p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-300">
                {route.tradeoffDescription}
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-800 flex justify-between items-center text-xs">
                <span className="text-neutral-400 font-mono">
                  Future Risk: <strong className={route.predictedRiskPercent > 50 ? 'text-rose-400' : 'text-emerald-400'}>{route.predictedRiskPercent}%</strong>
                </span>
                <span className="text-cyan-400 font-bold flex items-center space-x-1">
                  <span>{isSelected ? 'Selected' : 'Select Route'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Route Turn-by-Turn Guidance */}
      <div className="p-6 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            Turn-by-Turn Guidance for {selectedRoute.name}
          </h3>
          <span className="text-xs font-mono text-emerald-400">
            Estimated Arrival: {selectedRoute.predictedTravelTimeMinutes} minutes
          </span>
        </div>

        <div className="space-y-3">
          {(selectedRoute.steps || []).map((st: { instruction: string; distance: string; estimatedDuration: string }, idx: number) => (
            <div key={idx} className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center justify-center font-mono font-bold text-[11px]">
                  {idx + 1}
                </span>
                <div>
                  <div className="font-semibold text-white">{st.instruction}</div>
                  <div className="text-[11px] text-neutral-400 font-mono">{st.distance} · {st.estimatedDuration}</div>
                </div>
              </div>

              <span className="text-[11px] font-mono text-neutral-400 bg-neutral-900 px-2 py-1 rounded">
                Free flow
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
