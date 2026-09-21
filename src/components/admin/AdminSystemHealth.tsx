import React from 'react';
import { Activity, CheckCircle2, Server, Database, Radio, Cpu, Sparkles } from 'lucide-react';

export const AdminSystemHealth: React.FC = () => {
  const services = [
    { name: 'TomTom Traffic API', category: 'External Provider', status: 'HEALTHY', latency: '142ms', uptime: '99.98%' },
    { name: 'HERE Technologies Traffic', category: 'External Provider', status: 'HEALTHY', latency: '188ms', uptime: '99.94%' },
    { name: 'OpenStreetMap Tile Engine', category: 'Cartography', status: 'HEALTHY', latency: '45ms', uptime: '99.99%' },
    { name: 'SUMO Microscopic Digital Twin', category: 'Simulation', status: 'HEALTHY', latency: '82ms', uptime: '99.95%' },
    { name: 'Spatiotemporal ML Inference', category: 'AI/ML Pipeline', status: 'HEALTHY', latency: '38ms', uptime: '99.99%' },
    { name: 'PostgreSQL Traffic State Store', category: 'Database', status: 'HEALTHY', latency: '4ms', uptime: '100.00%' },
    { name: 'Redis Realtime Event Bus', category: 'Pub/Sub', status: 'HEALTHY', latency: '1ms', uptime: '100.00%' },
    { name: 'WebSocket Broadcast Server', category: 'Streaming', status: 'HEALTHY', latency: '12ms', uptime: '99.97%' },
    { name: 'Gemini 3.1 Pro AI Gateway', category: 'LLM Reasoning', status: 'HEALTHY', latency: '540ms', uptime: '99.92%' },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300">
              <Activity className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-extrabold text-white tracking-tight">SYSTEM HEALTH & INFRASTRUCTURE</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
              ALL SYSTEMS NOMINAL
            </span>
          </div>
          <p className="text-xs text-neutral-300 mt-1">
            Real-time latency telemetry and connectivity status across data feeds, simulation engines, and AI decision services.
          </p>
        </div>

        <div className="text-xs font-mono text-neutral-400 bg-neutral-950 px-3 py-1.5 rounded border border-neutral-800">
          Last Health Probe: <strong className="text-emerald-400">Just Now (2s ago)</strong>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {services.map((s) => (
          <div
            key={s.name}
            className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2.5 font-mono text-xs"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-semibold">{s.category}</span>
                <h3 className="text-sm font-bold text-white mt-0.5 font-sans">{s.name}</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>{s.status}</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
              <div className="p-2 rounded bg-neutral-950 border border-neutral-800/80">
                <div className="text-neutral-500 text-[9px]">RESPONSE LATENCY</div>
                <div className="text-cyan-300 font-bold mt-0.5">{s.latency}</div>
              </div>
              <div className="p-2 rounded bg-neutral-950 border border-neutral-800/80">
                <div className="text-neutral-500 text-[9px]">SERVICE UPTIME</div>
                <div className="text-neutral-200 font-bold mt-0.5">{s.uptime}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
