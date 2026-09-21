export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  title: string;
  avatar?: string;
  permissions: string[];
}

export type DataClassification = 'OBSERVED' | 'ESTIMATED' | 'PREDICTED' | 'SIMULATED' | 'UNKNOWN';
export type FreshnessStatus = 'FRESH' | 'STALE' | 'UNKNOWN';
export type AppMode = 'DEMO' | 'LIVE' | 'REPLAY' | 'DIGITAL_TWIN' | 'DEGRADED';
export type SeverityLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface RoadSegment {
  id: string;
  name: string;
  fromJunction: string;
  toJunction: string;
  lengthMeters: number;
  currentSpeedKmh: number;
  freeFlowSpeedKmh: number;
  capacityStressPercent: number; // 0-100%
  estimatedQueueMeters: number;
  blockingPercent: number;
  flowVehiclesPerHour: number;
  densityVehiclesPerKm: number;
  vehicleComposition: {
    cars: number;
    twoWheelers: number;
    buses: number;
    heavyVehicles: number;
    autos: number;
  };
  classification: DataClassification;
  freshness: FreshnessStatus;
  lastUpdatedSecondsAgo: number;
  predictedRisk: SeverityLevel;
  confidencePercent: number;
  coordinates: [number, number][]; // [[lng, lat], ...]
}

export interface Junction {
  id: string;
  name: string;
  code: string; // e.g. "J7"
  type: 'SIGNALIZED' | 'ROUNDABOUT' | 'MERGE' | 'INTERSECTION';
  coordinates: [number, number]; // [lng, lat]
  currentQueueMeters: number;
  capacityPressurePercent: number;
  currentPhaseSecondsRemaining: number;
  predictedEvent?: string;
  riskSeverity: SeverityLevel;
  spillbackProbabilityPercent: number;
  connectedSegments: string[];
}

export interface TrafficIncident {
  id: string;
  type: 'ACCIDENT' | 'LANE_BLOCKAGE' | 'ROADWORK' | 'HAZARD' | 'FLOODING' | 'STALLED_VEHICLE';
  locationName: string;
  junctionId?: string;
  roadSegmentId?: string;
  severity: SeverityLevel;
  startTime: string;
  expectedDurationMinutes: number;
  source: string;
  confidencePercent: number;
  classification: DataClassification;
  description: string;
  downstreamImpactNodes: string[];
}

export interface CascadeEvent {
  id: string;
  parentId?: string;
  type: 'SPILLBACK' | 'DOWNSTREAM_BLOCKING' | 'DIVERSION_OVERLOAD' | 'CAPACITY_REDUCTION' | 'DEMAND_REDISTRIBUTION' | 'SIGNAL_INTERACTION';
  junctionCode: string;
  roadSegmentId?: string;
  predictedTimeOffsetMinutes: number; // e.g. +3, +5, +7
  probabilityPercent: number;
  severity: SeverityLevel;
  confidencePercent: number;
  propagationDelaySeconds: number;
  status: 'ANTICIPATED' | 'PROPAGATING' | 'MITIGATED' | 'OBSERVED';
}

export interface CascadeRelationship {
  id: string;
  sourceEventId: string;
  targetEventId: string;
  type: 'SPILLBACK' | 'DOWNSTREAM_BLOCKING' | 'DIVERSION_OVERLOAD' | 'SIGNAL_INTERACTION';
  delaySeconds: number;
  influenceWeight: number; // 0-1
}

export type InterventionType = 'SIGNAL' | 'DIVERSION' | 'RESTRICTION' | 'METERING' | 'EMERGENCY' | 'COMBINED';

export interface InterventionParams {
  type: InterventionType;
  targetJunctionCode: string;
  // Signal params
  signalPhase?: string;
  greenExtensionSeconds?: number;
  durationSeconds?: number;
  // Diversion params
  origin?: string;
  destination?: string;
  diversionFractionPercent?: number;
  // Restriction params
  restrictedVehicleClasses?: string[];
  restrictionDurationMinutes?: number;
  // Metering params
  meteringRatePerHour?: number;
}

