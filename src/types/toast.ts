import { SeverityLevel } from './traffic';

export type CitizenToastType =
  | 'SPILLBACK_ALERT'
  | 'NEW_DISRUPTION'
  | 'ACCIDENT_AHEAD'
  | 'HEAVY_JAM'
  | 'REROUTE_RECOMMENDED'
  | 'REROUTE_CONFIRMED'
  | 'EMERGENCY_CORRIDOR';

export interface CitizenToastNotification {
  id: string;
  title: string;
  message: string;
  severity: SeverityLevel | 'SUCCESS' | 'INFO';
  type: CitizenToastType;
  affectedRouteId: string; // 'route-a' | 'route-b' | 'route-c' | 'ALL'
  affectedRouteName?: string;
  locationName: string;
  junctionCode?: string;
  delaySurgeMinutes?: number;
  timeHorizonMinutes?: number;
  alternativeRouteId?: string;
  alternativeRouteName?: string;
  timestamp: number;
  durationMs: number; // e.g. 9000
  classification: 'PREDICTED' | 'SIMULATED' | 'ESTIMATED' | 'OBSERVED';
  confidencePercent?: number;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}
