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
  HelpCircle
} from 'lucide-react';
import { RouteAlternative, Junction, RoadSegment } from '../../types/traffic';
import { InteractiveMap } from '../InteractiveMap';
import { GeminiService } from '../../services/geminiService';
import { CitizenDisruptionSimulator } from './CitizenDisruptionSimulator';
import { citizenNotificationService } from '../../services/citizenNotificationService';
import { RouteVisualEtaDisplay } from './RouteVisualEtaDisplay';
import { CitizenTripPlanner } from './CitizenTripPlanner';

interface CitizenMapProps {
  routes: RouteAlternative[];
  selectedRouteId: string;
  onSelectRoute: (routeId: string) => void;
  junctions: Junction[];
  segments: RoadSegment[];
  onOpenVoiceModal?: () => void;
  onOpenChatbot?: () => void;
  origin?: string;
  destination?: string;
  onOriginChange?: (val: string) => void;
  onDestinationChange?: (val: string) => void;
  hasCalculatedRoutes?: boolean;
  onFindRoutes?: () => void;
  onResetTrip?: () => void;
}

export const CitizenMap: React.FC<CitizenMapProps> = ({
  routes,
  selectedRouteId,
  onSelectRoute,
  junctions,
  segments,
  onOpenVoiceModal,
  onOpenChatbot,
  origin: propOrigin,
  destination: propDestination,
  onOriginChange: propOnOriginChange,
  onDestinationChange: propOnDestinationChange,
  hasCalculatedRoutes: propHasCalculatedRoutes,
  onFindRoutes: propOnFindRoutes,
  onResetTrip: propOnResetTrip
}) => {
  // Local state fallbacks if not controlled by parent
  const [localOrigin, setLocalOrigin] = useState('');
  const [localDestination, setLocalDestination] = useState('');
  const [localHasCalculated, setLocalHasCalculated] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  const [explainingRoute, setExplainingRoute] = useState<string | null>(null);
  const [citizenExplanation, setCitizenExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  // Determine controlled vs uncontrolled
  const origin = propOrigin !== undefined ? propOrigin : localOrigin;
  const destination = propDestination !== undefined ? propDestination : localDestination;
  const hasCalculated = propHasCalculatedRoutes !== undefined ? propHasCalculatedRoutes : localHasCalculated;

  const handleOriginChange = (val: string) => {
    if (propOnOriginChange) propOnOriginChange(val);
    else setLocalOrigin(val);
  };

  const handleDestinationChange = (val: string) => {
    if (propOnDestinationChange) propOnDestinationChange(val);
    else setLocalDestination(val);
  };

  const handleFindRoutes = () => {
    setIsCalculating(true);
    setTimeout(() => {
      setIsCalculating(false);
      if (propOnFindRoutes) {
        propOnFindRoutes();
      } else {
        setLocalHasCalculated(true);
        if (!selectedRouteId) {
          onSelectRoute('route-b'); // default to lower future risk route once calculated
        }
      }
    }, 450);
  };

  const handleResetTrip = () => {
    if (propOnResetTrip) {
      propOnResetTrip();
    } else {
      setLocalOrigin('');
      setLocalDestination('');
      setLocalHasCalculated(false);
      onSelectRoute('');
    }
  };

  const selectedRoute = hasCalculated ? routes.find(r => r.id === selectedRouteId) || routes[0] : null;

  const handleExplain = async (routeId: string) => {
    setIsExplaining(true);
    setExplainingRoute(routeId);
    setCitizenExplanation(null);

    const r = routes.find(rt => rt.id === routeId) || selectedRoute;
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
      {/* Top Disruption Warning Alert */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/80 via-neutral-900 to-neutral-900 border border-amber-700/70 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-amber-900/60 border border-amber-700 text-amber-300 shrink-0">
            <AlertTriangle className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center space-x-2 font-mono text-[10px]">
              <span className="px-1.5 py-0.5 rounded bg-amber-900 text-amber-200 font-bold uppercase">
                PREDICTED COMMUTER DISRUPTION
              </span>
              <span className="text-neutral-400">Impact Horizon: ~4 min</span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white mt-0.5">
              Spillback Predicted at Central Plaza in ~4 minutes
            </h2>
            <p className="text-xs text-neutral-300 mt-0.5 max-w-2xl">
              Commuters currently taking <strong>Route A (Grand Trunk Spine)</strong> will experience delay increasing from <strong>+2 min to +10 min</strong>. We recommend choosing a route with <strong>LOWER FUTURE RISK</strong>.
            </p>
            {hasCalculated && selectedRouteId === 'route-a' && (
              <button
                type="button"
                onClick={() => onSelectRoute('route-b')}
                className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition-colors"
              >
                <span>Switch to Route B (Eastern Bypass)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0 w-full md:w-auto">
          {onOpenVoiceModal && (
            <button
              onClick={onOpenVoiceModal}
              className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-md"
            >
              <Mic className="w-4 h-4" />
              <span>Voice Assistant</span>
            </button>
          )}

          {onOpenChatbot && (
            <button
              onClick={onOpenChatbot}
              className="px-3.5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-neutral-700"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Commuter Copilot</span>
            </button>
          )}
        </div>
      </div>

      {/* Mandatory Trip Planner (Section 6 Fix: Never automatically assign destination) */}
      <CitizenTripPlanner
        origin={origin}
        destination={destination}
        onOriginChange={handleOriginChange}
        onDestinationChange={handleDestinationChange}
        onFindRoutes={handleFindRoutes}
        onResetTrip={handleResetTrip}
        hasCalculatedRoutes={hasCalculated}
        isCalculating={isCalculating}
      />

      {/* Citizen Disruption Notification Simulator */}
      {hasCalculated && (
        <CitizenDisruptionSimulator
          selectedRouteId={selectedRouteId}
          routes={routes}
          onSelectRoute={onSelectRoute}
        />
      )}

      {/* Main Map and Route Selection Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Map View (2 Cols) */}
        <div className="lg:col-span-2 space-y-3">
          {/* Visual ETA Display for Selected Route based on Real-Time Traffic Data */}
          {hasCalculated && selectedRoute && (
            <RouteVisualEtaDisplay
              route={selectedRoute}
              allRoutes={routes}
              onSelectRoute={onSelectRoute}
            />
          )}

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-2">
              <Navigation className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Interactive Commuter Navigation & Risk Map
              </h3>
            </div>
            {hasCalculated && selectedRoute ? (
              <span className="text-xs font-mono text-neutral-400">
                Route {selectedRoute.id.slice(-1).toUpperCase()} Selected
              </span>
            ) : (
              <span className="text-xs font-mono text-neutral-500">
                Enter Origin & Destination Above
              </span>
            )}
          </div>

          <InteractiveMap
            junctions={junctions}
            segments={segments}
            incidents={[]}
            routes={hasCalculated ? routes : []}
            selectedRouteId={hasCalculated ? selectedRouteId : ''}
            onSelectRoute={onSelectRoute}
            interactiveMode="CITIZEN"
            className="h-[460px]"
          />
        </div>

        {/* Route Alternatives List / Trip Planning Guidance */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-xs font-mono font-bold text-neutral-300 uppercase">
              {hasCalculated ? 'Route Alternatives' : 'Route Planning'}
            </h3>
            <span className="text-[10px] font-mono text-neutral-500">
              {hasCalculated ? 'Live Traffic & Forecast' : 'Awaiting Input'}
            </span>
          </div>

          {!hasCalculated ? (
            /* Uncalculated Guidance State */
            <div className="p-5 rounded-xl bg-neutral-900/70 border border-dashed border-neutral-800 space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center mx-auto text-cyan-400 shadow-inner">
                <Compass className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white font-mono">
                  Where would you like to travel?
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed max-w-xs mx-auto font-sans">
                  Please specify both your starting location and destination in the trip planner above to compute real-time travel duration, bottlenecks, and cascade risks.
                </p>
              </div>

              <div className="pt-2 border-t border-neutral-800/80 text-left space-y-2 text-xs font-mono">
                <div className="text-[10px] text-neutral-500 uppercase tracking-wider">
                  Example Corridor Queries:
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleOriginChange('Anna Nagar West, Chennai');
                    handleDestinationChange('Chennai International Airport (MAA)');
                  }}
                  className="w-full text-left p-2 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors"
                >
                  📍 Anna Nagar West → Chennai Airport (MAA)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleOriginChange('Trichy Central Bus Stand');
                    handleDestinationChange('SRM TRP Engineering College, Trichy');
                  }}
                  className="w-full text-left p-2 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors"
                >
                  📍 Trichy Central → SRM TRP Campus
                </button>
              </div>
            </div>
          ) : (
            /* Route Cards List */
            routes.map((route) => {
              const isSelected = selectedRouteId === route.id;
              const isFastestNow = route.tag === 'FASTEST';
              const isLowerRisk = route.tag === 'LOWER_FUTURE_RISK';

              return (
                <div
                  key={route.id}
                  id={`citizen-route-card-${route.id}`}
                  onClick={() => onSelectRoute(route.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-neutral-900 border-cyan-500 ring-2 ring-cyan-500/40 shadow-xl'
                      : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-750'
                  }`}
                >
                  {/* Route Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-sm">{route.name}</span>
                      <span className="text-xs text-neutral-400">({route.distanceKm} km)</span>
                    </div>

                    {/* Badge */}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                      isLowerRisk
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : isFastestNow
                        ? 'bg-rose-950 text-rose-300 border-rose-800'
                        : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    }`}>
                      {route.tagLabel}
                    </span>
                  </div>

                  {/* Duration & Risk Comparison */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 rounded bg-neutral-950 border border-neutral-800">
                      <div className="text-[10px] text-neutral-400">LEAVING NOW</div>
                      <div className="text-base font-bold text-white mt-0.5">
                        {route.currentTravelTimeMinutes} min
                      </div>
                    </div>

                    <div className="p-2 rounded bg-neutral-950 border border-neutral-800">
                      <div className="text-[10px] text-neutral-400">PREDICTED AT ARRIVAL</div>
                      <div className={`text-base font-bold mt-0.5 ${
                        route.predictedTravelTimeMinutes > route.currentTravelTimeMinutes + 5 ? 'text-rose-400' : 'text-emerald-400'
                      }`}>
                        {route.predictedTravelTimeMinutes} min
                      </div>
                    </div>
                  </div>

                  {/* Plain language trade-off */}
                  <p className="text-[11px] text-neutral-300 mt-2.5 leading-snug">
                    {route.tradeoffDescription}
                  </p>

                  {/* AI Explanation Trigger */}
                  <div className="mt-3 pt-2 border-t border-neutral-800 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExplain(route.id);
                      }}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Why choose this route?</span>
                    </button>

                    <span className="text-[10px] font-mono text-neutral-500">
                      Risk: <strong className={route.predictedRiskPercent > 50 ? 'text-rose-400' : 'text-emerald-400'}>{route.predictedRiskPercent}%</strong>
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Citizen Plain-Language AI Explainer Card */}
      {(citizenExplanation || isExplaining) && (
        <div className="p-5 rounded-xl bg-neutral-900 border border-cyan-800/60 shadow-xl space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                AURA Commuter Guide // Route Insight
              </h3>
            </div>
            <button onClick={() => setCitizenExplanation(null)} className="text-neutral-400 hover:text-white text-xs">✕</button>
          </div>

          {isExplaining ? (
            <div className="py-4 text-center text-xs text-neutral-400 font-mono">
              Crafting clear commuter explanation...
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-sans">
              {citizenExplanation}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
