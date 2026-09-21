import { CitizenToastNotification, CitizenToastType } from '../types/toast';
import { trafficStateService } from './trafficStateService';

class CitizenNotificationService {
  private toasts: CitizenToastNotification[] = [];
  private listeners: (() => void)[] = [];
  private soundMuted: boolean = false;
  private audioCtx: AudioContext | null = null;
  private lastTriggeredRouteKey: Record<string, number> = {};

  constructor() {
    // Load sound preference
    try {
      const stored = localStorage.getItem('aura_citizen_sound_muted');
      if (stored !== null) {
        this.soundMuted = stored === 'true';
      }
    } catch {
      // ignore
    }
  }

  public getToasts(): CitizenToastNotification[] {
    return this.toasts;
  }

  public isSoundMuted(): boolean {
    return this.soundMuted;
  }

  public toggleSound(): boolean {
    this.soundMuted = !this.soundMuted;
    try {
      localStorage.setItem('aura_citizen_sound_muted', String(this.soundMuted));
    } catch {
      // ignore
    }
    if (!this.soundMuted) {
      this.playChime('INFO');
    }
    this.notify();
    return this.soundMuted;
  }

  public playChime(type: CitizenToastType | 'SUCCESS' | 'INFO' = 'NEW_DISRUPTION'): void {
    if (this.soundMuted) return;

    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioCtxClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      gain.connect(this.audioCtx.destination);

      if (type === 'REROUTE_CONFIRMED' || type === 'SUCCESS') {
        // High pleasant confirmation tone (F#5 -> B5)
        osc1.frequency.setValueAtTime(739.99, now);
        osc2.frequency.setValueAtTime(987.77, now + 0.08);

        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc1.connect(gain);
        osc2.connect(gain);

        osc1.start(now);
        osc1.stop(now + 0.08);
        osc2.start(now + 0.08);
        osc2.stop(now + 0.35);
      } else {
        // Dual-tone urgent alert chime (D5 -> A5)
        osc1.frequency.setValueAtTime(587.33, now);
        osc2.frequency.setValueAtTime(880.00, now + 0.09);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc1.connect(gain);
        osc2.connect(gain);

        osc1.start(now);
        osc1.stop(now + 0.09);
        osc2.start(now + 0.09);
        osc2.stop(now + 0.45);
      }
    } catch (e) {
      // Audio might be blocked by browser autoplay policy until user gesture
      console.debug('AudioContext not allowed or ready:', e);
    }
  }

  public show(toastData: Omit<CitizenToastNotification, 'id' | 'timestamp'>): string {
    const id = `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const toast: CitizenToastNotification = {
      ...toastData,
      id,
      timestamp: Date.now(),
      durationMs: toastData.durationMs || 9000
    };

    // Keep max 3 active toasts at once to prevent viewport clutter
    this.toasts = [toast, ...this.toasts.slice(0, 2)];
    this.playChime(toast.type);
    this.notify();
    return id;
  }

  public dismiss(id: string): void {
    const beforeCount = this.toasts.length;
    this.toasts = this.toasts.filter(t => t.id !== id);
    if (this.toasts.length !== beforeCount) {
      this.notify();
    }
  }

  public clearAll(): void {
    if (this.toasts.length > 0) {
      this.toasts = [];
      this.notify();
    }
  }

  /**
   * Evaluates the active route and posts a toast if high disruption or imminent spillback is detected
   */
  public evaluateActiveRoute(
    activeRouteId: string,
    onReroute?: (routeId: string) => void,
    forceToast = false
  ): void {
    const routes = trafficStateService.getRoutes();
    const activeRoute = routes.find(r => r.id === activeRouteId);
    if (!activeRoute) return;

    const now = Date.now();
    const lastTriggered = this.lastTriggeredRouteKey[activeRouteId] || 0;

    // Avoid duplicate spam within 20 seconds unless forced
    if (!forceToast && now - lastTriggered < 20000) {
      return;
    }

    if (activeRouteId === 'route-a') {
      const junctions = trafficStateService.getJunctions();
      const j7 = junctions.find(j => j.code === 'J7');
      const isCritical = (j7?.capacityPressurePercent ?? 0) >= 80 || (j7?.spillbackProbabilityPercent ?? 0) >= 60;

      if (isCritical || forceToast) {
        this.lastTriggeredRouteKey[activeRouteId] = now;
        this.show({
          title: 'Predicted Gridlock Spillback on Your Route',
          message: 'Severe congestion at Central Plaza (J7) is causing upstream queues to back up rapidly. Travel time expected to surge +10 min.',
          severity: 'CRITICAL',
          type: 'SPILLBACK_ALERT',
          affectedRouteId: 'route-a',
          affectedRouteName: activeRoute.name,
          locationName: 'Central Plaza Apex (J7) · Grand Trunk Spine',
          junctionCode: 'J7',
          delaySurgeMinutes: 10,
          timeHorizonMinutes: 4,
          alternativeRouteId: 'route-b',
          alternativeRouteName: 'Eastern Bypass (Route B)',
          classification: 'PREDICTED',
          confidencePercent: 78,
          durationMs: 12000,
          primaryAction: onReroute ? {
            label: 'Reroute to Route B (Eastern Bypass)',
            onClick: () => {
              onReroute('route-b');
              this.notifyRerouteSuccess('Eastern Bypass (Route B)', 'Bypassed Central Plaza spillback (+3 min, 84% journey certainty)');
            }
          } : undefined,
          secondaryAction: {
            label: 'Dismiss',
            onClick: () => {}
          }
        });
      }
    }
  }

  /**
   * Confirmation toast when commuter reroutes to avoid traffic
   */
  public notifyRerouteSuccess(newRouteName: string, benefitSummary: string): void {
    this.show({
      title: 'Route Switched Successfully',
      message: `Active navigation updated to ${newRouteName}. ${benefitSummary}`,
      severity: 'SUCCESS',
      type: 'REROUTE_CONFIRMED',
      affectedRouteId: 'route-b',
      locationName: 'Eastern Outer Bypass Loop',
      classification: 'SIMULATED',
      durationMs: 6000
    });
  }

  /**
   * Simulate a sudden disruption on whichever route the commuter is currently driving
   */
  public simulateDisruptionOnRoute(
    activeRouteId: string,
    onReroute?: (routeId: string) => void
  ): void {
    const routes = trafficStateService.getRoutes();
    const activeRoute = routes.find(r => r.id === activeRouteId);
    const routeName = activeRoute?.name || 'Active Route';

    if (activeRouteId === 'route-a') {
      this.show({
        title: 'New Incident Detected on Route A',
        message: 'Multi-vehicle bumper collision in center lane near Central Plaza Apex (J7). Inbound flow dropped to 14 km/h.',
        severity: 'CRITICAL',
        type: 'ACCIDENT_AHEAD',
        affectedRouteId: 'route-a',
        affectedRouteName: routeName,
        locationName: 'Central Plaza Apex (J7)',
        junctionCode: 'J7',
        delaySurgeMinutes: 12,
        timeHorizonMinutes: 2,
        alternativeRouteId: 'route-b',
        alternativeRouteName: 'Eastern Bypass (Route B)',
        classification: 'SIMULATED',
        confidencePercent: 88,
        durationMs: 14000,
        primaryAction: onReroute ? {
          label: 'Switch to Route B (-8 min delay)',
          onClick: () => {
            onReroute('route-b');
            this.notifyRerouteSuccess('Eastern Bypass (Route B)', 'Avoided collision bottleneck at Central Plaza.');
          }
        } : undefined
      });
    } else if (activeRouteId === 'route-b') {
      this.show({
        title: 'Merge Slowdown Detected on Eastern Bypass',
        message: 'High volume surge at Hospital approach ramp. Minor slowdown detected ahead (+3 min). Route B remains optimal.',
        severity: 'MODERATE',
        type: 'HEAVY_JAM',
        affectedRouteId: 'route-b',
        affectedRouteName: routeName,
        locationName: 'Eastern Bypass South Approach',
        delaySurgeMinutes: 3,
        timeHorizonMinutes: 6,
        classification: 'SIMULATED',
        confidencePercent: 82,
        durationMs: 9000,
        primaryAction: {
          label: 'Stay on Route B (Safe Choice)',
          onClick: () => {}
        }
      });
    } else {
      this.show({
        title: 'Temporary Roadwork on Metro West Connector',
        message: 'Right lane constricted for utility maintenance near Junction J10. Expected delay +4 min.',
        severity: 'MODERATE',
        type: 'NEW_DISRUPTION',
        affectedRouteId: 'route-c',
        affectedRouteName: routeName,
        locationName: 'Metro West Arterial Link (J10)',
        junctionCode: 'J10',
        delaySurgeMinutes: 4,
        timeHorizonMinutes: 5,
        alternativeRouteId: 'route-b',
        alternativeRouteName: 'Eastern Bypass (Route B)',
        classification: 'SIMULATED',
        confidencePercent: 91,
        durationMs: 10000,
        primaryAction: onReroute ? {
          label: 'Switch to Route B',
          onClick: () => {
            onReroute('route-b');
            this.notifyRerouteSuccess('Eastern Bypass (Route B)', 'Bypassed maintenance delay.');
          }
        } : undefined
      });
    }
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notify(): void {
    this.listeners.forEach(cb => cb());
  }
}

export const citizenNotificationService = new CitizenNotificationService();
