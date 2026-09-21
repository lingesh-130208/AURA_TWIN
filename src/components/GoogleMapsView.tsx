import React, { useEffect, useRef, useState } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
  useMapsLibrary
} from '@vis.gl/react-google-maps';
import {
  AlertTriangle,
  Car,
  Navigation
} from 'lucide-react';
import { Junction, RoadSegment, TrafficIncident, RouteAlternative, SeverityLevel } from '../types/traffic';

interface GoogleMapsViewProps {
  junctions: Junction[];
  segments: RoadSegment[];
  incidents: TrafficIncident[];
  routes?: RouteAlternative[];
  selectedRouteId?: string;
  onSelectRoute?: (routeId: string) => void;
  selectedJunctionCode?: string;
  onSelectJunction?: (junction: Junction) => void;
  selectedSegmentId?: string;
  onSelectSegment?: (segment: RoadSegment) => void;
  showEmergencyCorridor?: boolean;
  showCascadePropagation?: boolean;
  interactiveMode?: 'ADMIN' | 'CITIZEN';
  className?: string;
}

// Regional center coordinates across Tamil Nadu major urban hubs
const TAMIL_NADU_REGIONS: Record<string, { name: string; center: { lat: number; lng: number }; zoom: number }> = {
  chennai: { name: 'Chennai Corridor', center: { lat: 13.0674, lng: 80.2600 }, zoom: 13 },
  coimbatore: { name: 'Coimbatore Hub', center: { lat: 11.0168, lng: 76.9558 }, zoom: 13 },
  madurai: { name: 'Madurai City', center: { lat: 9.9252, lng: 78.1198 }, zoom: 13 },
  trichy: { name: 'Tiruchirappalli', center: { lat: 10.7905, lng: 78.7047 }, zoom: 13 },
  salem: { name: 'Salem Junction', center: { lat: 11.6643, lng: 78.1460 }, zoom: 13 },
  tirunelveli: { name: 'Tirunelveli', center: { lat: 8.7139, lng: 77.7567 }, zoom: 13 },
  erode: { name: 'Erode Perundurai', center: { lat: 11.3410, lng: 77.7172 }, zoom: 13 },
  vellore: { name: 'Vellore Smart Link', center: { lat: 12.9165, lng: 79.1325 }, zoom: 13 }
};

// Polyline and Traffic Layer Subcomponent rendered inside <Map>
const GoogleMapsOverlays: React.FC<{
  routes: RouteAlternative[];
  selectedRouteId?: string;
  onSelectRoute?: (routeId: string) => void;
  showTrafficLayer: boolean;
  regionCenter: { lat: number; lng: number };
  regionZoom: number;
}> = ({ routes, selectedRouteId, onSelectRoute, showTrafficLayer, regionCenter, regionZoom }) => {
  const map = useMap();
  const mapsLib = useMapsLibrary('maps');
  const polylinesRef = useRef<any[]>([]);
  const trafficLayerRef = useRef<any>(null);

  // Sync center and zoom when region selector changes
  useEffect(() => {
    if (!map) return;
    map.setCenter(regionCenter);
    map.setZoom(regionZoom);
  }, [map, regionCenter, regionZoom]);

  // Traffic Layer toggle
  useEffect(() => {
    if (!map || typeof window === 'undefined' || !(window as any).google?.maps) return;
    const gmaps = (window as any).google.maps;

    if (showTrafficLayer) {
      if (!trafficLayerRef.current) {
        trafficLayerRef.current = new gmaps.TrafficLayer();
      }
      trafficLayerRef.current.setMap(map);
    } else if (trafficLayerRef.current) {
      trafficLayerRef.current.setMap(null);
    }
    return () => {
      trafficLayerRef.current?.setMap(null);
    };
  }, [map, showTrafficLayer]);

  // Draw Route Polylines
  useEffect(() => {
    if (!map || !mapsLib || typeof window === 'undefined' || !(window as any).google?.maps) return;
    const gmaps = (window as any).google.maps;

    // Clear prior polylines
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    routes.forEach((route) => {
      const isSelected = selectedRouteId === route.id;
      const path = route.polylineCoordinates.map(([lng, lat]) => ({ lat, lng }));

      const strokeColor =
        route.futureRiskSeverity === 'CRITICAL'
          ? '#f43f5e'
          : route.futureRiskSeverity === 'HIGH'
          ? '#f97316'
          : route.futureRiskSeverity === 'MODERATE'
          ? '#eab308'
          : '#10b981';

      const polyline = new gmaps.Polyline({
        path,
        geodesic: true,
        strokeColor: isSelected ? strokeColor : '#475569',
        strokeOpacity: isSelected ? 0.95 : 0.45,
        strokeWeight: isSelected ? 6 : 3.5,
        zIndex: isSelected ? 100 : 10,
        map
      });

      polyline.addListener('click', () => {
        onSelectRoute?.(route.id);
      });

      polylinesRef.current.push(polyline);
    });

    return () => {
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
    };
  }, [map, mapsLib, routes, selectedRouteId, onSelectRoute]);

  return null;
};

