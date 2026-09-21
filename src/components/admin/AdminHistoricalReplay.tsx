import React, { useState } from 'react';
import { RotateCcw, Play, Pause, FastForward, Clock, Activity } from 'lucide-react';

export const AdminHistoricalReplay: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [replayStep, setReplayStep] = useState(2); // 0 to 5

  const replayFrames = [
    { time: 'T-10m (14:15)', label: 'Normal Free-Flow', speed: '44 km/h', queue: '35m', spillback: '4%', status: 'Nominal corridor circulation.' },
    { time: 'T-5m (14:20)', label: 'Minor Congestion', speed: '38 km/h', queue: '75m', spillback: '12%', status: 'Inflow increases during peak shoulder.' },
    { time: 'T-0m (14:25)', label: 'Incident Occurs (Collision)', speed: '19 km/h', queue: '160m', spillback: '38%', status: 'Two-car collision blocks 2 eastbound lanes at J7.' },
    { time: 'T+3m (14:28)', label: 'Rapid Queue Buildup', speed: '12 km/h', queue: '280m', spillback: '72%', status: 'Spillback risk crosses critical threshold.' },
    { time: 'T+7m (14:32)', label: 'Intervention A+B Applied', speed: '24 km/h', queue: '190m', spillback: '31%', status: '15s green extension + perimeter diversion clears bottleneck.' },
    { time: 'T+15m (14:40)', label: 'Corridor Recovery', speed: '40 km/h', queue: '45m', spillback: '6%', status: 'Normal flow restored across all 6 segments.' },
  ];

  const currentFrame = replayFrames[replayStep];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300">
              <RotateCcw className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-extrabold text-white tracking-tight">EPISODE REPLAY & POST-MORTEM</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700 font-bold">
              HISTORICAL RECORDING
            </span>
          </div>
          <p className="text-xs text-neutral-300 mt-1">
            Replay recorded sensor streams, model inference predictions, and operator intervention timelines.
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs text-neutral-400 bg-neutral-950 px-3 py-1.5 rounded border border-neutral-800">
          Episode ID: <strong className="text-white">EP-20260919-J7-ACCIDENT</strong>
        </div>
      </div>

      {/* Scrubber Controls */}
      <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white shadow-md transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setReplayStep(prev => (prev + 1) % replayFrames.length)}
              className="p-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
            >
              <FastForward className="w-4 h-4" />
            </button>
            <div>
              <div className="text-xs font-mono font-bold text-white">{currentFrame.time}</div>
              <div className="text-[11px] text-cyan-400 font-medium">{currentFrame.label}</div>
            </div>
          </div>

          <div className="text-right font-mono text-xs">
            <div className="text-neutral-400 text-[10px]">STEP</div>
            <div className="text-white font-bold">{replayStep + 1} of {replayFrames.length}</div>
          </div>
        </div>

        {/* Range Slider */}
        <input
          type="range"
          min="0"
          max={replayFrames.length - 1}
          value={replayStep}
          onChange={(e) => setReplayStep(Number(e.target.value))}
          className="w-full accent-cyan-500 cursor-pointer"
        />

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-[10px] font-mono">
          {replayFrames.map((f, i) => (
            <div
              key={f.time}
              onClick={() => setReplayStep(i)}
              className={`p-2 rounded-lg cursor-pointer transition-all border ${
                replayStep === i
                  ? 'bg-neutral-800 border-cyan-500 text-cyan-300 font-bold'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
              }`}
            >
              <div>{f.time.split(' ')[0]}</div>
              <div className="truncate text-neutral-300 mt-0.5">{f.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Frame Details */}
      <div className="p-6 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
          Recorded Telemetry at {currentFrame.time}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
            <div className="text-neutral-400 text-[10px]">CORRIDOR SPEED</div>
            <div className="text-xl font-bold text-white mt-1">{currentFrame.speed}</div>
          </div>
          <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
            <div className="text-neutral-400 text-[10px]">J7 APPROACH QUEUE</div>
            <div className="text-xl font-bold text-yellow-400 mt-1">{currentFrame.queue}</div>
          </div>
          <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
            <div className="text-neutral-400 text-[10px]">SPILLBACK PROBABILITY</div>
            <div className="text-xl font-bold text-rose-400 mt-1">{currentFrame.spillback}</div>
          </div>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed font-mono bg-neutral-950 p-3.5 rounded-lg border border-neutral-800">
          <strong>Digital Twin State Note:</strong> {currentFrame.status}
        </p>
      </div>
    </div>
  );
};
