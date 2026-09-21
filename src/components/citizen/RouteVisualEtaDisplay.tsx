import React, { useState, useEffect } from 'react';
import {
  Clock,
  Navigation,
  Car,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Flame,
  Activity,
  Zap,
  Gauge
} from 'lucide-react';
import { RouteAlternative, SeverityLevel } from '../../types/traffic';

interface RouteVisualEtaDisplayProps {
  route: RouteAlternative;
  allRoutes: RouteAlternative[];
  onSelectRoute: (routeId: string) => void;
  className?: string;
}

export const RouteVisualEtaDisplay: React.FC<RouteVisualEtaDisplayProps> = ({
  route,
  allRoutes,
  onSelectRoute,
  className = ''
}) => {
  const [showSegmentBreakdown, setShowSegmentBreakdown] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Keep live clock updated each 30s
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Compute actual arrival time string (e.g. 10:42 AM)
  const arrivalDate = new Date(currentTime.getTime() + route.currentTravelTimeMinutes * 60000);
  const arrivalTimeString = arrivalDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  // Compute predicted arrival time if congestion wave hits
  const predictedArrivalDate = new Date(currentTime.getTime() + route.predictedTravelTimeMinutes * 60000);
  const predictedArrivalString = predictedArrivalDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  // Delay metrics
  const delayMinutes = Math.max(0, route.currentTravelTimeMinutes - Math.round((route.distanceKm / 50) * 60));
  const delaySurge = route.predictedTravelTimeMinutes - route.currentTravelTimeMinutes;

  // Average speed in km/h
  const avgSpeedKmh = Math.round((route.distanceKm / (route.currentTravelTimeMinutes / 60)));

  // Identify recommended alternative if current route is congested
  const recommendedRoute = allRoutes.find(
    r => r.id !== route.id && r.tag === 'LOWER_FUTURE_RISK'
  ) || allRoutes.find(r => r.id !== route.id && r.predictedTravelTimeMinutes < route.predictedTravelTimeMinutes);

  const getTrafficStatusBadge = (severity: SeverityLevel) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-950/80 border-rose-700/80 text-rose-300',
          dot: 'bg-rose-500 animate-ping',
          text: 'Severe Delay • Gridlock Threat'
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-950/80 border-orange-700/80 text-orange-300',
          dot: 'bg-orange-500',
          text: 'Heavy Traffic • Slow Moving'
        };
      case 'MODERATE':
        return {
          bg: 'bg-yellow-950/80 border-yellow-700/80 text-yellow-300',
          dot: 'bg-yellow-500',
          text: 'Moderate Flow • Stable'
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-emerald-950/80 border-emerald-700/80 text-emerald-300',
          dot: 'bg-emerald-500',
          text: 'Optimal Flow • Free Moving'
        };
    }
  };

  const statusBadge = getTrafficStatusBadge(route.currentTrafficSeverity);

  return (
    <div
      id="citizen-visual-eta-display"
      className={`rounded-2xl border border-neutral-800 bg-gradient-to-b from-neutral-900 via-neutral-900/95 to-neutral-950 shadow-2xl p-4 sm:p-5 text-neutral-100 transition-all ${className}`}
    >
      {/* Top Meta Header: Route Name & Live Traffic Status Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3.5 border-b border-neutral-800/80">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-700/80 text-cyan-400 shadow-inner">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white text-base tracking-tight">{route.name}</span>
              <span className="text-xs font-mono text-neutral-400">({route.distanceKm} km)</span>
            </div>
            <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
              via {route.viaRoads?.join(', ') || 'Primary Arterial Corridor'}
            </p>
          </div>
        </div>

        {/* Live Traffic Badge */}
        <div className="flex items-center space-x-2">
          <div className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold flex items-center space-x-2 border shadow-sm ${statusBadge.bg}`}>
            <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
            <span>{statusBadge.text}</span>
          </div>

          <div className="hidden sm:flex items-center space-x-1.5 px-2 py-1 rounded-md bg-neutral-800/80 border border-neutral-700 text-[10px] font-mono text-neutral-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>REAL-TIME</span>
          </div>
        </div>
      </div>

      {/* Primary Visual ETA Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-4 items-center">
        {/* Big ETA Callout (5 Cols) */}
        <div className="md:col-span-5 bg-neutral-950/80 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle glowing accent */}
          <div
            className={`absolute top-0 right-0 w-28 h-28 blur-3xl pointer-events-none rounded-full ${
              route.futureRiskSeverity === 'CRITICAL' || route.currentTrafficSeverity === 'CRITICAL'
                ? 'bg-rose-500/15'
                : route.currentTrafficSeverity === 'HIGH'
                ? 'bg-orange-500/15'
                : 'bg-cyan-500/15'
            }`}
          />

          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
              <span>ESTIMATED TRAVEL TIME</span>
              <span className="text-cyan-400 font-semibold flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Leaving Now</span>
              </span>
            </div>

            <div className="mt-2 flex items-baseline space-x-3">
              <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">
                {route.currentTravelTimeMinutes}
              </span>
              <span className="text-xl font-bold font-mono text-neutral-300">min</span>

              {delayMinutes > 0 ? (
                <span className="ml-auto px-2 py-0.5 rounded text-xs font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                  +{delayMinutes}m delay
                </span>
              ) : (
                <span className="ml-auto px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  On Time
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs">
            <span className="text-neutral-400 font-mono">Expected Arrival:</span>
            <span className="font-mono font-bold text-white text-sm bg-neutral-900 px-2 py-0.5 rounded border border-neutral-700">
              {arrivalTimeString}
            </span>
          </div>
        </div>

        {/* Future Risk & Corridor Analytics (7 Cols) */}
        <div className="md:col-span-7 space-y-3">
          {/* 3 Metric Cards */}
          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            {/* Avg Speed */}
            <div className="p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
              <div className="flex items-center justify-center space-x-1 text-[10px] text-neutral-400 uppercase">
                <Gauge className="w-3 h-3 text-cyan-400" />
                <span>Avg Speed</span>
              </div>
              <div className="text-lg font-bold text-white mt-1">
                {avgSpeedKmh} <span className="text-[11px] font-normal text-neutral-400">km/h</span>
              </div>
            </div>

            {/* Gridlock Risk */}
            <div className="p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
              <div className="flex items-center justify-center space-x-1 text-[10px] text-neutral-400 uppercase">
                <Flame className="w-3 h-3 text-orange-400" />
                <span>Gridlock Risk</span>
              </div>
              <div className={`text-lg font-bold mt-1 ${
                route.predictedRiskPercent > 50 ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {route.predictedRiskPercent}%
              </div>
            </div>

            {/* Disruption Horizon */}
            <div className="p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
              <div className="flex items-center justify-center space-x-1 text-[10px] text-neutral-400 uppercase">
                <Activity className="w-3 h-3 text-purple-400" />
                <span>Risk Window</span>
              </div>
              <div className="text-xs font-bold text-neutral-200 mt-1.5 truncate" title={route.riskTimeWindow}>
                {route.riskTimeWindow || 'Stable'}
              </div>
            </div>
          </div>

          {/* Real-time vs Arrival Forecast Comparison Bar */}
          <div className="p-3 rounded-xl bg-neutral-950/90 border border-neutral-800 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-neutral-400">Departure Time Horizon:</span>
              <span className="text-neutral-300">
                Departure: <strong>{route.currentTravelTimeMinutes} min</strong> → In 10 min:{' '}
                <strong className={delaySurge > 3 ? 'text-rose-400' : 'text-emerald-400'}>
                  {route.predictedTravelTimeMinutes} min
                </strong>
              </span>
            </div>

            {/* Two-Bar Visual Comparison */}
            <div className="space-y-1.5">
              <div>
                <div className="flex justify-between text-[10px] text-neutral-400 pb-0.5">
                  <span>If leaving immediately</span>
                  <span className="text-white font-bold">{route.currentTravelTimeMinutes} min ({arrivalTimeString})</span>
                </div>
                <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (route.currentTravelTimeMinutes / 35) * 100)}%` }}
                  />
                </div>
              </div>

              {delaySurge > 0 && (
                <div>
                  <div className="flex justify-between text-[10px] text-neutral-400 pb-0.5">
                    <span className="text-amber-300 flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      <span>If delayed or during peak spillback</span>
                    </span>
                    <span className="text-rose-400 font-bold">{route.predictedTravelTimeMinutes} min ({predictedArrivalString})</span>
                  </div>
                  <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (route.predictedTravelTimeMinutes / 35) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Smart Reroute Recommendation Banner (Shown when selected route has high risk and alternative is faster) */}
      {recommendedRoute && route.predictedRiskPercent > 40 && (
        <div className="mt-3.5 p-3 rounded-xl bg-gradient-to-r from-emerald-950/70 via-neutral-900 to-neutral-900 border border-emerald-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-start space-x-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-900/60 border border-emerald-700 text-emerald-300 shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2 font-mono text-[10px]">
                <span className="font-bold text-emerald-300 uppercase">AI TRAFFIC ADVISORY</span>
                <span className="text-neutral-400">• Lower Risk Alternative Available</span>
              </div>
              <p className="text-xs text-neutral-200 mt-0.5">
                Switching to <strong>{recommendedRoute.name}</strong> circumvents the impending bottleneck, saving ~{Math.max(3, route.predictedTravelTimeMinutes - recommendedRoute.predictedTravelTimeMinutes)} min as congestion escalates.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectRoute(recommendedRoute.id)}
            className="shrink-0 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold flex items-center space-x-1.5 shadow transition-colors"
          >
            <span>Switch to {recommendedRoute.name.split(' ')[0]}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Segment Speeds Breakdown Accordion Toggle */}
      {route.segments && route.segments.length > 0 && (
        <div className="mt-3 pt-3 border-t border-neutral-800">
          <button
            type="button"
            onClick={() => setShowSegmentBreakdown(!showSegmentBreakdown)}
            className="w-full flex items-center justify-between text-xs font-mono text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <span className="flex items-center space-x-1.5">
              <Car className="w-3.5 h-3.5 text-cyan-400" />
              <span>Real-Time Segment Speeds & Bottlenecks ({route.segments.length} segments)</span>
            </span>
            <span className="flex items-center space-x-1 text-cyan-400">
              <span>{showSegmentBreakdown ? 'Hide Breakdown' : 'View Speeds'}</span>
              {showSegmentBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </span>
          </button>

          {showSegmentBreakdown && (
            <div className="mt-2.5 space-y-1.5 pt-1 animate-in fade-in">
              {route.segments.map((seg, idx) => {
                const isSlow = seg.currentSpeedKmh < 25;
                const isCritical = seg.risk === 'CRITICAL';

                return (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-neutral-950/70 border border-neutral-800 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center space-x-2 truncate max-w-[65%]">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        isCritical ? 'bg-rose-500 animate-pulse' : isSlow ? 'bg-orange-500' : 'bg-emerald-500'
                      }`} />
                      <span className="truncate text-neutral-200">{seg.roadName}</span>
                      <span className="text-[10px] text-neutral-500 shrink-0">({seg.lengthMeters}m)</span>
                    </div>

                    <div className="flex items-center space-x-3 text-right">
                      <div>
                        <span className="text-[10px] text-neutral-400 mr-1">Live:</span>
                        <strong className={isCritical ? 'text-rose-400' : isSlow ? 'text-orange-400' : 'text-emerald-400'}>
                          {seg.currentSpeedKmh} km/h
                        </strong>
                      </div>
                      <div className="hidden sm:block text-neutral-500 text-[10px]">
                        Forecast: {seg.predictedSpeedKmh} km/h
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
