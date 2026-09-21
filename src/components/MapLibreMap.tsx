import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  Layers,
  RotateCcw,
  Navigation,
  MapPin,
  Crosshair,
  Compass,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';
import { Junction, RoadSegment, TrafficIncident, RouteAlternative, LocationDetails } from '../types/traffic';

interface MapLibreMapProps {
  junctions?: Junction[];
  segments?: RoadSegment[];
  incidents?: TrafficIncident[];
  routes?: RouteAlternative[];
  selectedRouteId?: string;
  onSelectRoute?: (routeId: string) => void;
  selectedJunctionCode?: string;
  onSelectJunction?: (junction: Junction) => void;
  selectedSegmentId?: string;
  onSelectSegment?: (segment: RoadSegment) => void;
  origin?: LocationDetails | null;
  destination?: LocationDetails | null;
  clickedLocation?: LocationDetails | null;
  onMapClick?: (lat: number, lng: number) => void;
  onSetClickedAsDestination?: () => void;
  onSetClickedAsOrigin?: () => void;
  showEmergencyCorridor?: boolean;
  showCascadePropagation?: boolean;
  interactiveMode?: 'ADMIN' | 'CITIZEN';
  className?: string;
}

export const TAMIL_NADU_REGIONS = [
  { id: 'chennai', name: 'Chennai Corridor', center: [80.2600, 13.0674] as [number, number], zoom: 12.8 },
  { id: 'trichy', name: 'Tiruchirappalli (Trichy)', center: [78.6900, 10.8200] as [number, number], zoom: 12.5 },
  { id: 'coimbatore', name: 'Coimbatore Hub', center: [76.9600, 11.0168] as [number, number], zoom: 12.5 },
  { id: 'madurai', name: 'Madurai Core', center: [78.1198, 9.9252] as [number, number], zoom: 12.5 },
  { id: 'salem', name: 'Salem Expressway Link', center: [78.1460, 11.6643] as [number, number], zoom: 12.5 },
  { id: 'vellore', name: 'Vellore Smart Transit', center: [79.1325, 12.9165] as [number, number], zoom: 12.5 },
  { id: 'statewide', name: 'Tamil Nadu Statewide Network', center: [78.6569, 11.1271] as [number, number], zoom: 7.2 }
];