export const GoogleMapsView: React.FC<GoogleMapsViewProps> = ({
  junctions,
  segments: _segments,
  incidents,
  routes = [],
  selectedRouteId,
  onSelectRoute,
  selectedJunctionCode,
  onSelectJunction,
  interactiveMode: _interactiveMode = 'ADMIN',
  className = 'h-[500px]'
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  const [selectedRegion, setSelectedRegion] = useState('chennai');
  const [showTrafficLayer, setShowTrafficLayer] = useState(true);
  const [activeJunctionInfo, setActiveJunctionInfo] = useState<Junction | null>(null);
  const [activeIncidentInfo, setActiveIncidentInfo] = useState<TrafficIncident | null>(null);

  const region = TAMIL_NADU_REGIONS[selectedRegion] || TAMIL_NADU_REGIONS.chennai;

  const handleJunctionMarkerClick = (j: Junction) => {
    setActiveIncidentInfo(null);
    setActiveJunctionInfo(j);
    onSelectJunction?.(j);
  };

  const handleIncidentMarkerClick = (inc: TrafficIncident) => {
    setActiveJunctionInfo(null);
    setActiveIncidentInfo(inc);
  };

  const getSeverityBadgeColor = (severity: SeverityLevel) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-rose-500/20 text-rose-300 border-rose-600/50';
      case 'HIGH': return 'bg-orange-500/20 text-orange-300 border-orange-600/50';
      case 'MODERATE': return 'bg-yellow-500/20 text-yellow-300 border-yellow-600/50';
      case 'LOW': return 'bg-emerald-500/20 text-emerald-300 border-emerald-600/50';
      default: return 'bg-neutral-800 text-neutral-300 border-neutral-700';
    }
  };

  return (
    <div className={`relative w-full overflow-hidden bg-neutral-950 rounded-xl border border-neutral-800 select-none ${className}`}>
      {/* Top Floating Controls */}
      <div className="absolute top-3 left-3 z-20 flex items-center space-x-2">
        {/* Region Selector */}
        <select
          id="google-maps-region-select"
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="text-xs font-mono bg-neutral-900/90 backdrop-blur border border-neutral-700 rounded-lg px-2.5 py-1.5 text-neutral-200 focus:outline-none focus:border-cyan-500 shadow-lg cursor-pointer"
        >
          {Object.entries(TAMIL_NADU_REGIONS).map(([key, item]) => (
            <option key={key} value={key} className="bg-neutral-900 text-neutral-100">
              {item.name}
            </option>
          ))}
        </select>

        {/* Live Traffic Overlay Toggle */}
        <button
          type="button"
          onClick={() => setShowTrafficLayer(!showTrafficLayer)}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium border shadow-lg transition-colors backdrop-blur ${
            showTrafficLayer
              ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
              : 'bg-neutral-900/80 border-neutral-700 text-neutral-400 hover:text-neutral-200'
          }`}
          title="Toggle Google Maps Live Traffic Layer"
        >
          <Car className="w-3.5 h-3.5" />
          <span>Traffic Layer {showTrafficLayer ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Google Maps Container via @vis.gl/react-google-maps */}
      <div className="w-full h-full">
        <APIProvider apiKey={apiKey} libraries={['marker', 'maps']}>
          <Map
            mapId="DEMO_MAP_ID"
            defaultCenter={region.center}
            defaultZoom={region.zoom}
            gestureHandling="greedy"
            disableDefaultUI={false}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            className="w-full h-full"
          >
            {/* Custom Overlay Logic: Polylines, TrafficLayer, & Bounds */}
            <GoogleMapsOverlays
              routes={routes}
              selectedRouteId={selectedRouteId}
              onSelectRoute={onSelectRoute}
              showTrafficLayer={showTrafficLayer}
              regionCenter={region.center}
              regionZoom={region.zoom}
            />

            {/* Junctions Advanced Markers */}
            {junctions.map((j) => {
              const isSelected = selectedJunctionCode === j.code;
              const isCritical = j.riskSeverity === 'CRITICAL';
              const isHigh = j.riskSeverity === 'HIGH';

              const pinBg = isSelected
                ? '#06b6d4'
                : isCritical
                ? '#f43f5e'
                : isHigh
                ? '#f97316'
                : '#10b981';

              const pinBorder = isSelected
                ? '#0891b2'
                : isCritical
                ? '#9f1239'
                : isHigh
                ? '#c2410c'
                : '#047857';

              return (
                <AdvancedMarker
                  key={j.code}
                  position={{ lat: j.coordinates[1], lng: j.coordinates[0] }}
                  title={`${j.code} - ${j.name}`}
                  onClick={() => handleJunctionMarkerClick(j)}
                  zIndex={isSelected ? 50 : 20}
                >
                  <Pin
                    background={pinBg}
                    borderColor={pinBorder}
                    glyphColor="#ffffff"
                    scale={isSelected ? 1.25 : 1.0}
                  >
                    <span className="text-[9px] font-bold font-mono">{j.code}</span>
                  </Pin>
                </AdvancedMarker>
              );
            })}

            {/* Active Traffic Incidents Markers */}
            {incidents.map((inc) => {
              const matchingJunction = junctions.find((j) => j.id === inc.junctionId || j.code === 'J7');
              const coords: [number, number] = matchingJunction ? matchingJunction.coordinates : [80.2790, 13.0680];

              return (
                <AdvancedMarker
                  key={inc.id}
                  position={{ lat: coords[1], lng: coords[0] }}
                  title={`${inc.type}: ${inc.locationName}`}
                  onClick={() => handleIncidentMarkerClick(inc)}
                  zIndex={40}
                >
                  <div className="flex items-center justify-center p-1.5 rounded-full bg-rose-600 text-white shadow-lg border-2 border-white animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                </AdvancedMarker>
              );
            })}

            {/* Junction InfoWindow */}
            {activeJunctionInfo && (
              <InfoWindow
                position={{
                  lat: activeJunctionInfo.coordinates[1],
                  lng: activeJunctionInfo.coordinates[0]
                }}
                onCloseClick={() => setActiveJunctionInfo(null)}
                pixelOffset={[0, -32]}
              >
                <div className="p-2 text-neutral-900 font-sans text-xs max-w-xs space-y-1.5">
                  <div className="flex items-center justify-between border-b pb-1">
                    <span className="font-bold text-neutral-900 font-mono">
                      {activeJunctionInfo.code} — {activeJunctionInfo.name}
                    </span>
                    <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded border ${getSeverityBadgeColor(activeJunctionInfo.riskSeverity)}`}>
                      {activeJunctionInfo.riskSeverity}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[11px] text-neutral-600">
                    <div>Queue: <strong>{activeJunctionInfo.currentQueueMeters}m</strong></div>
                    <div>Pressure: <strong>{activeJunctionInfo.capacityPressurePercent}%</strong></div>
                    <div>Phase Left: <strong>{activeJunctionInfo.currentPhaseSecondsRemaining}s</strong></div>
                    <div>Spillback: <strong>{activeJunctionInfo.spillbackProbabilityPercent}%</strong></div>
                  </div>
                  {activeJunctionInfo.predictedEvent && (
                    <div className="text-[10px] text-rose-600 pt-1 border-t font-semibold">
                      Predicted: {activeJunctionInfo.predictedEvent}
                    </div>
                  )}
                </div>
              </InfoWindow>
            )}

            {/* Incident InfoWindow */}
            {activeIncidentInfo && (
              <InfoWindow
                position={{
                  lat: (junctions.find((j) => j.id === activeIncidentInfo.junctionId || j.code === 'J7')?.coordinates || [80.2790, 13.0680])[1],
                  lng: (junctions.find((j) => j.id === activeIncidentInfo.junctionId || j.code === 'J7')?.coordinates || [80.2790, 13.0680])[0]
                }}
                onCloseClick={() => setActiveIncidentInfo(null)}
                pixelOffset={[0, -24]}
              >
                <div className="p-2 text-neutral-900 font-sans text-xs max-w-xs space-y-1">
                  <div className="flex items-center space-x-1.5 text-rose-600 font-bold border-b pb-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{activeIncidentInfo.type}</span>
                  </div>
                  <div className="font-semibold text-neutral-800">{activeIncidentInfo.locationName}</div>
                  <div className="text-[11px] text-neutral-600">{activeIncidentInfo.description}</div>
                  <div className="text-[10px] text-neutral-500">
                    Duration: ~{activeIncidentInfo.expectedDurationMinutes} min • Source: {activeIncidentInfo.source}
                  </div>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      </div>

      {/* Legend Footer */}
      <div className="absolute bottom-3 left-3 z-20 hidden md:flex items-center space-x-3 px-3 py-1.5 rounded-lg bg-neutral-900/90 backdrop-blur border border-neutral-800 text-[11px] font-mono text-neutral-300 shadow-xl">
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>Optimal</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
          <span>Moderate</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
          <span>High Congestion</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          <span>Critical Spillback</span>
        </div>
        <span className="text-neutral-500">|</span>
        <span className="text-cyan-400">Powered by Google Maps Platform</span>
      </div>
    </div>
  );
};
