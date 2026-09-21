import React, { useState } from 'react';
import {
  GitBranch,
  ArrowDown,
  Clock,
  AlertTriangle,
  Layers,
  ChevronRight,
  ShieldAlert,
  Info
} from 'lucide-react';
import { CascadeEvent, CascadeRelationship } from '../../types/traffic';
import { CASCADE_EVENTS, CASCADE_RELATIONSHIPS } from '../../services/mockTrafficData';

export const AdminCascadeExplorer: React.FC = () => {
  const [selectedEventId, setSelectedEventId] = useState<string>('e1');
  const events = CASCADE_EVENTS;
  const relationships = CASCADE_RELATIONSHIPS;

  const selectedEvent = events.find(e => e.id === selectedEventId) || events[0];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-rose-950 border border-rose-800 text-rose-300">
              <GitBranch className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-extrabold text-white tracking-tight">CASCADE EXPLORER</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700 font-bold">
              DIRECTED ACYCLIC GRAPH (DAG)
            </span>
          </div>
          <p className="text-xs text-neutral-300 mt-1">
            Point-process hazard propagation tracing: from root event at Central Plaza (J7) through downstream choke points.
          </p>
        </div>

        <div className="text-xs font-mono text-neutral-400 bg-neutral-950 px-3 py-1.5 rounded border border-neutral-800">
          Propagation Delay Model: <strong className="text-cyan-300">dt ~ Gamma(k, theta)</strong>
        </div>
      </div>

      {/* DAG Visualization Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Interactive Tree Map */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <span className="text-xs font-mono font-bold text-neutral-300 uppercase">
              Propagation Graph Hierarchy
            </span>
            <span className="text-[11px] font-mono text-neutral-400">Click node to inspect point-process parameters</span>
          </div>

          <div className="space-y-6 py-2">
            {/* Level 0: Root Event E1 */}
            <div className="flex justify-center">
              <div
                onClick={() => setSelectedEventId('e1')}
                className={`w-72 p-3.5 rounded-xl border cursor-pointer transition-all shadow-lg ${
                  selectedEventId === 'e1'
                    ? 'bg-rose-950/80 border-rose-500 ring-2 ring-rose-500/40'
                    : 'bg-neutral-950 border-rose-900/60 hover:border-rose-700'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-rose-900 text-rose-200 font-bold">ROOT EVENT // E1</span>
                  <span className="text-neutral-400">+3 MIN</span>
                </div>
                <div className="text-sm font-bold text-white mt-1">J7 — SPILLBACK</div>
                <div className="mt-2 flex justify-between text-xs font-mono">
                  <span className="text-neutral-400">Probability: <strong className="text-rose-400">72%</strong></span>
                  <span className="text-neutral-400">Severity: <strong className="text-rose-400">CRITICAL</strong></span>
                </div>
              </div>
            </div>

            {/* Connecting Branch Lines */}
            <div className="flex justify-center items-center space-x-24 text-neutral-600 font-mono text-[11px]">
              <div className="flex flex-col items-center">
                <ArrowDown className="w-5 h-5 text-rose-400 animate-bounce" />
                <span className="text-rose-400/80 text-[10px]">dt: 240s</span>
              </div>
              <div className="flex flex-col items-center">
                <ArrowDown className="w-5 h-5 text-orange-400 animate-bounce" />
                <span className="text-orange-400/80 text-[10px]">dt: 180s</span>
              </div>
            </div>

            {/* Level 1: Chained Events E2 and E3 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Event E2 (J6) */}
              <div
                onClick={() => setSelectedEventId('e2')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedEventId === 'e2'
                    ? 'bg-neutral-900 border-orange-500 ring-2 ring-orange-500/40'
                    : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-orange-950 text-orange-200 font-bold">DOWNSTREAM // E2</span>
                  <span className="text-neutral-400">+7 MIN</span>
                </div>
                <div className="text-sm font-bold text-white mt-1">J6 — DOWNSTREAM_BLOCKING</div>
                <div className="mt-2 flex justify-between text-xs font-mono">
                  <span className="text-neutral-400">Probability: <strong className="text-orange-400">64%</strong></span>
                  <span className="text-neutral-400">Delay: <strong className="text-neutral-200">240s</strong></span>
                </div>
              </div>

              {/* Event E3 (J8) */}
              <div
                onClick={() => setSelectedEventId('e3')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedEventId === 'e3'
                    ? 'bg-neutral-900 border-yellow-500 ring-2 ring-yellow-500/40'
                    : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-yellow-950 text-yellow-200 font-bold">DIVERSION // E3</span>
                  <span className="text-neutral-400">+10 MIN</span>
                </div>
                <div className="text-sm font-bold text-white mt-1">J8 — DIVERSION_OVERLOAD</div>
                <div className="mt-2 flex justify-between text-xs font-mono">
                  <span className="text-neutral-400">Probability: <strong className="text-yellow-400">53%</strong></span>
                  <span className="text-neutral-400">Delay: <strong className="text-neutral-200">180s</strong></span>
                </div>
              </div>
            </div>

            {/* Connecting Line to Level 2 */}
            <div className="flex justify-end pr-32">
              <div className="flex flex-col items-center text-neutral-600 font-mono text-[10px]">
                <ArrowDown className="w-5 h-5 text-yellow-400 animate-bounce" />
                <span className="text-yellow-400/80">dt: 240s</span>
              </div>
            </div>

            {/* Level 2: Secondary Overload E4 (J9) */}
            <div className="flex justify-end">
              <div
                onClick={() => setSelectedEventId('e4')}
                className={`w-72 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedEventId === 'e4'
                    ? 'bg-neutral-900 border-yellow-500 ring-2 ring-yellow-500/40'
                    : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-yellow-950 text-yellow-200 font-bold">TERMINAL // E4</span>
                  <span className="text-neutral-400">+14 MIN</span>
                </div>
                <div className="text-sm font-bold text-white mt-1">J9 — CAPACITY_REDUCTION</div>
                <div className="mt-2 flex justify-between text-xs font-mono">
                  <span className="text-neutral-400">Probability: <strong className="text-yellow-400">38%</strong></span>
                  <span className="text-neutral-400">Hospital Apex</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Event Detail & Point Process Inspector */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <span className="text-xs font-mono font-bold text-neutral-300 uppercase">
                CASCADE NODE TELEMETRY
              </span>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                {selectedEvent.id.toUpperCase()}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span className="text-neutral-400">Event Class:</span>
                <span className="font-bold text-white font-mono">{selectedEvent.type}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span className="text-neutral-400">Target Junction:</span>
                <span className="font-bold text-cyan-300 font-mono">{selectedEvent.junctionCode}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span className="text-neutral-400">Predicted Horizon:</span>
                <span className="font-bold text-white font-mono">+{selectedEvent.predictedTimeOffsetMinutes} minutes</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span className="text-neutral-400">Event Probability:</span>
                <span className="font-bold text-rose-400 font-mono">{selectedEvent.probabilityPercent}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span className="text-neutral-400">Model Confidence:</span>
                <span className="font-bold text-emerald-400 font-mono">{selectedEvent.confidencePercent}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span className="text-neutral-400">Propagation Delay:</span>
                <span className="font-bold text-neutral-200 font-mono">{selectedEvent.propagationDelaySeconds} sec (~{(selectedEvent.propagationDelaySeconds / 60).toFixed(1)}m)</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-300 space-y-1">
              <div className="font-bold text-neutral-200 font-mono">Relationship Physics:</div>
              <p>
                {selectedEvent.type === 'SPILLBACK' && 'Queue buildup exceeds link storage, spilling backwards into upstream intersection box.'}
                {selectedEvent.type === 'DOWNSTREAM_BLOCKING' && 'Inbound vehicles unable to clear junction due to tailback blocking exiting lanes.'}
                {selectedEvent.type === 'DIVERSION_OVERLOAD' && 'Drivers seeking detours saturate adjacent secondary arterial routes.'}
                {selectedEvent.type === 'CAPACITY_REDUCTION' && 'Excess merging density reduces flow below nominal capacity by 35%.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