export const MapLibreMap: React.FC<MapLibreMapProps> = ({
  junctions = [],
  segments = [],
  incidents = [],
  routes = [],
  selectedRouteId,
  onSelectRoute,
  selectedJunctionCode,
  onSelectJunction,
  selectedSegmentId,
  onSelectSegment,
  origin,
  destination,
  clickedLocation,
  onMapClick,
  onSetClickedAsDestination,
  onSetClickedAsOrigin,
  showEmergencyCorridor = false,
  showCascadePropagation = false,
  interactiveMode = 'CITIZEN',
  className = 'h-[520px]'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  // Markers references
  const originMarkerRef = useRef<maplibregl.Marker | null>(null);
  const destinationMarkerRef = useRef<maplibregl.Marker | null>(null);
  const clickedMarkerRef = useRef<maplibregl.Marker | null>(null);
  const junctionMarkersRef = useRef<maplibregl.Marker[]>([]);
  const incidentMarkersRef = useRef<maplibregl.Marker[]>([]);

  const [selectedRegion, setSelectedRegion] = useState('chennai');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showIncidentsLayer, setShowIncidentsLayer] = useState(true);
  const [showJunctionsLayer, setShowJunctionsLayer] = useState(interactiveMode === 'ADMIN');
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  // Auto-switch region selector when origin or destination changes
  useEffect(() => {
    const pt = destination || origin;
    if (!pt || !mapRef.current || !mapLoaded) return;

    // Check if near Trichy
    if (Math.abs(pt.latitude - 10.8) < 0.5 && Math.abs(pt.longitude - 78.7) < 0.5) {
      setSelectedRegion('trichy');
    } else if (Math.abs(pt.latitude - 13.0) < 0.5 && Math.abs(pt.longitude - 80.2) < 0.5) {
      setSelectedRegion('chennai');
    } else if (Math.abs(pt.latitude - 11.0) < 0.5 && Math.abs(pt.longitude - 77.0) < 0.5) {
      setSelectedRegion('coimbatore');
    } else if (Math.abs(pt.latitude - 9.9) < 0.5 && Math.abs(pt.longitude - 78.1) < 0.5) {
      setSelectedRegion('madurai');
    }
  }, [origin, destination, mapLoaded]);

  // Initialize MapLibre instance ONCE
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return; // Prevent duplicate initialization

    // High performance Carto Dark Matter raster tiles via same-origin proxy
    const styleSpec: maplibregl.StyleSpecification = {
      version: 8,
      sources: {
        'carto-dark': {
          type: 'raster',
          tiles: [
            '/api/tiles/{z}/{x}/{y}.png'
          ],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors, © CARTO'
        }
      },
      layers: [
        {
          id: 'base-dark-bg',
          type: 'background',
          paint: {
            'background-color': '#070b12'
          }
        },
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
      center: [80.2600, 13.0674],
      zoom: 12.8,
      pitch: 25,
      bearing: 0,
      attributionControl: false,
      transformRequest: (url, resourceType) => {
        if (resourceType === 'Tile' && url.includes('cartocdn.com')) {
          const match = url.match(/\/(\d+)\/(\d+)\/(\d+)\.png/);
          if (match) {
            return { url: `/api/tiles/${match[1]}/${match[2]}/${match[3]}.png` };
          }
        }
        return { url };
      }
    });

    // Suppress benign tile fetch aborts or network blips
    map.on('error', (e: any) => {
      const msg = e?.error?.message || '';
      const status = e?.error?.status;
      if (msg.includes('fetch') || msg.includes('AJAXError') || status === 0) {
        return;
      }
      console.warn('Map event notice:', msg);
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'bottom-right');

    map.on('load', () => {
      setMapLoaded(true);
      map.resize();
    });

    // Handle Map Click to pick location
    map.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      onMapClick?.(lat, lng);
    });

    mapRef.current = map;

    // Handle window and container resize with ResizeObserver
    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      originMarkerRef.current?.remove();
      destinationMarkerRef.current?.remove();
      clickedMarkerRef.current?.remove();
      junctionMarkersRef.current.forEach((m) => m.remove());
      incidentMarkersRef.current.forEach((m) => m.remove());
      map.remove();
      mapRef.current = null;
    };
  }, [onMapClick]);

  // Change Region
  const handleRegionChange = (regionId: string) => {
    setSelectedRegion(regionId);
    const reg = TAMIL_NADU_REGIONS.find((r) => r.id === regionId);
    if (reg && mapRef.current) {
      mapRef.current.flyTo({
        center: reg.center,
        zoom: reg.zoom,
        essential: true,
        duration: 1400
      });
    }
  };

  // Render ORIGIN Marker (Cyan Pin 'A')
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    if (originMarkerRef.current) {
      originMarkerRef.current.remove();
      originMarkerRef.current = null;
    }

    if (origin && origin.latitude && origin.longitude) {
      const el = document.createElement('div');
      el.className = 'cursor-pointer group';
      el.innerHTML = `
        <div class="relative flex flex-col items-center">
          <div class="absolute -top-1 w-6 h-6 rounded-full bg-cyan-500/40 animate-ping"></div>
          <div class="relative w-8 h-8 rounded-full bg-cyan-500 border-2 border-white shadow-xl flex items-center justify-center text-neutral-950 font-mono font-black text-xs">
            A
          </div>
          <div class="px-1.5 py-0.5 mt-0.5 rounded bg-neutral-950/90 border border-cyan-700 text-[10px] font-mono text-cyan-300 font-bold whitespace-nowrap shadow-md">
            FROM
          </div>
        </div>
      `;

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2 bg-neutral-950 text-neutral-100 font-sans text-xs rounded-lg border border-cyan-800 shadow-xl max-w-xs">
          <div class="font-bold text-cyan-400 font-mono">STARTING POINT (A)</div>
          <div class="text-white font-semibold mt-1">${origin.name}</div>
          <div class="text-[11px] text-neutral-400 mt-0.5">${origin.address}</div>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([origin.longitude, origin.latitude])
        .setPopup(popup)
        .addTo(map);

      originMarkerRef.current = marker;
    }
  }, [origin, mapLoaded]);

  // Render DESTINATION Marker (Rose/Red Pin 'B')
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    if (destinationMarkerRef.current) {
      destinationMarkerRef.current.remove();
      destinationMarkerRef.current = null;
    }

    if (destination && destination.latitude && destination.longitude) {
      const el = document.createElement('div');
      el.className = 'cursor-pointer group';
      el.innerHTML = `
        <div class="relative flex flex-col items-center">
          <div class="absolute -top-1 w-7 h-7 rounded-full bg-rose-500/50 animate-ping"></div>
          <div class="relative w-8 h-8 rounded-full bg-rose-600 border-2 border-white shadow-2xl flex items-center justify-center text-white font-mono font-black text-xs">
            B
          </div>
          <div class="px-1.5 py-0.5 mt-0.5 rounded bg-neutral-950/90 border border-rose-700 text-[10px] font-mono text-rose-300 font-bold whitespace-nowrap shadow-md">
            DESTINATION
          </div>
        </div>
      `;

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2 bg-neutral-950 text-neutral-100 font-sans text-xs rounded-lg border border-rose-800 shadow-xl max-w-xs">
          <div class="font-bold text-rose-400 font-mono">DESTINATION (B)</div>
          <div class="text-white font-semibold mt-1">${destination.name}</div>
          <div class="text-[11px] text-neutral-400 mt-0.5">${destination.address}</div>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([destination.longitude, destination.latitude])
        .setPopup(popup)
        .addTo(map);

      destinationMarkerRef.current = marker;

      // If no route exists yet, center on destination
      if (routes.length === 0) {
        map.flyTo({
          center: [destination.longitude, destination.latitude],
          zoom: 14,
          essential: true,
          duration: 1200
        });
      }
    }
  }, [destination, routes.length, mapLoaded]);

  // Render Clicked Location Marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    if (clickedMarkerRef.current) {
      clickedMarkerRef.current.remove();
      clickedMarkerRef.current = null;
    }

    if (clickedLocation) {
      const el = document.createElement('div');
      el.className = 'cursor-pointer animate-pulse';
      el.innerHTML = `
        <div class="p-1 rounded-full bg-amber-500 border-2 border-white shadow-xl text-neutral-950">
          <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/></svg>
        </div>
      `;

      const popupContent = document.createElement('div');
      popupContent.className = 'p-2.5 bg-neutral-950 text-white font-sans text-xs rounded-xl border border-neutral-800 shadow-2xl max-w-xs space-y-2';
      popupContent.innerHTML = `
        <div class="font-bold text-amber-400 font-mono flex items-center justify-between">
          <span>SELECTED LOCATION</span>
          <span class="text-[10px] text-neutral-400">${clickedLocation.selectedTime || ''}</span>
        </div>
        <div class="text-white font-semibold">${clickedLocation.name}</div>
        <div class="text-[11px] text-neutral-400">${clickedLocation.address}</div>
        <div class="text-[10px] text-neutral-500 font-mono">${clickedLocation.latitude.toFixed(5)}°, ${clickedLocation.longitude.toFixed(5)}°</div>
        <div class="flex items-center gap-1.5 pt-1">
          <button id="set-dest-btn" class="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white font-mono text-[10px] rounded font-bold cursor-pointer transition-colors flex-1">
            Set as Destination
          </button>
          <button id="set-origin-btn" class="px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-[10px] rounded font-bold cursor-pointer transition-colors flex-1">
            Set as Origin
          </button>
        </div>
      `;

      // Attach event listeners
      popupContent.querySelector('#set-dest-btn')?.addEventListener('click', () => {
        onSetClickedAsDestination?.();
      });
      popupContent.querySelector('#set-origin-btn')?.addEventListener('click', () => {
        onSetClickedAsOrigin?.();
      });

      const popup = new maplibregl.Popup({ offset: 15, closeButton: true })
        .setDOMContent(popupContent);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([clickedLocation.longitude, clickedLocation.latitude])
        .setPopup(popup)
        .addTo(map);

      marker.togglePopup();
      clickedMarkerRef.current = marker;
    }
  }, [clickedLocation, mapLoaded, onSetClickedAsDestination, onSetClickedAsOrigin]);

  // Render Junction Markers (Admin or toggled)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    junctionMarkersRef.current.forEach((m) => m.remove());
    junctionMarkersRef.current = [];

    if (!showJunctionsLayer) return;

    junctions.forEach((j) => {
      const isSelected = selectedJunctionCode === j.code;
      const el = document.createElement('div');
      el.className = 'cursor-pointer group';
      el.innerHTML = `
        <div class="relative px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border shadow-md ${
          isSelected
            ? 'bg-cyan-400 text-neutral-950 border-white ring-2 ring-cyan-400'
            : j.riskSeverity === 'CRITICAL'
            ? 'bg-rose-950 text-rose-300 border-rose-700'
            : j.riskSeverity === 'HIGH'
            ? 'bg-amber-950 text-amber-300 border-amber-700'
            : 'bg-neutral-900 text-neutral-300 border-neutral-700'
        }">
          ${j.code}
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectJunction?.(j);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(j.coordinates)
        .addTo(map);

      junctionMarkersRef.current.push(marker);
    });
  }, [junctions, selectedJunctionCode, showJunctionsLayer, mapLoaded, onSelectJunction]);

  // Render Incident Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    incidentMarkersRef.current.forEach((m) => m.remove());
    incidentMarkersRef.current = [];

    if (!showIncidentsLayer) return;

    incidents.forEach((inc) => {
      const matchJ = junctions.find((j) => j.id === inc.junctionId || j.code === 'J7');
      const coords: [number, number] = matchJ ? matchJ.coordinates : [80.2600, 13.0674];

      const el = document.createElement('div');
      el.className = 'cursor-pointer animate-bounce';
      el.innerHTML = `
        <div class="p-1 rounded-full bg-rose-600 border border-white shadow-xl flex items-center justify-center text-white" title="${inc.type}: ${inc.locationName}">
          <svg class="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 4l7.5 13h-15L12 6zm-1 5v4h2v-4h-2zm0 6v2h2v-2h-2z"/></svg>
        </div>
      `;

      const popup = new maplibregl.Popup({ offset: 15 }).setHTML(`
        <div class="p-2 bg-neutral-950 text-white font-sans text-xs rounded-lg border border-rose-800 shadow-xl max-w-xs">
          <div class="font-bold text-rose-400">${inc.type} · ${inc.locationName}</div>
          <div class="text-[11px] text-neutral-300 mt-1">${inc.description}</div>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(coords)
        .setPopup(popup)
        .addTo(map);

      incidentMarkersRef.current.push(marker);
    });
  }, [incidents, junctions, showIncidentsLayer, mapLoaded]);

  // Render Routes GeoJSON and Fit Bounds
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Track active layer and source IDs
    const activeRouteIds = new Set(routes.map((r) => r.id));

    routes.forEach((route) => {
      const sourceId = `route-source-${route.id}`;
      const layerId = `route-layer-${route.id}`;
      const casingLayerId = `route-casing-${route.id}`;
      const isSelected = selectedRouteId === route.id;

      const geojson: any = {
        type: 'Feature',
        properties: {
          id: route.id,
          name: route.name,
          tag: route.tag
        },
        geometry: {
          type: 'LineString',
          coordinates: route.polylineCoordinates
        }
      };

      const strokeColor =
        route.tag === 'LOWER_FUTURE_RISK'
          ? '#10b981' // emerald-500
          : route.tag === 'FASTEST'
          ? (route.futureRiskSeverity === 'CRITICAL' || route.futureRiskSeverity === 'HIGH' ? '#f43f5e' : '#06b6d4')
          : '#8b5cf6'; // purple-500

      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: 'geojson',
          data: geojson
        });

        // Background casing layer for high contrast
        map.addLayer({
          id: casingLayerId,
          type: 'line',
          source: sourceId,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#020617',
            'line-width': isSelected ? 9 : 6,
            'line-opacity': isSelected ? 0.9 : 0.6
          }
        });

        // Foreground route layer
        map.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': strokeColor,
            'line-width': isSelected ? 6.5 : 3.5,
            'line-opacity': isSelected ? 1 : 0.55
          }
        });

        // Click handler on route
        map.on('click', layerId, () => {
          onSelectRoute?.(route.id);
        });
      } else {
        (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(geojson);
        if (map.getLayer(layerId)) {
          map.setPaintProperty(layerId, 'line-width', isSelected ? 6.5 : 3.5);
          map.setPaintProperty(layerId, 'line-opacity', isSelected ? 1 : 0.55);
        }
        if (map.getLayer(casingLayerId)) {
          map.setPaintProperty(casingLayerId, 'line-width', isSelected ? 9 : 6);
          map.setPaintProperty(casingLayerId, 'line-opacity', isSelected ? 0.9 : 0.6);
        }
      }
    });

    // Auto fit map bounds when routes exist
    if (routes.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      let hasPoints = false;

      routes.forEach((r) => {
        r.polylineCoordinates.forEach(([lng, lat]) => {
          bounds.extend([lng, lat]);
          hasPoints = true;
        });
      });

      if (origin && origin.latitude && origin.longitude) {
        bounds.extend([origin.longitude, origin.latitude]);
      }
      if (destination && destination.latitude && destination.longitude) {
        bounds.extend([destination.longitude, destination.latitude]);
      }

      if (hasPoints) {
        map.fitBounds(bounds, {
          padding: { top: 75, bottom: 65, left: 65, right: 65 },
          maxZoom: 15,
          duration: 1200
        });
      }
    }
  }, [routes, selectedRouteId, mapLoaded, onSelectRoute, origin, destination]);

  // Reset View Button
  const handleResetView = () => {
    if (!mapRef.current) return;
    if (routes.length > 0 && origin && destination) {
      const bounds = new maplibregl.LngLatBounds();
      bounds.extend([origin.longitude, origin.latitude]);
      bounds.extend([destination.longitude, destination.latitude]);
      mapRef.current.fitBounds(bounds, { padding: 60, duration: 1000 });
    } else {
      const reg = TAMIL_NADU_REGIONS.find((r) => r.id === selectedRegion) || TAMIL_NADU_REGIONS[0];
      mapRef.current.flyTo({
        center: reg.center,
        zoom: reg.zoom,
        essential: true,
        duration: 1000
      });
    }
  };

  return (
    <div
      id="maplibre-map-container"
      className={`relative w-full overflow-hidden bg-[#070b12] rounded-2xl border border-neutral-800 shadow-2xl select-none ${className}`}
    >
      {/* Region Selector (Top Left) */}
      <div className="absolute top-3 left-3 z-20 flex items-center space-x-2 bg-neutral-900/95 backdrop-blur border border-neutral-700 rounded-xl p-1.5 shadow-xl max-w-[280px]">
        <MapPin className="w-4 h-4 text-cyan-400 shrink-0 ml-1" />
        <select
          value={selectedRegion}
          onChange={(e) => handleRegionChange(e.target.value)}
          className="bg-transparent text-xs font-mono text-neutral-100 font-semibold focus:outline-none cursor-pointer pr-2 truncate"
          title="Select Tamil Nadu Region"
        >
          {TAMIL_NADU_REGIONS.map((reg) => (
            <option key={reg.id} value={reg.id} className="bg-neutral-900 text-neutral-200">
              {reg.name}
            </option>
          ))}
        </select>
      </div>

      {/* Map Control Tools (Top Right) */}
      <div className="absolute top-3 right-3 z-20 flex flex-col space-y-2">
        {/* Layer Visibility Toggle */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="p-2.5 bg-neutral-900/95 backdrop-blur hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-xl border border-neutral-700 shadow-xl transition-colors cursor-pointer"
            title="Layer Settings"
          >
            <Layers className="w-4 h-4" />
          </button>

          {showLayerMenu && (
            <div className="absolute right-0 mt-1.5 w-52 bg-neutral-950/95 backdrop-blur border border-neutral-750 rounded-xl shadow-2xl p-2.5 z-30 space-y-2 text-xs font-mono">
              <div className="text-[10px] text-neutral-400 uppercase font-bold px-1 border-b border-neutral-800 pb-1">
                Map Layers
              </div>
              <label className="flex items-center justify-between px-1 py-1 hover:bg-neutral-900 rounded cursor-pointer">
                <span>Incidents & Hazards</span>
                <input
                  type="checkbox"
                  checked={showIncidentsLayer}
                  onChange={(e) => setShowIncidentsLayer(e.target.checked)}
                  className="rounded bg-neutral-900 border-neutral-700 text-cyan-500"
                />
              </label>
              <label className="flex items-center justify-between px-1 py-1 hover:bg-neutral-900 rounded cursor-pointer">
                <span>Junctions & Sensors</span>
                <input
                  type="checkbox"
                  checked={showJunctionsLayer}
                  onChange={(e) => setShowJunctionsLayer(e.target.checked)}
                  className="rounded bg-neutral-900 border-neutral-700 text-cyan-500"
                />
              </label>
            </div>
          )}
        </div>

        {/* Reset View Button */}
        <button
          type="button"
          onClick={handleResetView}
          className="p-2.5 bg-neutral-900/95 backdrop-blur hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-xl border border-neutral-700 shadow-xl transition-colors cursor-pointer"
          title="Reset Map View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Map Hint / Status (Bottom Left) */}
      <div className="absolute bottom-3 left-3 z-20 bg-neutral-950/85 backdrop-blur border border-neutral-800 rounded-xl px-3 py-1.5 text-[10px] font-mono text-neutral-400 flex items-center space-x-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
        <span>MapLibre GL JS · Tamil Nadu Arterial Road Network · Click map to pick point</span>
      </div>

      {/* Map Canvas Mount */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[480px]" />
    </div>
  );
};
