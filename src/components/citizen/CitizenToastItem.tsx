import React, { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  Clock,
  ArrowRight,
  X,
  Volume2,
  VolumeX,
  CheckCircle2,
  Navigation,
  Sparkles,
  ShieldAlert,
  Flame
} from 'lucide-react';
import { CitizenToastNotification } from '../../types/toast';
import { citizenNotificationService } from '../../services/citizenNotificationService';

interface CitizenToastItemProps {
  toast: CitizenToastNotification;
  onDismiss: (id: string) => void;
}

export const CitizenToastItem: React.FC<CitizenToastItemProps> = ({ toast, onDismiss }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);
  const startTimeRef = useRef<number>(Date.now());
  const remainingTimeRef = useRef<number>(toast.durationMs);
  const timerRef = useRef<number | null>(null);

  const isMuted = citizenNotificationService.isSoundMuted();

  useEffect(() => {
    if (isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    startTimeRef.current = Date.now();

    timerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, remainingTimeRef.current - elapsed);
      const newProgress = (remaining / toast.durationMs) * 100;

      setProgress(newProgress);

      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        onDismiss(toast.id);
      }
    }, 50);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isHovered, toast.id, toast.durationMs, onDismiss]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    // calculate how much time was left when paused
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const getSeverityStyling = () => {
    switch (toast.severity) {
      case 'CRITICAL':
        return {
          cardBg: 'bg-neutral-950/95 border-rose-600/90 shadow-2xl shadow-rose-950/50',
          badgeBg: 'bg-rose-950 text-rose-300 border-rose-800',
          iconColor: 'text-rose-400',
          barColor: 'bg-rose-500',
          icon: <Flame className="w-5 h-5 text-rose-400 animate-pulse" />
        };
      case 'HIGH':
        return {
          cardBg: 'bg-neutral-950/95 border-amber-600/90 shadow-2xl shadow-amber-950/50',
          badgeBg: 'bg-amber-950 text-amber-300 border-amber-800',
          iconColor: 'text-amber-400',
          barColor: 'bg-amber-500',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400 animate-bounce" />
        };
      case 'SUCCESS':
        return {
          cardBg: 'bg-neutral-950/95 border-emerald-600/90 shadow-2xl shadow-emerald-950/50',
          badgeBg: 'bg-emerald-950 text-emerald-300 border-emerald-800',
          iconColor: 'text-emerald-400',
          barColor: 'bg-emerald-500',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        };
      case 'MODERATE':
      default:
        return {
          cardBg: 'bg-neutral-950/95 border-yellow-600/80 shadow-2xl shadow-yellow-950/40',
          badgeBg: 'bg-yellow-950 text-yellow-300 border-yellow-800',
          iconColor: 'text-yellow-400',
          barColor: 'bg-yellow-500',
          icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />
        };
    }
  };

  const styling = getSeverityStyling();

  return (
    <div
      role="alert"
      id={`citizen-toast-${toast.id}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full overflow-hidden rounded-xl border backdrop-blur-md p-4 transition-all duration-200 pointer-events-auto select-none ${styling.cardBg}`}
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-neutral-900/90 border border-neutral-800 shrink-0">
            {styling.icon}
          </div>
          <div>
            <div className="flex items-center space-x-1.5 text-[10px] font-mono">
              <span className={`px-1.5 py-0.5 rounded font-bold uppercase border ${styling.badgeBg}`}>
                {toast.severity} DISRUPTION
              </span>
              <span className="text-neutral-400">·</span>
              <span className="text-neutral-400 font-semibold uppercase">{toast.classification}</span>
              {toast.timeHorizonMinutes && (
                <>
                  <span className="text-neutral-400">·</span>
                  <span className="text-neutral-300 font-medium flex items-center space-x-0.5">
                    <Clock className="w-3 h-3 text-neutral-400" />
                    <span>~{toast.timeHorizonMinutes} min</span>
                  </span>
                </>
              )}
            </div>
            <h4 className="text-sm font-bold text-white tracking-tight mt-0.5 leading-snug">
              {toast.title}
            </h4>
          </div>
        </div>

        {/* Action icons: Sound toggle + Dismiss */}
        <div className="flex items-center space-x-1 shrink-0 -mt-1 -mr-1">
          <button
            type="button"
            onClick={() => citizenNotificationService.toggleSound()}
            title={isMuted ? 'Unmute alert chimes' : 'Mute alert chimes'}
            className="p-1 rounded text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
          </button>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            title="Dismiss notification"
            className="p-1 rounded text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Message and Location Detail */}
      <div className="mt-2 text-xs text-neutral-300 leading-relaxed font-sans pl-1">
        <p>{toast.message}</p>
        {toast.locationName && (
          <div className="mt-1.5 flex items-center space-x-1.5 text-[11px] font-mono text-neutral-400">
            <Navigation className="w-3 h-3 text-cyan-400 shrink-0" />
            <span className="truncate">Affects: <strong className="text-neutral-200">{toast.locationName}</strong></span>
            {toast.delaySurgeMinutes && (
              <span className="ml-auto px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-rose-300 font-bold shrink-0">
                +{toast.delaySurgeMinutes} min delay
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {(toast.primaryAction || toast.secondaryAction) && (
        <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex items-center justify-between gap-2">
          {toast.primaryAction && (
            <button
              type="button"
              onClick={() => {
                toast.primaryAction?.onClick();
                onDismiss(toast.id);
              }}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md transition-colors"
            >
              <span>{toast.primaryAction.label}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {toast.secondaryAction && (
            <button
              type="button"
              onClick={() => {
                toast.secondaryAction?.onClick();
                onDismiss(toast.id);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold border border-neutral-800 transition-colors ml-auto"
            >
              {toast.secondaryAction.label}
            </button>
          )}
        </div>
      )}

      {/* Bottom Progress Countdown Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-900 overflow-hidden">
        <div
          className={`h-full transition-all duration-75 ${styling.barColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
