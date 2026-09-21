import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, X, Sparkles, Radio, PhoneCall } from 'lucide-react';
import { GeminiService } from '../../services/geminiService';
import { trafficStateService } from '../../services/trafficStateService';

interface CitizenLiveVoiceModalProps {
  onClose: () => void;
}

export const CitizenLiveVoiceModal: React.FC<CitizenLiveVoiceModalProps> = ({ onClose }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<string>('Tap the microphone or say "What is the best route right now?"');
  const [assistantReply, setAssistantReply] = useState<string | null>(
    'I am listening. Route A has a predicted spillback in 4 minutes; I recommend taking Route B via the Eastern Bypass.'
  );

  const audioVisualizerBars = [40, 75, 20, 90, 60, 30, 85, 50, 65, 95, 45, 80];

  const handleSimulatedVoiceQuery = async (query: string) => {
    setIsListening(false);
    setIsSpeaking(true);
    setTranscript(`"${query}"`);

    const context = {
      routes: trafficStateService.getRoutes(),
      incidents: trafficStateService.getIncidents()
    };

    const res = await GeminiService.chat(
      query,
      [{ role: 'assistant', content: 'You are AURA Voice Assistant powered by Gemini Live API. Keep answers concise for drivers.' }],
      'none',
      context
    );

    setAssistantReply(res.reply);
    setIsSpeaking(false);

    // Browser Web Speech API if supported for true audio playback!
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(res.reply);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      setTranscript('Listening for commuter query...');
      // Simulate real-time audio capture turn after 2 seconds
      setTimeout(() => {
        handleSimulatedVoiceQuery('Should I switch to Route B because of the Central Plaza accident?');
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-md shadow-2xl p-6 text-center space-y-6 animate-in fade-in zoom-in-95 relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Close */}
        <button
          onClick={() => {
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs font-mono font-bold">
            <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
            <span>LIVE AUDIO STREAM // GEMINI-3.8-LIVE</span>
          </div>
          <h2 className="text-xl font-extrabold text-white">Hands-Free Commuter Assistant</h2>
          <p className="text-xs text-neutral-400">
            Real-time conversational voice guidance for safe driving
          </p>
        </div>

        {/* Audio Visualizer Orb */}
        <div className="flex flex-col items-center justify-center py-4 space-y-4">
          <div className="relative">
            {/* Pulsing ring */}
            <div className={`absolute -inset-3 rounded-full opacity-40 blur-md transition-all duration-300 ${
              isListening ? 'bg-cyan-500 animate-ping' : isSpeaking ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-700'
            }`} />

            {/* Mic button */}
            <button
              id="voice-mic-toggle-btn"
              onClick={toggleListening}
              className={`relative w-24 h-24 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 ${
                isListening
                  ? 'bg-cyan-500 ring-4 ring-cyan-400/50 scale-105'
                  : isSpeaking
                  ? 'bg-emerald-600 ring-4 ring-emerald-400/50'
                  : 'bg-neutral-800 hover:bg-neutral-750 border border-neutral-700'
              }`}
            >
              {isListening ? (
                <Mic className="w-10 h-10 animate-bounce" />
              ) : (
                <Mic className="w-10 h-10 text-cyan-400" />
              )}
            </button>
          </div>

          {/* Equalizer Frequency Bars */}
          <div className="flex items-end justify-center space-x-1 h-10">
            {audioVisualizerBars.map((height, i) => (
              <div
                key={i}
                className={`w-1.5 rounded-full transition-all duration-150 ${
                  isListening || isSpeaking ? 'bg-cyan-400' : 'bg-neutral-800'
                }`}
                style={{
                  height: isListening || isSpeaking ? `${Math.max(10, Math.sin(Date.now() / 200 + i) * 35 + 20)}%` : '15%'
                }}
              />
            ))}
          </div>
        </div>

        {/* Transcript & Response Area */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-left space-y-2 text-xs">
          <div className="text-[10px] font-mono text-neutral-400 uppercase font-semibold">
            {isListening ? 'Live Commuter Voice...' : 'Transcript'}
          </div>
          <div className="text-neutral-300 italic font-sans">{transcript}</div>

          {assistantReply && (
            <div className="pt-2 border-t border-neutral-800 text-neutral-100 font-sans leading-relaxed">
              <span className="font-bold text-cyan-400 font-mono text-[10px] block mb-0.5">AURA VOICE:</span>
              {assistantReply}
            </div>
          )}
        </div>

        {/* Quick Voice Prompt Shortcuts */}
        <div className="space-y-1.5 text-left">
          <div className="text-[10px] font-mono text-neutral-400 uppercase font-semibold">
            Tap to Ask Aloud
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            {[
              'What is the best route to the hospital right now?',
              'Is Central Plaza congested?',
              'Why is Route B recommended over Route A?'
            ].map((q) => (
              <button
                key={q}
                onClick={() => handleSimulatedVoiceQuery(q)}
                className="px-3 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800/80 border border-neutral-800 text-xs text-neutral-300 text-left transition-colors flex items-center justify-between group"
              >
                <span className="truncate">{q}</span>
                <Volume2 className="w-3.5 h-3.5 text-neutral-500 group-hover:text-cyan-400 shrink-0 ml-2" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