export interface ScenarioResult {
  scenarioId: string;
  name: string;
  type: InterventionType | 'BASELINE';
  affectedNodesCount: number;
  cascadeDurationMinutes: number;
  maxSeverityScore: number; // 0 to 1
  recoveryTimeMinutes: number;
  travelTimeImpactPercent: number; // negative is improvement
  emergencyCorridorImpactScore: number;
  primaryBenefit: string;
  secondaryEffect: string;
  secondaryEffectProbabilityPercent: number;
  uncertaintyScore: number; // 0 to 1
  classification: DataClassification;
}

export interface OperatorAction {
  id: string;
  timestamp: string;
  operatorUsername: string;
  operatorId?: string;
  action?: 'ACCEPT' | 'MODIFY' | 'REJECT' | string;
  actionType: 'ACCEPT_INTERVENTION' | 'MODIFY_INTERVENTION' | 'REJECT_INTERVENTION' | 'CREATE_SCENARIO' | 'EMERGENCY_OVERRIDE' | 'CITIZEN_ALERT_DISPATCH';
  scenarioId?: string;
  details: string;
  correlationId: string;
  reason?: string;
  parameters?: Record<string, any>;
}

export interface RouteAlternative {
  id: string;
  name: string;
  tag: 'FASTEST' | 'LOWER_FUTURE_RISK' | 'ALTERNATIVE';
  tagLabel?: string;
  viaRoads?: string[];
  distanceKm: number;
  estimatedDurationMinutes: number;
  currentTravelTimeMinutes: number;
  predictedTravelTimeMinutes: number;
  currentTrafficSeverity: SeverityLevel;
  futureRiskSeverity: SeverityLevel;
  gridlockRiskPercent: number; // The key metric
  predictedRiskPercent: number;
  tradeoffDescription?: string;
  confidencePercent: number;
  predictedDisruptionsCount: number;
  cascadeExposure: SeverityLevel;
  majorRiskJunctions: string[];
  riskTimeWindow: string; // e.g. "+10 to +15 min"
  polylineCoordinates: [number, number][];
  segments: {
    roadName: string;
    lengthMeters: number;
    currentSpeedKmh: number;
    predictedSpeedKmh: number;
    risk: SeverityLevel;
  }[];
  explanationRisk: string;
  explanationTradeoff: string;
  steps?: {
    instruction: string;
    distance: string;
    estimatedDuration: string;
  }[];
}

export interface CopilotAnalysisResponse {
  assessment: string;
  recommendation: string;
  confidenceScore: number;
  thinking?: string;
  secondaryRisks?: string[];
  evidenceCitations?: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  groundingSources?: { title: string; uri: string }[];
}

export interface CitizenAlert {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'PREDICTED_DISRUPTION' | 'ROUTE_RISK_INCREASED' | 'EMERGENCY_CORRIDOR' | 'INCIDENT_NEARBY';
  severity: SeverityLevel;
  junctionCode?: string;
  classification: DataClassification;
  read: boolean;
  actionUrl?: string;
}

export interface CitizenFeedbackReport {
  id: string;
  timestamp: string;
  reportedBy: string;
  category: 'ACCIDENT' | 'ROAD_BLOCKAGE' | 'HEAVY_TRAFFIC' | 'BROKEN_VEHICLE' | 'FLOODING' | 'CONSTRUCTION' | 'WRONG_MAP_INFO' | 'OTHER';
  locationName: string;
  description: string;
  status: 'UNVERIFIED' | 'INVESTIGATING' | 'CONFIRMED' | 'RESOLVED';
}

export interface SystemServiceStatus {
  name: string;
  provider: string;
  status: 'AVAILABLE' | 'DEGRADED' | 'UNAVAILABLE';
  latencyMs: number;
  lastHeartbeatSecondsAgo: number;
  mode: AppMode;
  notes?: string;
}
