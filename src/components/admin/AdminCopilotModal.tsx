import React, { useState } from 'react';
import { Sparkles, Brain, X, Send, AlertTriangle, CheckCircle2, ShieldAlert, ChevronRight, HelpCircle } from 'lucide-react';
import { GeminiService } from '../../services/geminiService';
import { CopilotAnalysisResponse } from '../../types/traffic';
import { trafficStateService } from '../../services/trafficStateService';

interface AdminCopilotModalProps {
  onClose: () => void;
  onNavigateToWhatIf?: () => void;
}

export const AdminCopilotModal: React.FC<AdminCopilotModalProps> = ({
  onClose,
  onNavigateToWhatIf
}) => {
  const [query, setQuery] = useState('');
  const [highThinking, setHighThinking] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<CopilotAnalysisResponse | null>(null);

  const quickPrompts = [
    'Why is J7 predicted to experience spillback in 3–6 minutes?',
    'Compare Scenario A (Signal) vs Scenario A+B (Combined) trade-offs.',
    'What are the secondary risks on Hospital North (J8) if we divert 25%?',
    'Provide human operator recommendation with confidence score.'
  ];

  const handleAsk = async (promptText: string) => {
    setIsLoading(true);
    setAnalysis(null);

    const context = {
      junctions: trafficStateService.getJunctions(),
      segments: trafficStateService.getSegments(),
      incidents: trafficStateService.getIncidents(),
      scenarios: trafficStateService.getScenarios()
    };

    const res = await GeminiService.askCopilot(promptText, highThinking, context);
    setIsLoading(false);
    setAnalysis(res);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    handleAsk(query.trim());
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-extrabold text-white font-mono">AURA COPILOT // AI DECISION INTELLIGENCE</h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                  {highThinking ? 'gemini-3.1-pro-preview' : 'gemini-3.5-flash'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Spatiotemporal reasoning, counterfactual trade-off analysis & evidence grounding
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* High Thinking Mode Toggle */}
            <button
              onClick={() => setHighThinking(!highThinking)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5 transition-all border ${
                highThinking
                  ? 'bg-purple-950 text-purple-200 border-purple-800 shadow-sm'
                  : 'bg-neutral-800 text-neutral-400 border-neutral-700'
              }`}
              title="Toggle High Thinking mode (ThinkingLevel.HIGH) for deep multi-hop causal reasoning"
            >
              <Brain className="w-3.5 h-3.5 text-purple-400" />
              <span>HIGH THINKING: {highThinking ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Quick Prompts */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono text-neutral-400 uppercase font-semibold">
              Operational Inquiries
            </div>
            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setQuery(p);
                    handleAsk(p);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white text-xs text-left transition-colors font-sans"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="p-8 text-center space-y-3">
              <div className="inline-flex items-center justify-center p-3 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 animate-spin">
                <Brain className="w-6 h-6" />
              </div>
              <div className="text-xs font-mono text-cyan-300">
                {highThinking ? 'Executing High Thinking causal chain reasoning across corridor state...' : 'Generating operational analysis...'}
              </div>
            </div>
          )}

          {/* Structured Analysis Response */}
          {analysis && (
            <div className="space-y-4 text-xs">
              {/* Thinking Process Accordion (if available) */}
              {analysis.thinking && (
                <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/60 font-mono text-[11px] space-y-1">
                  <div className="flex items-center space-x-1.5 text-purple-300 font-bold">
                    <Brain className="w-3.5 h-3.5" />
                    <span>Gemini 3.1 Pro Thinking Process (High Thinking)</span>
                  </div>
                  <p className="text-neutral-300 whitespace-pre-wrap leading-relaxed text-[11px]">
                    {analysis.thinking}
                  </p>
                </div>
              )}

              {/* Assessment & Recommendation Card */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                  <span className="font-mono text-cyan-400 font-bold uppercase text-[10px]">
                    Operational Assessment
                  </span>
                  <span className="font-mono text-emerald-400 text-[10px] bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    Confidence: {analysis.confidenceScore}%
                  </span>
                </div>

                <p className="text-sm text-neutral-200 leading-relaxed font-sans">
                  {analysis.assessment}
                </p>

                {/* Primary Recommendation */}
                <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/80 space-y-1">
                  <div className="font-mono text-[10px] text-cyan-300 uppercase font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    <span>Recommended Counterfactual Scenario</span>
                  </div>
                  <div className="text-sm font-bold text-white">
                    {analysis.recommendation}
                  </div>
                </div>

                {/* Secondary Risks (Section 26 Compliance) */}
                {analysis.secondaryRisks && analysis.secondaryRisks.length > 0 && (
                  <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/60 space-y-1.5">
                    <div className="font-mono text-[10px] text-amber-300 uppercase font-bold flex items-center space-x-1">
                      <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                      <span>Secondary Risks & Trade-Offs (Never Hidden)</span>
                    </div>
                    <ul className="list-disc list-inside text-neutral-300 space-y-1 text-[11px]">
                      {analysis.secondaryRisks.map((risk: string, i: number) => (
                        <li key={i}>{risk}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Evidence Citations */}
                {analysis.evidenceCitations && analysis.evidenceCitations.length > 0 && (
                  <div className="pt-2 text-[10px] font-mono text-neutral-400 space-y-1">
                    <span className="uppercase font-semibold">Evidence Grounding:</span>
                    <div className="flex flex-wrap gap-1">
                      {analysis.evidenceCitations.map((c: string, i: number) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800">
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask AURA Copilot about queue dynamics, cascade risk, or What-If scenarios..."
              className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Analyze</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
