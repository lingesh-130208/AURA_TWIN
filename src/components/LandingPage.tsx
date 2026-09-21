import React from 'react';
import {
  ShieldAlert,
  Compass,
  ArrowRight,
  Activity,
  GitBranch,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Database,
  Cpu
} from 'lucide-react';

interface LandingPageProps {
  onSelectRoleLogin?: (role: 'ADMIN' | 'USER') => void;
  onSelectRole?: (role: 'ADMIN' | 'USER') => void;
  onExploreDemo?: () => void;
  onQuickLogin?: (role: 'ADMIN' | 'USER') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSelectRoleLogin,
  onSelectRole,
  onExploreDemo,
  onQuickLogin
}) => {
  const handleSelectRole = (role: 'ADMIN' | 'USER') => {
    if (onSelectRole) onSelectRole(role);
    else if (onSelectRoleLogin) onSelectRoleLogin(role);
  };
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-neutral-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370f_1px,transparent_1px),linear-gradient(to_bottom,#1f29370f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="text-center space-y-5 relative z-10 max-w-4xl mx-auto">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 text-xs font-mono font-semibold">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>AURA-TWIN MOBILITY PLATFORM // RESEARCH & DEPLOYMENT</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Predict traffic failure <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
              before the network fails.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-neutral-300 max-w-3xl mx-auto font-normal leading-relaxed">
            Real-Time AI Decision Intelligence for Preventing Traffic Gridlock.
            Conditioned probabilistic forecasting that detects spillbacks minutes before queue onset, simulates counterfactual interventions, and protects public commuters.
          </p>

          <div className="text-xs font-mono text-neutral-400 max-w-2xl mx-auto pt-1 pb-3">
            Research: <span className="text-neutral-200">Intervention-Conditioned Probabilistic Traffic Cascade Forecasting</span> · SUMO Digital Twin · Graph Spatiotemporal Transformers
          </div>

          {/* Direct Role CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              id="cta-admin-login"
              onClick={() => handleSelectRole('ADMIN')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-gradient-to-r from-rose-700 to-red-800 hover:from-rose-600 hover:to-red-700 text-white font-semibold text-sm shadow-lg shadow-rose-950/50 flex items-center justify-center space-x-2 transition-all border border-rose-600/40"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>AURA COMMAND (TRAFFIC CONTROL)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="cta-citizen-login"
              onClick={() => handleSelectRole('USER')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-950/50 flex items-center justify-center space-x-2 transition-all border border-cyan-500/40"
            >
              <Compass className="w-4 h-4" />
              <span>AURA CITIZEN (PUBLIC MOBILITY)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="cta-explore-demo"
              onClick={onExploreDemo}
              className="w-full sm:w-auto px-5 py-3.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 font-semibold text-sm border border-neutral-750 flex items-center justify-center space-x-2 transition-all"
            >
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>EXPLORE DEMO CORRIDOR</span>
            </button>
          </div>
        </div>
      </section>

      {/* Two Applications Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            One Unified Intelligence Engine. Two Specialized Experiences.
          </h2>
          <p className="text-neutral-400 text-sm mt-2 max-w-2xl mx-auto">
            Authorized operators intervene to flush network bottlenecks; citizens navigate with foresight, avoiding cascading risk corridors before congestion strikes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: AURA COMMAND */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 sm:p-8 flex flex-col justify-between hover:border-neutral-700 transition-colors shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-mono text-rose-400 uppercase tracking-wide">ROLE 1 // RESTRICTED ACCESS</div>
                  <h3 className="text-xl font-bold text-white">AURA COMMAND</h3>
                </div>
              </div>

              <p className="text-neutral-300 text-sm leading-relaxed">
                Mission-critical control room interface for municipal traffic authorities and road corridor operations centers.
              </p>

              <div className="space-y-2 pt-2 text-xs text-neutral-300">
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span><strong>Spillback Hazard Forecasting:</strong> Predicts breakdown probabilities at critical bottlenecks (e.g. J7 Plaza Apex) 3–15 minutes ahead.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span><strong>Point Process Cascade Explorer:</strong> Traces propagation DAGs from root incidents to downstream blockers.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span><strong>What-If Decision Center:</strong> Evaluates counterfactual interventions (Baseline vs. Signal Extension vs. Diversion vs. Combined).</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span><strong>Human-in-the-Loop Safeguards:</strong> Mandates explicit operator ACCEPT / MODIFY / REJECT before applying mitigation policies.</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-neutral-800/80 mt-6 flex items-center justify-between">
              <div className="text-[11px] font-mono text-neutral-400">
                Demo Auth: <span className="text-neutral-200 font-semibold">admin / 12345678</span>
              </div>
              <button
                onClick={() => handleSelectRole('ADMIN')}
                className="px-4 py-2 rounded-md bg-rose-900/60 hover:bg-rose-800/80 text-rose-200 border border-rose-700/60 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <span>Launch Command</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: AURA CITIZEN */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 sm:p-8 flex flex-col justify-between hover:border-neutral-700 transition-colors shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-300">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-mono text-cyan-400 uppercase tracking-wide">ROLE 2 // PUBLIC MOBILITY</div>
                  <h3 className="text-xl font-bold text-white">AURA CITIZEN</h3>
                </div>
              </div>

              <p className="text-neutral-300 text-sm leading-relaxed">
                Driver and commuter web navigation application providing future-risk-aware route selection and predicted disruption warnings.
              </p>

              <div className="space-y-2 pt-2 text-xs text-neutral-300">
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>Gridlock Risk Metric:</strong> Calibrated probability that severe network deterioration will impact a route during travel.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>Trade-off Aware Routing:</strong> Transparent comparison of fastest route vs. lower-future-risk alternatives with clear trade-offs.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>Preemptive Disruption Alerts:</strong> Advance warnings for upcoming bottleneck cascades before drivers enter queues.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>Emergency Corridor Clearances:</strong> Live notifications when priority emergency corridors (e.g. Hospital green waves) are active.</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-neutral-800/80 mt-6 flex items-center justify-between">
              <div className="text-[11px] font-mono text-neutral-400">
                Public Access: <span className="text-neutral-200 font-semibold">citizen / user123</span>
              </div>
              <button
                onClick={() => handleSelectRole('USER')}
                className="px-4 py-2 rounded-md bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 border border-cyan-800/70 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <span>Launch Citizen</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Decision Intelligence Flow */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-neutral-850">
        <div className="text-center mb-8">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider">System Architecture</div>
          <h2 className="text-2xl font-bold text-white mt-1">The 9-Stage Decision Intelligence Loop</h2>
          <p className="text-neutral-400 text-xs max-w-xl mx-auto mt-1">
            How AURA-TWIN transitions from raw telemetry to intervention-conditioned counterfactual outcomes.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2 font-mono text-center">
          {[
            { step: '01', title: 'OBSERVE', desc: 'TomTom & Sensors' },
            { step: '02', title: 'RECONSTRUCT', desc: 'Flow & Density' },
            { step: '03', title: 'PREDICT', desc: 'Graph Transformer' },
            { step: '04', title: 'DETECT', desc: 'Hazard Threshold' },
            { step: '05', title: 'PROPAGATE', desc: 'Cascade DAG' },
            { step: '06', title: 'SIMULATE', desc: 'SUMO Twin Sandbox' },
            { step: '07', title: 'COMPARE', desc: 'Baseline vs A/B' },
            { step: '08', title: 'DECIDE', desc: 'Human Approval' },
            { step: '09', title: 'MONITOR', desc: 'Outcome Validation' },
          ].map((item, index) => (
            <div key={item.step} className="p-3 rounded-lg bg-neutral-900/50 border border-neutral-800 flex flex-col justify-between">
              <div className="text-[10px] text-cyan-400 font-bold">{item.step}</div>
              <div className="text-xs font-bold text-neutral-100 my-1">{item.title}</div>
              <div className="text-[10px] text-neutral-400">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust & Scientific Honesty Statement */}
      <footer className="mt-auto border-t border-neutral-850 py-8 px-4 text-center text-xs text-neutral-400 space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono">
          <span className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>DATA PROVENANCE: OBSERVED vs. ESTIMATED vs. PREDICTED vs. SIMULATED</span>
          </span>
          <span>·</span>
          <span>SUMO MICRO-SIMULATION RUNNER</span>
          <span>·</span>
          <span>GEMINI EXPLAINABILITY COPILOT</span>
        </div>
        <p className="max-w-2xl mx-auto text-neutral-500 text-[11px]">
          AURA-TWIN enforces strict technical transparency. Predictions are presented with calibrated uncertainty intervals.
          Simulations are explicitly differentiated from live sensor observations. Operational interventions require verified human authorization.
        </p>
      </footer>
    </div>
  );
};
