import React from 'react';
import { TrafficIncident } from '../../types/traffic';
import { AlertTriangle, Clock, ShieldAlert, ArrowRight, Video, FileText } from 'lucide-react';

interface AdminIncidentCenterProps {
  incidents: TrafficIncident[];
  onOpenWhatIf: () => void;
}

export const AdminIncidentCenter: React.FC<AdminIncidentCenterProps> = ({
  incidents,
  onOpenWhatIf
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
            <h1 className="text-xl font-extrabold text-white tracking-tight">INCIDENT MANAGEMENT CENTER</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
              {incidents.length} ACTIVE INCIDENTS
            </span>
          </div>
          <p className="text-xs text-neutral-300 mt-1">
            Real-time incident feed ingested via municipal CCTV analytics and sensor feeds, paired with downstream cascade projections.
          </p>
        </div>

        <button
          onClick={onOpenWhatIf}
          className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-md"
        >
          <span>Evaluate Interventions</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Incident List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {incidents.map((inc) => (
          <div
            key={inc.id}
            className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3.5 shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2 font-mono text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                    {inc.type}
                  </span>
                  <span className="text-neutral-400">ID: {inc.id}</span>
                  <span className="text-emerald-400 font-bold">LIVE CCTV VERIFIED</span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">{inc.locationName}</h3>
              </div>

              <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${
                inc.severity === 'HIGH' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-yellow-950 text-yellow-300 border border-yellow-800'
              }`}>
                {inc.severity} SEVERITY
              </span>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              {inc.description}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
              <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800">
                <div className="text-[10px] text-neutral-400">START TIME / DURATION</div>
                <div className="font-bold text-white mt-0.5">{inc.startTime} (~{inc.expectedDurationMinutes}m remaining)</div>
              </div>

              <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800">
                <div className="text-[10px] text-neutral-400">DOWNSTREAM CASCADE</div>
                <div className="font-bold text-rose-400 mt-0.5">
                  {inc.downstreamImpactNodes.join(' → ')}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pt-2 border-t border-neutral-800">
              <span className="flex items-center space-x-1">
                <Video className="w-3.5 h-3.5 text-cyan-400" />
                <span>Source: {inc.source}</span>
              </span>
              <span className="text-emerald-400 font-semibold">Confidence: {inc.confidencePercent}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
