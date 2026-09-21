import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, MapPin, Globe, User, Bot, AlertTriangle, ExternalLink } from 'lucide-react';
import { GeminiService } from '../../services/geminiService';
import { ChatMessage } from '../../types/traffic';
import { trafficStateService } from '../../services/trafficStateService';

export const CitizenChatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I am your AURA Commuter Assistant. Ask me about current corridor delays, upcoming gridlock forecasts, route recommendations, or grounded road updates.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [groundingMode, setGroundingMode] = useState<'none' | 'search' | 'maps'>('maps');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    const historyForApi = messages.map(m => ({ role: m.role, content: m.content }));
    const context = {
      routes: trafficStateService.getRoutes(),
      incidents: trafficStateService.getIncidents()
    };

    const res = await GeminiService.chat(userMsg.content, historyForApi, groundingMode, context);

    setIsLoading(false);
    const assistantMsg: ChatMessage = {
      role: 'assistant',
      content: res.reply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      groundingSources: res.groundingSources
    };

    setMessages(prev => [...prev, assistantMsg]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-extrabold text-white tracking-tight">COMMUTER COPILOT</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700 font-bold">
              GEMINI 3.5 FLASH
            </span>
          </div>
          <p className="text-xs text-neutral-300 mt-1">
            Real-time multi-turn commuter assistance with live Search and Google Maps grounding options.
          </p>
        </div>

        {/* Grounding Mode Toggle */}
        <div className="flex items-center space-x-1.5 p-1 bg-neutral-950 rounded-lg border border-neutral-800 text-xs font-mono">
          <button
            type="button"
            onClick={() => setGroundingMode('maps')}
            className={`px-2.5 py-1 rounded flex items-center space-x-1 transition-all ${
              groundingMode === 'maps'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <MapPin className="w-3 h-3" />
            <span>Maps Grounding</span>
          </button>

          <button
            type="button"
            onClick={() => setGroundingMode('search')}
            className={`px-2.5 py-1 rounded flex items-center space-x-1 transition-all ${
              groundingMode === 'search'
                ? 'bg-blue-950 text-blue-300 border border-blue-800 font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>Search Grounding</span>
          </button>

          <button
            type="button"
            onClick={() => setGroundingMode('none')}
            className={`px-2.5 py-1 rounded flex items-center space-x-1 transition-all ${
              groundingMode === 'none'
                ? 'bg-neutral-800 text-white font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>Standard</span>
          </button>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-6 h-[500px] flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-3 ${m.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                m.role === 'user' ? 'bg-cyan-600 text-white' : 'bg-neutral-800 text-cyan-300 border border-neutral-700'
              }`}>
                {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed space-y-2 ${
                m.role === 'user'
                  ? 'bg-cyan-600 text-white rounded-tr-none'
                  : 'bg-neutral-950 text-neutral-200 border border-neutral-800 rounded-tl-none'
              }`}>
                <div className="whitespace-pre-wrap font-sans">{m.content}</div>

                {/* Grounding Citations */}
                {m.groundingSources && m.groundingSources.length > 0 && (
                  <div className="pt-2 border-t border-neutral-800/80 text-[10px] font-mono text-neutral-400 space-y-1">
                    <div className="font-semibold text-cyan-400 flex items-center space-x-1">
                      <ExternalLink className="w-3 h-3" />
                      <span>Grounding Sources & Location Data:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {m.groundingSources.map((source: { title: string; uri: string }, sIdx: number) => (
                        <a
                          key={sIdx}
                          href={source.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white truncate max-w-[200px]"
                        >
                          {source.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className={`text-[9px] font-mono ${m.role === 'user' ? 'text-cyan-200' : 'text-neutral-500'} text-right`}>
                  {m.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-neutral-800 text-cyan-300 border border-neutral-700 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-neutral-400 font-mono flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                <span>
                  {groundingMode === 'maps' ? 'Consulting Google Maps grounding...' : groundingMode === 'search' ? 'Searching live web data...' : 'Reasoning with Gemini 3.5 Flash...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="mt-4 pt-3 border-t border-neutral-800 flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              groundingMode === 'maps'
                ? 'Ask about places, routes, or traffic via Google Maps...'
                : groundingMode === 'search'
                ? 'Ask about city traffic alerts or news via Google Search...'
                : 'Ask a traffic or route question...'
            }
            className="flex-1 bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-md"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
