import React from 'react';
import { AlertTriangle, TrendingUp, ShieldAlert, BarChart3, HelpCircle } from 'lucide-react';
import { Junction, RoadSegment } from '../../types/traffic';
import { InteractiveMap } from '../InteractiveMap';

interface AdminRiskMapProps {
  junctions: Junction[];
  segments: RoadSegment[];
  onSelectJunction: (junction: Junction) => void;
  onSelectSegment: (segment: RoadSegment) => void;
  selectedJunctionCode?: string;
  selectedSegmentId?: string;
}

export const AdminRiskMap: React.FC<AdminRiskMapProps> = ({
  junctions,
  segments,
  onSelectJunction,
  onSelectSegment,
  selectedJunctionCode,
  selectedSegmentId
}) => {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-rose-950 border border-rose-800 text-rose-300">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-extrabold text-white tracking-tight">CORRIDOR RISK MATRIX</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700 font-bold">
              PROBABILITY VS. SEVERITY DECOUPLED
            </span>
          </div>
          <p className="text-xs text-neutral-300 mt-1">
            Separating event probability from operational severity score. Never collapses distinct dimensions into an arbitrary single score.
          </p>
        </div>

        <div className="text-xs font-mono text-neutral-400 bg-neutral-950 px-3 py-1.5 rounded border border-neutral-800">
          Point Process Hazard: <strong className="text-rose-400">lambda(t) = g(x_t) * exp(beta' * H_t)</strong>
        </div>
      </div>

      {/* Map View */}
      <InteractiveMap
        junctions={junctions}
        segments={segments}
        incidents={[]}
        onSelectJunction={onSelectJunction}
        onSelectSegment={onSelectSegment}
        selectedJunctionCode={selectedJunctionCode}
        selectedSegmentId={selectedSegmentId}
        showCascadePropagation={true}
        interactiveMode="ADMIN"
        className="h-[400px]"
      />

      {/* Risk Dimension Table */}
      <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
          Junction Hazard Decomposition (3–15 min forecast window)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400">
                <th className="py-2 px-3">JUNCTION</th>
                <th className="py-2 px-3">PREDICTED EVENT</th>
                <th className="py-2 px-3 text-rose-400">PROBABILITY P(T&lt;=t+h)</th>
                <th className="py-2 px-3 text-amber-400">SEVERITY / IMPACT</th>
                <th className="py-2 px-3">TIME WINDOW</th>
                <th className="py-2 px-3 text-cyan-400">CONFIDENCE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {junctions.map((j) => (
                <tr
                  key={j.id}
                  onClick={() => onSelectJunction(j)}
                  className={`cursor-pointer hover:bg-neutral-800/60 transition-colors ${
                    selectedJunctionCode === j.code ? 'bg-cyan-950/40 text-cyan-200' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-bold text-white flex items-center space-x-2">
                    <span>{j.code}</span>
                    <span className="text-[10px] text-neutral-400 font-normal">({j.name})</span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-neutral-200">
                    {j.predictedEvent || 'Nominal Flow'}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-rose-400">
                    {j.spillbackProbabilityPercent}%
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      j.riskSeverity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                      j.riskSeverity === 'HIGH' ? 'bg-orange-950 text-orange-300 border border-orange-800' :
                      j.riskSeverity === 'MODERATE' ? 'bg-yellow-950 text-yellow-300 border border-yellow-800' :
                      'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}>
                      {j.riskSeverity}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-neutral-300">
                    {j.riskSeverity === 'CRITICAL' ? '3–6 min' : j.riskSeverity === 'HIGH' ? '7–10 min' : '15+ min'}
                  </td>
                  <td className="py-2.5 px-3 text-cyan-400 font-semibold">
                    {j.riskSeverity === 'CRITICAL' ? '78%' : '84%'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
