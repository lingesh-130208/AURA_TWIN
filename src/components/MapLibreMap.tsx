import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Navigation,
  AlertTriangle,
  Siren,
  MapPin,
  Maximize2
} from 'lucide-react';
import { Junction, RoadSegment, TrafficIncident, RouteAlternative, SeverityLevel } from '../types/traffic';

interface MapLibreMapProps {
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

export const TAMIL_NADU_REGIONS = [
  { id: 'chennai', name: 'Chennai Central Arterial', center: [80.2707, 13.0827] as [number, number], zoom: 13 },
  { id: 'coimbatore', name: 'Coimbatore Bypass Ring', center: [76.9558, 11.0168] as [number, number], zoom: 12 },
  { id: 'madurai', name: 'Madurai Core Corridor', center: [78.1198, 9.9252] as [number, number], zoom: 12 },
  { id: 'trichy', name: 'Tiruchirappalli Junction', center: [78.6856, 10.7905] as [number, number], zoom: 12 },
  { id: 'salem', name: 'Salem Expressway Link', center: [78.1460, 11.6643] as [number, number], zoom: 12 },
  { id: 'tirunelveli', name: 'Tirunelveli Gateway', center: [77.7567, 8.7139] as [number, number], zoom: 12 },
  { id: 'erode', name: 'Erode Smart Corridor', center: [77.7172, 11.3410] as [number, number], zoom: 12 },
  { id: 'vellore', name: 'Vellore Transit Arc', center: [79.1325, 12.9165] as [number, number], zoom: 12 },
  { id: 'statewide', name: 'Tamil Nadu Statewide View', center: [78.6569, 11.1271] as [number, number], zoom: 7.2 }
];

export const MapLibreMap: React.FC<MapLibreMapProps> = ({
  junctions,
  segments,
  incidents,
  routes = [],
  selectedRouteId,
  onSelectRoute,
  selectedJunctionCode,
  onSelectJunction,
  selectedSegmentId,
  onSelectSegment,
  showEmergencyCorridor = false,
  showCascadePropagation = false,
  interactiveMode = 'ADMIN',
  className = 'h-[500px]'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const [selectedRegion, setSelectedRegion] = useState('chennai');
  const [showTrafficLayer, setShowTrafficLayer] = useState(true);
  const [showRiskLayer, setShowRiskLayer] = useState(true);
  const [showIncidentsLayer, setShowIncidentsLayer] = useState(true);
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize MapLibre GL instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Use Carto Dark Matter tiles for professional dark control room look
    const styleSpec: maplibregl.StyleSpecification = {
      version: 8,
      sources: {
        'carto-dark': {
          type: 'raster',
          tiles: [
            'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
            'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
            'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
          ],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors, © CARTO'
        }
      },
      layers: [
        {
          id: 'carto-dark-layer',
          type: 'raster',
          source: 'carto-dark',
          minzoom: 0,
          maxzoom: 20
        }
      ]
    };

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: styleSpec,
      center: [80.2707, 13.0827], // Default Chennai Corridor center
      zoom: 13.2,
      pitch: 35,
      bearing: -10,
      attributionControl: false
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'bottom-right');

    map.on('load', () => {
      setMapLoaded(true);
      map.resize();
    });

    mapRef.current = map;

    return () => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Region Center
  const handleRegionChange = (regionId: string) => {
    setSelectedRegion(regionId);
    const reg = TAMIL_NADU_REGIONS.find(r => r.id === regionId);
    if (reg && mapRef.current) {
      mapRef.current.flyTo({
        center: reg.center,
        zoom: reg.zoom,
        essential: true,
        duration: 1600
      });
    }
  };

  // Render Markers (Junctions and Incidents)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add Junction Markers
    junctions.forEach((j) => {
      const isSelected = selectedJunctionCode === j.code;
      const isCritical = j.riskSeverity === 'CRITICAL' || j.riskSeverity === 'HIGH';

      const el = document.createElement('div');
      el.className = 'cursor-pointer group';
      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          ${isCritical ? '<div class="absolute -inset-2 rounded-full bg-rose-500/40 animate-ping"></div>' : ''}
          <div class="relative px-2 py-1 rounded-md text-[11px] font-mono font-extrabold border shadow-lg transition-transform group-hover:scale-110 ${
            isSelected
              ? 'bg-cyan-500 text-neutral-950 border-white ring-2 ring-cyan-400'
              : j.riskSeverity === 'CRITICAL'
              ? 'bg-rose-950 text-rose-200 border-rose-600 ring-1 ring-rose-500'
              : j.riskSeverity === 'HIGH'
              ? 'bg-amber-950 text-amber-200 border-amber-600'
              : j.riskSeverity === 'MODERATE'
              ? 'bg-yellow-950 text-yellow-200 border-yellow-600'
              : 'bg-emerald-950 text-emerald-200 border-emerald-700'
          }">
            ${j.code}
          </div>
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectJunction?.(j);
      });

