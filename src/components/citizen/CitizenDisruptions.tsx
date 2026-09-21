import React from 'react';
import { AlertTriangle, Clock, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';

interface CitizenDisruptionsProps {
  onSelectRouteB?: () => void;
}

export const CitizenDisruptions: React.FC<CitizenDisruptionsProps> = ({ onSelectRouteB }) => {
  const alerts = [
    {
      id: 'DISR-01',
      title: 'Spillback at Central Plaza (J7)',
      horizon: 'In ~4 minutes',
      severity: 'HIGH IMPACT',
      impact: 'Delay will surge from +2 min to +10 min on Route A (Grand Trunk Spine).',
      advice: 'Switch to Route B (Eastern Outer Bypass) to bypass Central Plaza completely.',
      roads: ['Grand Trunk Road', 'Central Plaza Apex']
    },
    {
      id: 'DISR-02',
      title: 'Harbor Link Downstream Queuing (J6)',
      horizon: 'In ~7 minutes',
      severity: 'MODERATE IMPACT',
      impact: 'Merge lane slowdown will delay inbound harbor traffic by ~4 minutes.',
      advice: 'Harbor corridor commuters should exit toward Metro West at Junction 5.',
      roads: ['Harbor Link Arterial']
    },
    {
      id: 'DISR-03',
      title: 'Emergency Medical Corridor Active',
      horizon: 'Current / Ongoing',
      severity: 'PRIORITY ADVISORY',
      impact: 'Traffic signals on J4 → J5 → J7 → Hospital prioritizing emergency vehicles.',
      advice: 'Yield right of way and maintain clear intersections when sirens approach.',
      roads: ['Hospital Link Corridor']
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-amber-950 border border-amber-800 text-amber-300">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-extrabold text-white tracking-tight">PREDICTED COMMUTER DISRUPTIONS</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700 font-bold">
              EARLY WARNING SYSTEM
            </span>
          </div>
          <p className="text-xs text-neutral-300 mt-1">
            Advance notice of upcoming traffic disruptions before they manifest as bumper-to-bumper standstill.
          </p>
        </div>
      </div>

      {/* Disruption Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3.5 shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2 font-mono text-[10px]">
                  <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-200 border border-amber-800 font-bold">
                    {alert.id}
                  </span>
                  <span className="text-neutral-400">{alert.horizon}</span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">{alert.title}</h3>
              </div>

              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                alert.severity.includes('HIGH')
                  ? 'bg-rose-950 text-rose-300 border-rose-800'
                  : 'bg-yellow-950 text-yellow-300 border-yellow-800'
              }`}>
                {alert.severity}
              </span>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              <strong>Expected Impact:</strong> {alert.impact}
            </p>

            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-emerald-300 font-medium">
              💡 <strong>AURA Recommendation:</strong> {alert.advice}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-neutral-800 text-xs">
              <div className="text-[10px] font-mono text-neutral-400">
                Affects: {alert.roads.join(', ')}
              </div>

              {onSelectRouteB && (
                <button
                  onClick={onSelectRouteB}
                  className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center space-x-1"
                >
                  <span>Switch to Route B</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
