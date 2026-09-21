import React, { useState } from 'react';
import {
  Sliders,
  CheckCircle2,
  AlertOctagon,
  ShieldCheck,
  TrendingDown,
  Info,
  GitBranch,
  Edit3,
  XCircle,
  HelpCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { ScenarioResult, InterventionType } from '../../types/traffic';
import { trafficStateService } from '../../services/trafficStateService';

interface AdminWhatIfCenterProps {
  onNavigate: (view: string) => void;
  onOpenCopilot?: () => void;
}

export const AdminWhatIfCenter: React.FC<AdminWhatIfCenterProps> = ({
  onNavigate,
  onOpenCopilot
}) => {
  const [scenarios, setScenarios] = useState<ScenarioResult[]>(trafficStateService.getScenarios());
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('scen-ab');
  const [activeIntervention, setActiveIntervention] = useState<string | null>(trafficStateService.getActiveIntervention());

  // Challenge mode: "DON'T TRUST ME"
  const [showDontTrustMe, setShowDontTrustMe] = useState(false);

  // Modify modal
  const [isModifying, setIsModifying] = useState(false);
  const [modifyExtension, setModifyExtension] = useState(20);
  const [modifyDiversion, setModifyDiversion] = useState(30);

  // Action status notification
  const [feedbackBanner, setFeedbackBanner] = useState<{ type: 'success' | 'danger' | 'info'; text: string } | null>(null);

  const selectedScenario = scenarios.find(s => s.scenarioId === selectedScenarioId) || scenarios[3];

  const handleAccept = () => {
    const res = trafficStateService.acceptIntervention(selectedScenarioId, 'admin');
    if (res.success) {
      setActiveIntervention(selectedScenarioId);
      setFeedbackBanner({
        type: 'success',
        text: `Human Operator Approved: ${selectedScenario.name} has been deployed to the Digital Twin. Network state recalculated and Citizen route alerts broadcasted.`
      });
      setScenarios(trafficStateService.getScenarios());
    }
  };

  const handleReject = () => {
    trafficStateService.rejectIntervention(selectedScenarioId, 'admin', 'Operator preferred current baseline over simulated secondary risks.');
    setActiveIntervention(null);
    setFeedbackBanner({
      type: 'danger',
      text: `Intervention Rejected: Scenario ${selectedScenario.name} was dismissed. Baseline corridor state maintained.`
    });
  };

  const handleModifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = trafficStateService.modifyIntervention(
      selectedScenarioId,
      { greenExtensionSeconds: modifyExtension, diversionFraction: modifyDiversion },
      'admin'
    );
    if (res.success) {
      setScenarios(trafficStateService.getScenarios());
      setSelectedScenarioId(res.newScenario.scenarioId);
      setIsModifying(false);
      setFeedbackBanner({
        type: 'info',
        text: `New Counterfactual Scenario Created: Calibrated with ${modifyExtension}s green extension and ${modifyDiversion}% perimeter diversion.`
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300">
              <Sliders className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-extrabold text-white tracking-tight">WHAT-IF DECISION CENTER</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
              COUNTERFACTUAL SIMULATION
            </span>
          </div>
          <p className="text-xs text-neutral-300 mt-1">
            "Explore intervention-conditioned future traffic states before making an operational decision."
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          {/* Challenge Button */}
          <button
            id="btn-dont-trust-me"
            onClick={() => setShowDontTrustMe(!showDontTrustMe)}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all border flex items-center space-x-1.5 ${
              showDontTrustMe
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md'
                : 'bg-neutral-800 hover:bg-neutral-750 text-neutral-300 border-neutral-750'
            }`}
            title="Challenge AURA's AI recommendation and inspect worst-case edge cases"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>DON'T TRUST ME (CHALLENGE)</span>
          </button>

          {onOpenCopilot && (
            <button
              onClick={onOpenCopilot}
              className="px-3.5 py-2 rounded-lg bg-cyan-900/60 hover:bg-cyan-800/80 text-cyan-200 border border-cyan-700/60 text-xs font-semibold flex items-center space-x-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask Copilot</span>
            </button>
          )}
        </div>
      </div>

      {/* Action Notification Banner */}
      {feedbackBanner && (
        <div className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
          feedbackBanner.type === 'success'
            ? 'bg-emerald-950/70 border-emerald-800 text-emerald-200'
            : feedbackBanner.type === 'danger'
            ? 'bg-rose-950/70 border-rose-800 text-rose-200'
            : 'bg-cyan-950/70 border-cyan-800 text-cyan-200'
        }`}>
          <div className="flex items-center space-x-2">
            {feedbackBanner.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertOctagon className="w-4 h-4 text-rose-400" />}
            <span className="font-mono">{feedbackBanner.text}</span>
          </div>
          <button onClick={() => setFeedbackBanner(null)} className="text-neutral-400 hover:text-white text-sm ml-2">×</button>
        </div>
      )}

      {/* "DON'T TRUST ME" Challenge Panel (Section 27) */}
      {showDontTrustMe && (
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-700/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertOctagon className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-amber-200 uppercase font-mono tracking-wider">
                AURA Adversarial Challenge: "Don't Trust Me" Mode
              </h3>
            </div>
            <span className="text-[10px] font-mono text-amber-300 bg-amber-900/60 px-2 py-0.5 rounded border border-amber-700">
              STRESS TESTING RECOMMENDATIONS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-neutral-900/90 border border-neutral-800">
              <div className="text-[10px] font-mono text-neutral-400 uppercase">AURA Recommendation</div>
              <div className="text-sm font-bold text-white mt-1">Scenario A+B (Coordinated)</div>
              <p className="text-[11px] text-neutral-300 mt-1">
                Extends J7 green phase by 15s while diverting 20% traffic at J3 & J5 to the Eastern Bypass.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-neutral-900/90 border border-neutral-800">
              <div className="text-[10px] font-mono text-amber-400 uppercase">Potential Operational Concern</div>
              <div className="text-sm font-bold text-amber-300 mt-1">Diversion Pressure on Hospital North (J8)</div>
              <p className="text-[11px] text-neutral-300 mt-1">
                Diverting 20%+ commuters shifts load to secondary arteries. 26% probability of secondary slowdown near Hospital corridor.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-neutral-900/90 border border-neutral-800">
              <div className="text-[10px] font-mono text-cyan-400 uppercase">Alternative Intervention</div>
              <div className="text-sm font-bold text-cyan-300 mt-1">Signal Only (Scenario A)</div>
              <p className="text-[11px] text-neutral-300 mt-1">
                Zero diversion pressure, but cascade duration is 2 minutes longer (8m vs 6m).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Scenario Selector Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {scenarios.map((scen) => {
          const isSelected = selectedScenarioId === scen.scenarioId;
          const isActive = activeIntervention === scen.scenarioId;

          return (
            <div
              key={scen.scenarioId}
              onClick={() => setSelectedScenarioId(scen.scenarioId)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-neutral-900 border-cyan-500 ring-1 ring-cyan-500/50 shadow-lg'
                  : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className={`font-bold px-1.5 py-0.5 rounded ${
                  scen.type === 'BASELINE' ? 'bg-rose-950 text-rose-300' : 'bg-cyan-950 text-cyan-300'
                }`}>
                  {scen.type}
                </span>
                {isActive && (
                  <span className="font-bold text-emerald-400 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>ACTIVE</span>
                  </span>
                )}
              </div>

              <h3 className="text-sm font-bold text-white mt-2 leading-snug">{scen.name}</h3>

              <div className="mt-3 grid grid-cols-2 gap-1 text-[11px] font-mono text-neutral-400">
                <div>Duration: <span className="text-white font-bold">{scen.cascadeDurationMinutes}m</span></div>
                <div>Recovery: <span className="text-white font-bold">{scen.recoveryTimeMinutes}m</span></div>
                <div>Delay: <span className={scen.travelTimeImpactPercent > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {scen.travelTimeImpactPercent > 0 ? `+${scen.travelTimeImpactPercent}%` : `${scen.travelTimeImpactPercent}%`}
                </span></div>
                <div>Nodes: <span className="text-white font-bold">{scen.affectedNodesCount}</span></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deep Counterfactual Comparison Matrix (Section 25) */}
      <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Counterfactual Scenario Comparison Matrix (SUMO Digital Twin)
            </h3>
            <p className="text-xs text-neutral-400">
              Evaluated from identical starting network state S0. All simulation results explicitly labeled SIMULATED.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
            SIMULATED // NOT LIVE SENSOR
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400">
                <th className="py-2.5 px-3">METRIC</th>
                <th className="py-2.5 px-3 text-rose-400">BASELINE (DO NOTHING)</th>
                <th className="py-2.5 px-3 text-yellow-400">SCENARIO A (SIGNAL)</th>
                <th className="py-2.5 px-3 text-cyan-400">SCENARIO B (DIVERSION)</th>
                <th className="py-2.5 px-3 text-emerald-400 font-bold">SCENARIO A+B (COMBINED)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              <tr>
                <td className="py-2.5 px-3 text-neutral-300 font-semibold">Affected Corridor Nodes</td>
                <td className="py-2.5 px-3 text-rose-300">6 Junctions</td>
                <td className="py-2.5 px-3 text-neutral-200">4 Junctions</td>
                <td className="py-2.5 px-3 text-neutral-200">5 Junctions</td>
                <td className="py-2.5 px-3 text-emerald-300 font-bold">3 Junctions</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-neutral-300 font-semibold">Cascade Duration</td>
                <td className="py-2.5 px-3 text-rose-300">14 minutes</td>
                <td className="py-2.5 px-3 text-neutral-200">8 minutes</td>
                <td className="py-2.5 px-3 text-neutral-200">10 minutes</td>
                <td className="py-2.5 px-3 text-emerald-300 font-bold">6 minutes</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-neutral-300 font-semibold">Max Severity Score</td>
                <td className="py-2.5 px-3 text-rose-300">0.86 (Critical)</td>
                <td className="py-2.5 px-3 text-neutral-200">0.64 (Moderate)</td>
                <td className="py-2.5 px-3 text-neutral-200">0.71 (High)</td>
                <td className="py-2.5 px-3 text-emerald-300 font-bold">0.52 (Controlled)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-neutral-300 font-semibold">Corridor Recovery Time</td>
                <td className="py-2.5 px-3 text-rose-300">22 minutes</td>
                <td className="py-2.5 px-3 text-neutral-200">11 minutes</td>
                <td className="py-2.5 px-3 text-neutral-200">14 minutes</td>
                <td className="py-2.5 px-3 text-emerald-300 font-bold">8 minutes</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-neutral-300 font-semibold">Travel-Time Impact</td>
                <td className="py-2.5 px-3 text-rose-300">+34% Delay</td>
                <td className="py-2.5 px-3 text-emerald-400">-18% Reduction</td>
                <td className="py-2.5 px-3 text-emerald-400">-12% Reduction</td>
                <td className="py-2.5 px-3 text-emerald-300 font-bold">-28% Reduction</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-neutral-300 font-semibold">Emergency Corridor Clearance</td>
                <td className="py-2.5 px-3 text-rose-400">Blocked (0.88 Risk)</td>
                <td className="py-2.5 px-3 text-yellow-400">Partial Clearance</td>
                <td className="py-2.5 px-3 text-yellow-400">Moderate Risk</td>
                <td className="py-2.5 px-3 text-emerald-300 font-bold">Protected (0.22 Risk)</td>
              </tr>
              {/* Secondary Effects Row (Section 26) */}
              <tr className="bg-neutral-950/60">
                <td className="py-3 px-3 text-amber-300 font-semibold align-top">
                  Prominent Secondary Effect
                  <div className="text-[10px] text-neutral-400 font-normal mt-0.5">Never hidden from operator</div>
                </td>
                <td className="py-3 px-3 text-neutral-300 text-[11px] align-top">
                  Uncontrolled network spillback to outer arterial grid.
                </td>
                <td className="py-3 px-3 text-neutral-300 text-[11px] align-top">
                  Buildup on secondary feeder streets (Civic Link).
                </td>
                <td className="py-3 px-3 text-amber-200 text-[11px] align-top">
                  Elevates traffic pressure on J8 (49% probability).
                </td>
                <td className="py-3 px-3 text-emerald-200 text-[11px] align-top">
                  Minor +3% travel time for diverted commuters on Eastern loop.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision Controls: ACCEPT / MODIFY / REJECT (Section 28) */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-750 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-neutral-800">
          <div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-rose-400" />
              <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wide">
                OPERATIONAL SAFEGUARD PROTOCOL
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-0.5">
              Human Operator Authorization Required
            </h3>
            <p className="text-xs text-neutral-300">
              Selected: <strong className="text-cyan-300">{selectedScenario.name}</strong>. AURA does not execute real-world signal changes or diversions autonomously.
            </p>
          </div>

          <div className="text-xs font-mono text-neutral-400 bg-neutral-950 px-3 py-1.5 rounded border border-neutral-800">
            Current Status: <strong className={activeIntervention ? 'text-emerald-400' : 'text-neutral-300'}>
              {activeIntervention ? 'INTERVENTION ACTIVE' : 'NO ACTIVE INTERVENTION'}
            </strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            id="btn-accept-intervention"
            onClick={handleAccept}
            className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/60 flex items-center space-x-2 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>ACCEPT & DEPLOY TO TWIN</span>
          </button>

          <button
            id="btn-modify-intervention"
            onClick={() => setIsModifying(true)}
            className="px-5 py-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-cyan-300 text-xs font-bold border border-neutral-700 flex items-center space-x-2 transition-all"
          >
            <Edit3 className="w-4 h-4 text-cyan-400" />
            <span>MODIFY PARAMETERS</span>
          </button>

          <button
            id="btn-reject-intervention"
            onClick={handleReject}
            className="px-5 py-3 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-200 text-xs font-bold border border-rose-800/80 flex items-center space-x-2 transition-all"
          >
            <XCircle className="w-4 h-4 text-rose-400" />
            <span>REJECT & MAINTAIN BASELINE</span>
          </button>
        </div>
      </div>

      {/* Modify Parameters Modal */}
      {isModifying && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-cyan-400" />
                <span>Modify Intervention Parameters</span>
              </h3>
              <button onClick={() => setIsModifying(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleModifySubmit} className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between font-mono mb-1">
                  <span className="text-neutral-300">Green Extension Duration (J7 Apex):</span>
                  <span className="font-bold text-cyan-400">{modifyExtension} seconds</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="35"
                  step="5"
                  value={modifyExtension}
                  onChange={(e) => setModifyExtension(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
                <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                  <span>5s (Conservative)</span>
                  <span>35s (Aggressive Flush)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-mono mb-1">
                  <span className="text-neutral-300">Perimeter Diversion Fraction:</span>
                  <span className="font-bold text-cyan-400">{modifyDiversion}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={modifyDiversion}
                  onChange={(e) => setModifyDiversion(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
                <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                  <span>10% (Low secondary risk)</span>
                  <span>50% (Heavy diversion to J8)</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-400">
                Adjusting parameters generates a new counterfactual simulation branch inside the SUMO micro-simulator.
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModifying(false)}
                  className="px-3 py-2 rounded-lg bg-neutral-800 text-neutral-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold"
                >
                  Recalculate Scenario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