      const popup = new maplibregl.Popup({ offset: 15, closeButton: false }).setHTML(`
        <div class="p-2 bg-neutral-950 text-neutral-100 font-sans text-xs rounded-lg border border-neutral-800 shadow-xl max-w-xs">
          <div class="flex items-center justify-between pb-1 border-b border-neutral-800">
            <strong class="text-cyan-400 font-mono">${j.code} — ${j.name}</strong>
            <span class="text-[10px] px-1 rounded bg-neutral-800">${j.type}</span>
          </div>
          <div class="mt-1.5 space-y-1 text-[11px]">
            <div>Capacity Pressure: <strong class="${j.capacityPressurePercent > 80 ? 'text-rose-400' : 'text-emerald-400'}">${j.capacityPressurePercent}%</strong></div>
            <div>Queue Length: <strong>${j.currentQueueMeters}m</strong></div>
            <div>Spillback Risk: <strong class="${j.spillbackProbabilityPercent > 60 ? 'text-rose-400' : 'text-neutral-300'}">${j.spillbackProbabilityPercent}%</strong></div>
          </div>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(j.coordinates)
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });

    // Add Incident Markers
    if (showIncidentsLayer) {
      incidents.forEach((inc) => {
        const matchingJunction = junctions.find(j => j.id === inc.junctionId || j.code === 'J7');
        const coords: [number, number] = matchingJunction ? matchingJunction.coordinates : [80.2790, 13.0680];

        const el = document.createElement('div');
        el.className = 'cursor-pointer animate-bounce';
        el.innerHTML = `
          <div class="p-1.5 rounded-full bg-rose-600 border-2 border-white shadow-xl flex items-center justify-center text-white">
            <svg class="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 4l7.5 13h-15L12 6zm-1 5v4h2v-4h-2zm0 6v2h2v-2h-2z"/></svg>
          </div>
        `;

        const popup = new maplibregl.Popup({ offset: 15 }).setHTML(`
          <div class="p-2 bg-neutral-950 text-neutral-100 font-sans text-xs rounded-lg border border-rose-800 shadow-xl max-w-xs">
            <div class="font-bold text-rose-400">${inc.type}: ${inc.locationName}</div>
            <div class="text-[11px] text-neutral-300 mt-1">${inc.description}</div>
            <div class="text-[10px] text-neutral-400 font-mono mt-1">Severity: ${inc.severity} · Source: ${inc.source}</div>
          </div>
        `);

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat(coords)
          .setPopup(popup)
          .addTo(map);

        markersRef.current.push(marker);
      });
    }
  }, [junctions, incidents, selectedJunctionCode, showIncidentsLayer, mapLoaded, onSelectJunction]);

  // Render Routes and Segments GeoJSON Layers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Add Routes Sources and Layers if not already added
    routes.forEach((route) => {
      const sourceId = `route-source-${route.id}`;
      const layerId = `route-layer-${route.id}`;
      const isSelected = selectedRouteId === route.id;

      const geojson = {
        type: 'Feature' as const,
        properties: {
          id: route.id,
          name: route.name,
          tag: route.tag
        },
        geometry: {
          type: 'LineString' as const,
          coordinates: route.polylineCoordinates
        }
      };

      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: 'geojson',
          data: geojson
        });

        const color =
          route.tag === 'LOWER_FUTURE_RISK'
            ? '#10b981' // emerald
            : route.tag === 'FASTEST'
            ? '#f43f5e' // rose
            : '#06b6d4'; // cyan

        map.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': color,
            'line-width': isSelected ? 6 : 3.5,
            'line-opacity': isSelected ? 0.95 : 0.45
          }
        });

        // Click route
        map.on('click', layerId, () => {
          onSelectRoute?.(route.id);
        });
      } else {
        (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(geojson);
        if (map.getLayer(layerId)) {
          map.setPaintProperty(layerId, 'line-width', isSelected ? 6.5 : 3.5);
          map.setPaintProperty(layerId, 'line-opacity', isSelected ? 0.95 : 0.45);
        }
      }
    });
  }, [routes, selectedRouteId, mapLoaded, onSelectRoute]);

  const resetView = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [80.2707, 13.0827],
        zoom: 13.2,
        pitch: 35,
        bearing: -10,
        essential: true
      });
    }
  };

  return (
    <div className={`relative w-full overflow-hidden bg-[#090d14] rounded-xl border border-neutral-800 select-none ${className}`}>
      {/* Tamil Nadu Region Selector */}
      <div className="absolute top-3 left-3 z-20 flex items-center space-x-2 bg-neutral-900/90 backdrop-blur border border-neutral-700 rounded-lg p-1.5 shadow-lg max-w-[280px] sm:max-w-xs">
        <MapPin className="w-4 h-4 text-cyan-400 shrink-0 ml-1" />
        <select
          value={selectedRegion}
          onChange={(e) => handleRegionChange(e.target.value)}
          className="bg-transparent text-xs font-mono text-neutral-100 font-semibold focus:outline-none cursor-pointer pr-2 truncate"
        >
          {TAMIL_NADU_REGIONS.map((reg) => (
            <option key={reg.id} value={reg.id} className="bg-neutral-900 text-neutral-200">
              {reg.name}
            </option>
          ))}
        </select>
      </div>

      {/* Top Right Layer Controls */}
      <div className="absolute top-3 right-3 z-20 flex flex-col space-y-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="p-2 bg-neutral-900/90 backdrop-blur hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-lg border border-neutral-700 shadow-md transition-colors"
            title="Layer Visibility"
          >
            <Layers className="w-4 h-4" />
          </button>

          {showLayerMenu && (
            <div className="absolute right-0 mt-1 w-52 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl p-2 z-30 space-y-1 text-xs">
              <div className="text-[10px] font-mono text-neutral-400 uppercase font-semibold px-2 py-1 border-b border-neutral-800">
                Map Layers
              </div>
              <label className="flex items-center justify-between px-2 py-1.5 hover:bg-neutral-800 rounded cursor-pointer">
                <span>Traffic Flow Speeds</span>
                <input
                  type="checkbox"
                  checked={showTrafficLayer}
                  onChange={(e) => setShowTrafficLayer(e.target.checked)}
                  className="rounded bg-neutral-950 border-neutral-700 text-cyan-500"
                />
              </label>
              <label className="flex items-center justify-between px-2 py-1.5 hover:bg-neutral-800 rounded cursor-pointer">
                <span>Incidents & Hazards</span>
                <input
                  type="checkbox"
                  checked={showIncidentsLayer}
                  onChange={(e) => setShowIncidentsLayer(e.target.checked)}
                  className="rounded bg-neutral-950 border-neutral-700 text-cyan-500"
                />
              </label>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={resetView}
          className="p-2 bg-neutral-900/90 backdrop-blur hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-lg border border-neutral-700 shadow-md transition-colors"
          title="Reset Map View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Map Attribution & Provider Label */}
      <div className="absolute bottom-3 left-3 z-20 bg-neutral-950/80 backdrop-blur border border-neutral-800 rounded-lg px-2.5 py-1 text-[10px] font-mono text-neutral-400 space-x-2 flex items-center">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
        <span>MapLibre GL JS · OpenStreetMap & CARTO Raster Engine</span>
      </div>

      {/* Actual Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
