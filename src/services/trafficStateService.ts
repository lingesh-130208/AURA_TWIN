import {
  Junction,
  RoadSegment,
  TrafficIncident,
  CascadeEvent,
  CascadeRelationship,
  ScenarioResult,
  RouteAlternative,
  CitizenAlert,
  OperatorAction,
  CitizenFeedbackReport,
  AppMode
} from '../types/traffic';
import {
  CORRIDOR_JUNCTIONS,
  CORRIDOR_SEGMENTS,
  CORRIDOR_INCIDENTS,
  CASCADE_EVENTS,
  CASCADE_RELATIONSHIPS,
  DEFAULT_SCENARIOS,
  DEMO_ROUTE_ALTERNATIVES,
  INITIAL_CITIZEN_ALERTS,
  INITIAL_AUDIT_LOGS
} from './mockTrafficData';

class TrafficStateService {
  private junctions: Junction[] = JSON.parse(JSON.stringify(CORRIDOR_JUNCTIONS));
  private segments: RoadSegment[] = JSON.parse(JSON.stringify(CORRIDOR_SEGMENTS));
  private incidents: TrafficIncident[] = JSON.parse(JSON.stringify(CORRIDOR_INCIDENTS));
  private cascadeEvents: CascadeEvent[] = JSON.parse(JSON.stringify(CASCADE_EVENTS));
  private cascadeRelationships: CascadeRelationship[] = JSON.parse(JSON.stringify(CASCADE_RELATIONSHIPS));
  private scenarios: ScenarioResult[] = JSON.parse(JSON.stringify(DEFAULT_SCENARIOS));
  private routes: RouteAlternative[] = JSON.parse(JSON.stringify(DEMO_ROUTE_ALTERNATIVES));
  private alerts: CitizenAlert[] = JSON.parse(JSON.stringify(INITIAL_CITIZEN_ALERTS));
  private auditLogs: OperatorAction[] = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));
  private feedbackReports: CitizenFeedbackReport[] = [
    {
      id: 'fb-1',
      timestamp: '18 mins ago',
      reportedBy: 'Alex Chen',
      category: 'ACCIDENT',
      locationName: 'Central Plaza Apex (J7)',
      description: 'Minor bumper collision blocking center lane, police cruiser just arrived.',
      status: 'CONFIRMED'
    }
  ];

  private appMode: AppMode = 'DEMO';
  private activeIntervention: string | null = null;
  private listeners: (() => void)[] = [];

  public getAppMode(): AppMode {
    return this.appMode;
  }

  public setAppMode(mode: AppMode): void {
    this.appMode = mode;
    this.notify();
  }

  public getJunctions(): Junction[] {
    return this.junctions;
  }

  public getSegments(): RoadSegment[] {
    return this.segments;
  }

  public getIncidents(): TrafficIncident[] {
    return this.incidents;
  }

  public getCascadeEvents(): CascadeEvent[] {
    return this.cascadeEvents;
  }

  public getCascadeRelationships(): CascadeRelationship[] {
    return this.cascadeRelationships;
  }

  public getScenarios(): ScenarioResult[] {
    return this.scenarios;
  }

  public getRoutes(): RouteAlternative[] {
    return this.routes;
  }

  public getAlerts(): CitizenAlert[] {
    return this.alerts;
  }

  public getAuditLogs(): OperatorAction[] {
    return this.auditLogs;
  }

  public getFeedbackReports(): CitizenFeedbackReport[] {
    return this.feedbackReports;
  }

  public getActiveIntervention(): string | null {
    return this.activeIntervention;
  }

  // Operator Decisions: ACCEPT, MODIFY, REJECT
  public acceptIntervention(scenarioId: string, operatorUsername: string): { success: boolean; message: string } {
    const scenario = this.scenarios.find(s => s.scenarioId === scenarioId);
    if (!scenario) return { success: false, message: 'Scenario not found' };

    this.activeIntervention = scenarioId;

    // Apply simulated physical updates across the corridor network
    if (scenarioId === 'scen-a' || scenarioId === 'scen-ab') {
      const j7 = this.junctions.find(j => j.code === 'J7');
      if (j7) {
        j7.capacityPressurePercent = scenarioId === 'scen-ab' ? 58 : 68;
        j7.spillbackProbabilityPercent = scenarioId === 'scen-ab' ? 24 : 34;
        j7.currentQueueMeters = scenarioId === 'scen-ab' ? 95 : 140;
        j7.riskSeverity = 'MODERATE';
      }

      const spineSeg = this.segments.find(s => s.id === 'seg-5-7');
      if (spineSeg) {
        spineSeg.currentSpeedKmh = 29;
        spineSeg.capacityStressPercent = 64;
        spineSeg.estimatedQueueMeters = 85;
        spineSeg.predictedRisk = 'MODERATE';
      }

      // Cascade event 1 mitigated
      const e1 = this.cascadeEvents.find(e => e.id === 'e1');
      if (e1) {
        e1.status = 'MITIGATED';
        e1.probabilityPercent = 28;
      }

      // Update Citizen Route A risk
      const routeA = this.routes.find(r => r.id === 'route-a');
      if (routeA) {
        routeA.gridlockRiskPercent = scenarioId === 'scen-ab' ? 19 : 28;
        routeA.futureRiskSeverity = 'MODERATE';
        routeA.estimatedDurationMinutes = 24;
        routeA.explanationRisk = 'Intervention deployed by Traffic Control (Signal flush active). Spillback risk dampened.';
      }

      // Broadcast Citizen Alert
      const alert: CitizenAlert = {
        id: `al-${Date.now()}`,
        timestamp: 'Just now',
        title: 'Traffic Control Intervention Deployed',
        message: `Signal phase extension activated at Central Plaza (J7). Route A future gridlock risk reduced to ${routeA?.gridlockRiskPercent || 28}%.`,
        type: 'ROUTE_RISK_INCREASED',
        severity: 'MODERATE',
        junctionCode: 'J7',
        classification: 'SIMULATED',
        read: false,
        actionUrl: '/citizen/routes'
      };
      this.alerts.unshift(alert);
    }

    // Record audit entry
    const action: OperatorAction = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      operatorUsername,
      actionType: 'ACCEPT_INTERVENTION',
      scenarioId,
      details: `Accepted ${scenario.name}. Human authorization confirmed. Digital twin state transitioned.`,
      correlationId: `corr-${Math.floor(10000 + Math.random() * 90000)}`
    };
    this.auditLogs.unshift(action);

    this.notify();
    return { success: true, message: `Intervention ${scenario.name} accepted and deployed to digital twin.` };
  }

  public modifyIntervention(
    scenarioId: string,
    params: { greenExtensionSeconds: number; diversionFraction: number },
    operatorUsername: string
  ): { success: boolean; newScenario: ScenarioResult } {
    const customId = `scen-custom-${Date.now()}`;
    const newScenario: ScenarioResult = {
      scenarioId: customId,
      name: `MODIFIED — Extension ${params.greenExtensionSeconds}s / Diversion ${params.diversionFraction}%`,
      type: 'COMBINED',
      affectedNodesCount: params.diversionFraction > 20 ? 3 : 4,
      cascadeDurationMinutes: Math.max(5, 12 - Math.floor(params.greenExtensionSeconds / 3)),
      maxSeverityScore: Math.max(0.45, 0.85 - (params.greenExtensionSeconds * 0.015 + params.diversionFraction * 0.006)),
      recoveryTimeMinutes: Math.max(6, 15 - Math.floor(params.greenExtensionSeconds / 2)),
      travelTimeImpactPercent: -Math.min(35, 15 + Math.floor(params.greenExtensionSeconds * 0.6)),
      emergencyCorridorImpactScore: 0.28,
      primaryBenefit: `Custom calibration: ${params.greenExtensionSeconds}s extension + ${params.diversionFraction}% diversion`,
      secondaryEffect: `Modulated secondary impact on J8 with ${(params.diversionFraction * 1.2).toFixed(0)}% spill risk`,
      secondaryEffectProbabilityPercent: Math.min(65, Math.floor(params.diversionFraction * 1.3)),
      uncertaintyScore: 0.22,
      classification: 'SIMULATED'
    };

    this.scenarios.push(newScenario);

    const action: OperatorAction = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      operatorUsername,
      actionType: 'MODIFY_INTERVENTION',
      scenarioId: customId,
      details: `Operator modified scenario parameters: GreenExtension=${params.greenExtensionSeconds}s, DiversionFraction=${params.diversionFraction}%`,
      correlationId: `corr-${Math.floor(10000 + Math.random() * 90000)}`
    };
    this.auditLogs.unshift(action);

    this.notify();
    return { success: true, newScenario };
  }

  public rejectIntervention(scenarioId: string, operatorUsername: string, reason: string): { success: boolean } {
    this.activeIntervention = null;

    const action: OperatorAction = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      operatorUsername,
      actionType: 'REJECT_INTERVENTION',
      scenarioId,
      details: `Operator rejected scenario ${scenarioId}. Reason: ${reason || 'Operator discretion - baseline maintained.'}`,
      correlationId: `corr-${Math.floor(10000 + Math.random() * 90000)}`
    };
    this.auditLogs.unshift(action);

    this.notify();
    return { success: true };
  }

  public submitCitizenFeedback(report: Omit<CitizenFeedbackReport, 'id' | 'timestamp' | 'status'>): CitizenFeedbackReport {
    const fullReport: CitizenFeedbackReport = {
      ...report,
      id: `fb-${Date.now()}`,
      timestamp: 'Just now',
      status: 'UNVERIFIED'
    };
    this.feedbackReports.unshift(fullReport);

    // Operator audit trail
    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      operatorUsername: 'citizen',
      actionType: 'CITIZEN_ALERT_DISPATCH',
      details: `Citizen submitted issue report (${fullReport.category}) at ${fullReport.locationName}. Queued for verification.`,
      correlationId: `corr-${Math.floor(10000 + Math.random() * 90000)}`
    });

    this.notify();
    return fullReport;
  }

  public markAlertRead(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.read = true;
      this.notify();
    }
  }

  public resetDemo(): void {
    this.junctions = JSON.parse(JSON.stringify(CORRIDOR_JUNCTIONS));
    this.segments = JSON.parse(JSON.stringify(CORRIDOR_SEGMENTS));
    this.incidents = JSON.parse(JSON.stringify(CORRIDOR_INCIDENTS));
    this.cascadeEvents = JSON.parse(JSON.stringify(CASCADE_EVENTS));
    this.cascadeRelationships = JSON.parse(JSON.stringify(CASCADE_RELATIONSHIPS));
    this.scenarios = JSON.parse(JSON.stringify(DEFAULT_SCENARIOS));
    this.routes = JSON.parse(JSON.stringify(DEMO_ROUTE_ALTERNATIVES));
    this.alerts = JSON.parse(JSON.stringify(INITIAL_CITIZEN_ALERTS));
    this.activeIntervention = null;
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(l => l());
  }
}

export const trafficStateService = new TrafficStateService();
