import React from 'react';
import {
  AlertTriangle,
  TrendingDown,
  Activity,
  GitBranch,
  Siren,
  Sliders,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { Junction, RoadSegment, TrafficIncident } from '../../types/traffic';
import { InteractiveMap } from '../InteractiveMap';

interface AdminOverviewProps {
  junctions: Junction[];
  segments: RoadSegment[];
  incidents: TrafficIncident[];
  onNavigate: (view: string) => void;
  onSelectJunction: (junction: Junction) => void;
  onSelectSegment: (segment: RoadSegment) => void;
  selectedJunctionCode?: string;
  selectedSegmentId?: string;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  junctions,
  segments,
  incidents,
  onNavigate,
  onSelectJunction,
  onSelectSegment,
  selectedJunctionCode,
  selectedSegmentId
}) => {
  const criticalJunction = junctions.find(j => j.code === 'J7') || junctions[6];

  return (
    <div className="space-y-5">
      {/* Top Situation Alert Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/80 via-neutral-900 to-neutral-900 border border-rose-800/80 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 rounded-lg bg-rose-900/60 border border-rose-700 text-rose-300 shrink-0">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-900 text-rose-200 uppercase">
                CRITICAL NETWORK SITUATION
              </span>
              <span className="text-xs font-mono text-neutral-400">Time Window: 3–6 min</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              Imminent Queue Spillback Predicted at Central Plaza ({criticalJunction.code})
            </h2>
            <p className="text-xs text-neutral-300 max-w-2xl mt-0.5">
              Spillback hazard is <strong>{criticalJunction.spillbackProbabilityPercent}%</strong>.
              Point process propagation trajectory indicates downstream blocking at Harbor Link ({'J6'}) and diversion overflow at Hospital North ({'J8'}).
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto shrink-0">
          <button
            onClick={() => onNavigate('what-if')}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-lg bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-950 flex items-center justify-center space-x-2 transition-colors border border-rose-500/40"
          >
            <Sliders className="w-4 h-4" />
            <span>Open What-If Decision Center</span>
          </button>
          <button
            onClick={() => onNavigate('cascade')}
            className="px-3.5 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-neutral-700"
          >
            <GitBranch className="w-4 h-4" />
            <span>Trace Cascade</span>
          </button>
        </div>
      </div>

      {/* Control Room KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Network Status */}
        <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400 uppercase">
            <span>Network Status</span>
            <span className="text-rose-400 font-bold">DETERIORATING</span>
          </div>
          <div className="text-xl font-bold font-mono text-rose-400 mt-1">CRITICAL</div>
          <div className="text-[10px] text-neutral-400 mt-1 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            <span>J7 Apex Bottleneck</span>
          </div>
        </div>

        {/* Active Incidents */}
        <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400 uppercase">
            <span>Active Incidents</span>
            <span className="text-amber-400 font-bold">2 ACTIVE</span>
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1">{incidents.length}</div>
          <div className="text-[10px] text-neutral-400 mt-1 truncate">Accident near J7 approach</div>
        </div>

        {/* Highest Risk Node */}
        <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400 uppercase">
            <span>Highest Risk Node</span>
            <span className="text-rose-400 font-bold">J7</span>
          </div>
          <div className="text-xl font-bold font-mono text-rose-400 mt-1">{criticalJunction.spillbackProbabilityPercent}%</div>
          <div className="text-[10px] text-neutral-400 mt-1">Spillback Hazard Rate</div>
        </div>

        {/* Cascade Events */}
        <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400 uppercase">
            <span>Predicted Events</span>
            <span className="text-cyan-400 font-bold">4 CHAINED</span>
          </div>
          <div className="text-xl font-bold font-mono text-cyan-300 mt-1">J7 → J6 → J8</div>
          <div className="text-[10px] text-neutral-400 mt-1">DAG Propagation Path</div>
        </div>

        {/* Emergency Corridor */}
        <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400 uppercase">
            <span>Emergency Corridor</span>
            <span className="text-sky-400 font-bold">ACTIVE</span>
          </div>
          <div className="text-lg font-bold font-mono text-sky-300 mt-1">Ambulance #409</div>
          <div className="text-[10px] text-neutral-400 mt-1 truncate">J4 → J5 → J7 → Hospital</div>
        </div>

        {/* Digital Twin */}
        <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400 uppercase">
            <span>SUMO Twin Status</span>
            <span className="text-emerald-400 font-bold">READY</span>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">CALIBRATED</div>
          <div className="text-[10px] text-neutral-400 mt-1">Counterfactual Engine</div>
        </div>
      </div>

      {/* Main Map & Intelligence Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Interactive Map (2 Cols) */}
        <div className="lg:col-span-2 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Corridor Network Topology & Spatial Queue Flow
              </h3>
            </div>
            <span className="text-xs font-mono text-neutral-400">Click any node or link to inspect</span>
          </div>

          <InteractiveMap
            junctions={junctions}
            segments={segments}
            incidents={incidents}
            onSelectJunction={onSelectJunction}
            onSelectSegment={onSelectSegment}
            selectedJunctionCode={selectedJunctionCode}
            selectedSegmentId={selectedSegmentId}
            showEmergencyCorridor={true}
            showCascadePropagation={true}
            interactiveMode="ADMIN"
            className="h-[480px]"
          />
        </div>

        {/* Right Intelligence Panel */}
        <div className="space-y-4">
          {/* Situation Card */}
          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <span className="text-xs font-mono font-bold text-neutral-300 uppercase">
                SITUATION ASSESSMENT
              </span>
              <span className="text-[10px] font-mono text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                PROBABILISTIC FORECAST
              </span>
            </div>

            <div className="space-y-2 text-xs text-neutral-300">
              <div className="flex justify-between py-1 border-b border-neutral-800/60">
                <span className="text-neutral-400">Critical Hotspot:</span>
                <span className="font-bold text-white font-mono">Junction J7 (Central Plaza)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800/60">
                <span className="text-neutral-400">Primary Incident:</span>
                <span className="font-bold text-rose-400">Accident on Spine (seg-5-7)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800/60">
                <span className="text-neutral-400">Current Queue:</span>
                <span className="font-bold text-yellow-400 font-mono">280m / 300m max</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800/60">
                <span className="text-neutral-400">Spillback Probability:</span>
                <span className="font-bold text-rose-400 font-mono">72% (within 3.8 min)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800/60">
                <span className="text-neutral-400">Downstream Impact:</span>
                <span className="font-bold text-orange-400 font-mono">J6 Blocking (64%)</span>
              </div>
            </div>

            {/* Quick Action Decision Launcher */}
            <div className="pt-2">
              <button
                onClick={() => onNavigate('what-if')}
                className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-cyan-950"
              >
                <span>Evaluate Scenarios (A, B, A+B)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Active Incidents Quick Card */}
          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-neutral-300 uppercase">
                Active Incidents
              </span>
              <button
                onClick={() => onNavigate('incidents')}
                className="text-[11px] text-cyan-400 hover:underline"
              >
                View all ({incidents.length}) →
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {incidents.map((inc) => (
                <div
                  key={inc.id}
                  className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="font-bold text-rose-400">{inc.type}</span>
                    <span className="text-neutral-400">{inc.startTime}</span>
                  </div>
                  <div className="text-neutral-200 font-medium mt-0.5">{inc.locationName}</div>
                  <div className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">{inc.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
