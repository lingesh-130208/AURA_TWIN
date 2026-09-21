import React, { useState } from 'react';
import { Siren, ShieldAlert, CheckCircle2, AlertTriangle, Clock, Activity, ArrowRight } from 'lucide-react';

export const AdminEmergencyMode: React.FC = () => {
  const [corridorActive, setCorridorActive] = useState(true);
  const [greenWaveStatus, setGreenWaveStatus] = useState<'DEPLOYED' | 'CLEARING' | 'OPTIMAL'>('DEPLOYED');

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-sky-950/80 via-neutral-900 to-neutral-900 border border-sky-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-sky-900 border border-sky-700 text-sky-300">
              <Siren className="w-5 h-5 animate-pulse" />
            </span>
            <h1 className="text-xl font-extrabold text-white tracking-tight">EMERGENCY CORRIDOR CONTROL</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 font-bold">
              AMBULANCE PRIORITY CORRIDOR
            </span>
          </div>
          <p className="text-xs text-neutral-300 mt-1">
            Coordinated priority signal pre-emption and preemptive queue flushing for critical medical transport.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCorridorActive(!corridorActive)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
              corridorActive
                ? 'bg-rose-950 text-rose-300 border-rose-800 hover:bg-rose-900'
                : 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500'
            }`}
          >
            {corridorActive ? 'Deactivate Priority Wave' : 'Activate Priority Wave'}
          </button>
        </div>
      </div>

      {/* Corridor Live Status Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div>
              <div className="text-xs font-mono text-sky-400 font-bold uppercase">Corridor Routing Track</div>
              <h2 className="text-lg font-bold text-white mt-0.5">
                J4 (Metro West) → J5 (Grand Trunk) → J7 (Plaza) → J9 (Hospital Apex)
              </h2>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-sky-950 text-sky-300 border border-sky-800 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
              <span>GREEN WAVE ACTIVE</span>
            </span>
          </div>

          <div className="space-y-3">
            {[
              { node: 'J4 — Metro West Station', status: 'CLEARED', eta: 'En Route (Passed)', note: 'Signal green phase held for 30s. Corridor clear.' },
              { node: 'J5 — Grand Trunk Junction', status: 'ACTIVE GREEN', eta: '1.2 min away', note: 'Priority preemption triggered. Cross-traffic held.' },
              { node: 'J7 — Central Plaza Apex', status: 'CRITICAL CHOKE', eta: '2.8 min away', note: 'Accident in right lane requires Scenario A green flush to prevent 4-minute delay.' },
              { node: 'J9 — City General Hospital', status: 'READY', eta: '4.5 min to arrival', note: 'Emergency bay entry lights pre-set.' },
            ].map((step, idx) => (
              <div key={step.node} className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex items-start justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-white font-mono flex items-center space-x-2">
                    <span className="text-neutral-500 font-normal">#{idx + 1}</span>
                    <span>{step.node}</span>
                  </div>
                  <div className="text-neutral-400 text-[11px]">{step.note}</div>
                </div>
                <div className="text-right font-mono shrink-0 ml-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    step.status === 'CRITICAL CHOKE' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}>
                    {step.status}
                  </span>
                  <div className="text-[10px] text-neutral-400 mt-1">{step.eta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Guardrails Panel */}
        <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
          <div className="text-xs font-mono font-bold text-neutral-300 uppercase pb-2 border-b border-neutral-800">
            SAFETY & INTERACTION SPECIFICATION
          </div>

          <div className="space-y-3 text-xs text-neutral-300">
            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 space-y-1">
              <div className="font-bold text-rose-400 font-mono">Predicted Blockage Point:</div>
              <p className="text-[11px] text-neutral-300">
                Without operator intervention at J7, queue spillback will delay Ambulance #409 by an estimated 6.2 minutes.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 space-y-1">
              <div className="font-bold text-cyan-400 font-mono">Simulated Clearance Gain:</div>
              <p className="text-[11px] text-neutral-300">
                Deploying Scenario A+B flushes the J7 queue, reducing emergency transit time from 10.4m to 4.8m.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 space-y-1">
              <div className="font-bold text-amber-400 font-mono">Simulation Disclaimer:</div>
              <p className="text-[10px] text-neutral-400">
                Per Section 24 of specifications: Does not claim direct physical actuator control of physical traffic lights. Interventions reflect digital twin simulation models.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
