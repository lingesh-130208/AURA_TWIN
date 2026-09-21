import React, { useState } from 'react';
import { Clock, AlertTriangle, ArrowRight, ShieldCheck, Activity, CheckCircle2 } from 'lucide-react';

export const AdminForecastTimeline: React.FC = () => {
  const [selectedHorizon, setSelectedHorizon] = useState<string>('+5m');

  const timelineSteps = [
    {
      time: 'NOW',
      title: 'Queue Accumulation',
      junction: 'J7 Apex Link',
      probability: '100% (OBSERVED)',
      severity: 'HIGH',
      description: 'Accident blockage reduces flow; queue reaches 280m on Grand Trunk direct spine approach link.',
      activeSegments: ['seg-5-7']
    },
    {
      time: '+3m',
      title: 'Hazard Threshold Exceeded',
      junction: 'Junction J7',
      probability: '72% (PREDICTED)',
      severity: 'CRITICAL',
      description: 'Spillback probability reaches peak. Approaching vehicles begin blocking junction intersection boundary.',
      activeSegments: ['seg-5-7', 'seg-6-7']
    },
    {
      time: '+5m',
      title: 'J7 Spillback Onset',
      junction: 'J7 & Harbor Merge',
      probability: '84% (PREDICTED)',
      severity: 'CRITICAL',
      description: 'Full intersection tailback lockout occurs. Eastbound clearance speed drops below 10 km/h.',
      activeSegments: ['seg-5-7', 'seg-6-7', 'seg-7-8']
    },
    {
      time: '+7m',
      title: 'J6 Downstream Blocking',
      junction: 'Junction J6',
      probability: '64% (PREDICTED)',
      severity: 'HIGH',
      description: 'Harbor link approach unable to discharge into J7; queues rapidly build backwards toward J5.',
      activeSegments: ['seg-5-6', 'seg-6-7']
    },
    {
      time: '+10m',
      title: 'J8 Diversion Overload',
      junction: 'Junction J8',
      probability: '53% (PREDICTED)',
      severity: 'HIGH',
      description: 'Diverting vehicles attempt Hospital north bypass, overwhelming secondary signals.',
      activeSegments: ['seg-7-8', 'seg-8-9']
    },
    {
      time: '+15m',
      title: 'Sector Gridlock / Persistent Lockout',
      junction: 'Entire Central Plaza Cluster',
      probability: '78% (UNMITIGATED)',
      severity: 'CRITICAL',
      description: 'Cascade solidifies unless flushed via Scenario A+B intervention. Corridors require 22m+ recovery.',
      activeSegments: ['seg-5-7', 'seg-6-7', 'seg-7-8', 'seg-8-9']
    }
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300">
              <Clock className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-extrabold text-white tracking-tight">FORECAST TIMELINE (15-MINUTE HORIZON)</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700 font-bold">
              SPATIOTEMPORAL TRANSFORMER
            </span>
          </div>
          <p className="text-xs text-neutral-300 mt-1">
            Temporal evolution of queue stress, hazard rates, and network breakdown points in 1-minute discrete inference steps.
          </p>
        </div>

        <div className="text-xs font-mono text-neutral-400 bg-neutral-950 px-3 py-1.5 rounded border border-neutral-800">
          Inference Latency: <strong className="text-emerald-400">38ms</strong> · Step Horizon: <strong className="text-cyan-300">+15m</strong>
        </div>
      </div>

      {/* Horizontal Horizon Scrubber */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {timelineSteps.map((step) => {
          const isSelected = selectedHorizon === step.time;
          return (
            <button
              key={step.time}
              onClick={() => setSelectedHorizon(step.time)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-neutral-900 border-cyan-500 ring-2 ring-cyan-500/40 shadow-lg'
                  : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-750'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className={`font-bold ${step.time === 'NOW' ? 'text-amber-400' : 'text-cyan-300'}`}>
                  {step.time}
                </span>
                <span className="text-[10px] text-rose-400 font-bold">{step.severity}</span>
              </div>
              <div className="text-xs font-bold text-white mt-1 truncate">{step.title}</div>
              <div className="text-[10px] text-neutral-400 mt-1 truncate font-mono">{step.junction}</div>
            </button>
          );
        })}
      </div>

      {/* Selected Step Detailed View */}
      {(() => {
        const current = timelineSteps.find(s => s.time === selectedHorizon) || timelineSteps[2];
        return (
          <div className="p-6 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-neutral-800 gap-2">
              <div>
                <div className="flex items-center space-x-2 font-mono text-xs">
                  <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                    PREDICTION HORIZON: {current.time}
                  </span>
                  <span className="text-neutral-400">·</span>
                  <span className="text-rose-400 font-bold">{current.probability}</span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1">{current.title}</h2>
                <div className="text-xs text-neutral-400 font-mono">Primary Focus: {current.junction}</div>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                current.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-orange-950 text-orange-300 border-orange-800'
              }`}>
                {current.severity} CASCADE THREAT
              </span>
            </div>

            <p className="text-sm text-neutral-200 leading-relaxed max-w-3xl">
              {current.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs font-mono">
              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 space-y-1.5">
                <div className="text-neutral-400 uppercase text-[10px]">Impacted Road Segments:</div>
                <div className="flex flex-wrap gap-1.5">
                  {current.activeSegments.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-cyan-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 space-y-1">
                <div className="text-neutral-400 uppercase text-[10px]">Recommended Operational Countermeasure:</div>
                <div className="text-emerald-400 font-bold">What-If Scenario A+B (Coordinated Green Flush & Bypass Diversion)</div>
                <div className="text-neutral-400 text-[11px]">Prevents propagation if initiated before the +3m window.</div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
