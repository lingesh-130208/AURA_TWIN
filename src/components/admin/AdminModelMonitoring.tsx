import React from 'react';
import { Cpu, CheckCircle2, Award, Activity, Database, GitCommit, FileCode } from 'lucide-react';

export const AdminModelMonitoring: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-purple-950 border border-purple-800 text-purple-300">
              <Cpu className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-extrabold text-white tracking-tight">MODEL MONITORING & CALIBRATION</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700 font-bold">
              SPATIOTEMPORAL GRAPH TRANSFORMER
            </span>
          </div>
          <p className="text-xs text-neutral-300 mt-1">
            Production calibration and physics-informed loss tracking for AURA's dual Graph + Point-Process hazard model.
          </p>
        </div>

        <div className="text-xs font-mono text-neutral-400 bg-neutral-950 px-3 py-1.5 rounded border border-neutral-800">
          Model Version: <strong className="text-purple-300">v3.4-prod-spatiotemporal</strong>
        </div>
      </div>

      {/* Model KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
        <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="text-[10px] text-neutral-400">STATE MAE</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">3.4 km/h</div>
          <div className="text-[10px] text-neutral-400 mt-1">Target: &lt;5 km/h</div>
        </div>

        <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="text-[10px] text-neutral-400">EVENT F1 SCORE</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">0.88</div>
          <div className="text-[10px] text-neutral-400 mt-1">Spillback Detection</div>
        </div>

        <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="text-[10px] text-neutral-400">TIMING ERROR</div>
          <div className="text-xl font-bold text-cyan-400 mt-1">42 sec</div>
          <div className="text-[10px] text-neutral-400 mt-1">Mean Arrival Error</div>
        </div>

        <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="text-[10px] text-neutral-400">BRIER SCORE</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">0.11</div>
          <div className="text-[10px] text-neutral-400 mt-1">Calibration Metric</div>
        </div>

        <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="text-[10px] text-neutral-400">CASCADE ACCURACY</div>
          <div className="text-xl font-bold text-cyan-400 mt-1">84%</div>
          <div className="text-[10px] text-neutral-400 mt-1">DAG Topology Match</div>
        </div>

        <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="text-[10px] text-neutral-400">PHYSICS VIOLATIONS</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">0.00%</div>
          <div className="text-[10px] text-neutral-400 mt-1">Conservation Law</div>
        </div>
      </div>

      {/* Model Architecture & Formulation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: 3-Tier Architecture Description */}
        <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3.5 text-xs">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>Multi-Tier Model Architecture</span>
          </h3>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
              <div className="font-bold text-cyan-300 font-mono">1. Spatial Graph Attention Network (GAT / Graph Transformer)</div>
              <p className="text-neutral-300 text-[11px] mt-1">
                Encodes arterial roadway topology, intersection connectivity, turning pocket capacities, and link-to-link transmission impedances across J1–J10.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
              <div className="font-bold text-purple-300 font-mono">2. Temporal Multi-Head Transformer</div>
              <p className="text-neutral-300 text-[11px] mt-1">
                Captures sequential dynamics, historical queue growth rates, signal phase cycles, and shockwave propagation across sliding 15-minute observation windows.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
              <div className="font-bold text-rose-300 font-mono">3. Point-Process Hazard Rate Head</div>
              <p className="text-neutral-300 text-[11px] mt-1">
                Computes survival analysis hazard rates for discrete failure events: <code className="text-rose-400">lambda_k(t) = h_0(t) * exp(W * z_t)</code> for spillback, downstream blocking, and gridlock.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Physics Loss & Training Partition */}
        <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3.5 text-xs font-mono">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Dataset Partition & Loss Formulation</span>
          </h3>

          <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 space-y-2">
            <div className="text-neutral-400 text-[10px] uppercase">Composite Objective Function:</div>
            <div className="p-2 rounded bg-neutral-900 text-cyan-300 text-[11px] font-bold">
              L = L_state(MSE) + 0.4*L_hazard(NLL) + 0.3*L_physics + 0.2*L_cascade(BCE)
            </div>
            <p className="text-[11px] text-neutral-400">
              <strong>Physics-Informed Constraint:</strong> Enforces hydrodynamic conservation of vehicles (<code className="text-neutral-200">dq/dx + drho/dt = 0</code>), completely suppressing unphysical phantom vehicle generation.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 space-y-2">
            <div className="text-neutral-400 text-[10px] uppercase">Data Partition Split:</div>
            <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                <div className="font-bold text-white">60%</div>
                <div className="text-neutral-400">Real Municipal Sensors</div>
              </div>
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                <div className="font-bold text-white">25%</div>
                <div className="text-neutral-400">Calibrated SUMO Sims</div>
              </div>
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                <div className="font-bold text-cyan-400">15%</div>
                <div className="text-neutral-400">Held-Out Test Corridor</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
