import React from 'react';
import { X, Sliders, Activity, Clock, ShieldAlert, Car, TrendingUp, AlertTriangle } from 'lucide-react';
import { RoadSegment, Junction } from '../types/traffic';

interface TelemetryInspectorProps {
  segment?: RoadSegment | null;
  junction?: Junction | null;
  onClose: () => void;
  onOpenWhatIf?: () => void;
  isAdmin?: boolean;
}

export const TelemetryInspector: React.FC<TelemetryInspectorProps> = ({
  segment,
  junction,
  onClose,
  onOpenWhatIf,
  isAdmin = true
}) => {
  if (!segment && !junction) return null;

  return (
    <div className="absolute right-3 top-16 z-30 w-84 sm:w-96 bg-neutral-900/95 backdrop-blur border border-neutral-750 rounded-xl shadow-2xl p-4 text-neutral-100 font-sans animate-in fade-in slide-in-from-right-4 duration-200">
      <div className="flex items-start justify-between pb-3 border-b border-neutral-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
              {segment ? 'ROAD SEGMENT' : 'JUNCTION NODE'}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-800 text-neutral-300">
              {segment ? segment.classification : 'ESTIMATED & PREDICTED'}
            </span>
          </div>
          <h3 className="text-base font-bold text-white mt-1">
            {segment ? segment.name : `${junction?.code} — ${junction?.name}`}
          </h3>
          <div className="text-xs text-neutral-400 font-mono">
            {segment ? `ID: ${segment.id} (${segment.fromJunction} → ${segment.toJunction})` : `Type: ${junction?.type}`}
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Segment Details */}
      {segment && (
        <div className="space-y-3 pt-3 text-xs">
          {/* Speed & Flow Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
              <div className="text-[10px] text-neutral-400 font-mono">CURRENT SPEED</div>
              <div className="text-lg font-bold font-mono text-white flex items-baseline space-x-1">
                <span>{segment.currentSpeedKmh}</span>
                <span className="text-xs text-neutral-400 font-normal">km/h</span>
              </div>
              <div className="text-[10px] text-neutral-400">Free-flow: {segment.freeFlowSpeedKmh} km/h</div>
            </div>

            <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
              <div className="text-[10px] text-neutral-400 font-mono">CAPACITY STRESS</div>
              <div className={`text-lg font-bold font-mono ${segment.capacityStressPercent > 80 ? 'text-rose-400' : 'text-yellow-400'}`}>
                {segment.capacityStressPercent}%
              </div>
              <div className="text-[10px] text-neutral-400">Queue: ~{segment.estimatedQueueMeters}m</div>
            </div>
          </div>

          {/* Density & Blocking */}
          <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-neutral-400">Flow Rate:</span>
              <span className="text-neutral-100 font-bold">{segment.flowVehiclesPerHour} veh/hr</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Density:</span>
              <span className="text-neutral-100 font-bold">{segment.densityVehiclesPerKm} veh/km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Blocking Probability:</span>
              <span className="text-rose-400 font-bold">{segment.blockingPercent}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Sensor Confidence:</span>
              <span className="text-cyan-400 font-bold">{segment.confidencePercent}%</span>
            </div>
          </div>

          {/* Vehicle Composition Breakdown */}
          <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
            <div className="text-[10px] text-neutral-400 font-mono mb-1.5 flex items-center justify-between">
              <span>VEHICLE COMPOSITION</span>
              <Car className="w-3 h-3 text-neutral-500" />
            </div>
            <div className="grid grid-cols-5 gap-1 text-center font-mono text-[10px]">
              <div className="p-1 rounded bg-neutral-900"><div className="text-neutral-400">Car</div><div className="font-bold">{segment.vehicleComposition.cars}%</div></div>
              <div className="p-1 rounded bg-neutral-900"><div className="text-neutral-400">2W</div><div className="font-bold">{segment.vehicleComposition.twoWheelers}%</div></div>
              <div className="p-1 rounded bg-neutral-900"><div className="text-neutral-400">Bus</div><div className="font-bold">{segment.vehicleComposition.buses}%</div></div>
              <div className="p-1 rounded bg-neutral-900"><div className="text-neutral-400">Auto</div><div className="font-bold">{segment.vehicleComposition.autos}%</div></div>
              <div className="p-1 rounded bg-neutral-900"><div className="text-neutral-400">HGV</div><div className="font-bold">{segment.vehicleComposition.heavyVehicles}%</div></div>
            </div>
          </div>
        </div>
      )}

      {/* Junction Details */}
      {junction && (
        <div className="space-y-3 pt-3 text-xs">
          {/* Key Hazard KPI */}
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/80">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-rose-300 uppercase font-bold flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                <span>HAZARD PREDICTION (3–6 MIN)</span>
              </span>
              <span className="text-[10px] font-mono text-rose-300 font-bold px-1.5 py-0.5 rounded bg-rose-900/80">
                {junction.riskSeverity}
              </span>
            </div>
            <div className="mt-1 text-sm font-bold text-white">
              Spillback Probability: <span className="text-rose-400">{junction.spillbackProbabilityPercent}%</span>
            </div>
            <p className="text-[11px] text-neutral-300 mt-1">
              Imminent queue spillback from approach link seg-5-7. Downstream propagation delay: ~180s.
            </p>
          </div>

          {/* Current vs Predicted State Matrix */}
          <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 space-y-1.5">
            <div className="text-[10px] font-mono text-neutral-400 uppercase font-semibold">
              Temporal State Forecast Horizon
            </div>
            <div className="grid grid-cols-4 gap-1 text-center font-mono text-[10px]">
              <div className="p-1.5 rounded bg-neutral-900">
                <div className="text-neutral-500">NOW</div>
                <div className="font-bold text-yellow-400">{junction.capacityPressurePercent}%</div>
                <div className="text-[9px] text-neutral-400">{junction.currentQueueMeters}m</div>
              </div>
              <div className="p-1.5 rounded bg-neutral-900">
                <div className="text-neutral-500">+3m</div>
                <div className="font-bold text-rose-400">96%</div>
                <div className="text-[9px] text-rose-300">Spillback</div>
              </div>
              <div className="p-1.5 rounded bg-neutral-900">
                <div className="text-neutral-500">+5m</div>
                <div className="font-bold text-rose-500">99%</div>
                <div className="text-[9px] text-rose-300">Lockout</div>
              </div>
              <div className="p-1.5 rounded bg-neutral-900">
                <div className="text-neutral-500">+10m</div>
                <div className="font-bold text-rose-500">J6 Block</div>
                <div className="text-[9px] text-neutral-400">Cascade</div>
              </div>
            </div>
          </div>

          {/* Operator Action Link */}
          {isAdmin && onOpenWhatIf && (
            <button
              onClick={onOpenWhatIf}
              className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-rose-700 to-red-800 hover:from-rose-600 hover:to-red-700 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-rose-950 transition-all"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Simulate Interventions in What-If Center</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
