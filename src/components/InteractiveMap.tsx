import React, { useState, useRef } from 'react';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  AlertTriangle,
  Siren,
  Search,
  Eye,
  EyeOff,
  Navigation,
  Info,
  Globe,
  Map as MapIcon
} from 'lucide-react';
import { Junction, RoadSegment, TrafficIncident, RouteAlternative, SeverityLevel } from '../types/traffic';
import { MapLibreMap } from './MapLibreMap';
import { GoogleMapsView } from './GoogleMapsView';

interface InteractiveMapProps {
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

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
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
  // Map engine mode: Schematic Twin vs Google Maps vs MapLibre Geo
  const [mapEngine, setMapEngine] = useState<'SCHEMATIC' | 'GOOGLE_MAPS' | 'GEOGRAPHIC'>('GOOGLE_MAPS');

  // Map viewport scale and offset
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');

  // Layer toggles
  const [showTrafficLayer, setShowTrafficLayer] = useState(true);
  const [showRiskLayer, setShowRiskLayer] = useState(true);
  const [showIncidentsLayer, setShowIncidentsLayer] = useState(true);
  const [showJunctionsLayer, setShowJunctionsLayer] = useState(true);
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  // Convert GPS Coordinates to Local SVG Canvas (1000x700 viewBox)
  // Lat range: 13.045 to 13.105 (span ~0.06)
  // Lng range: 80.245 to 80.300 (span ~0.055)
  const toSvgCoords = (lng: number, lat: number): [number, number] => {
    const minLng = 80.2460;
    const maxLng = 80.2980;
    const minLat = 13.0460;
    const maxLat = 13.1020;

    const x = ((lng - minLng) / (maxLng - minLng)) * 880 + 60;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 560 + 70;
    return [Math.round(x), Math.round(y)];
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'BUTTON' || (e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const getSeverityStroke = (risk: SeverityLevel) => {
    switch (risk) {
      case 'CRITICAL': return '#f43f5e'; // rose-500
      case 'HIGH': return '#f97316'; // orange-500
      case 'MODERATE': return '#eab308'; // yellow-500
      case 'LOW': return '#10b981'; // emerald-500
      default: return '#64748b';
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.trim().toLowerCase();

    // Check junctions
    const foundJunction = junctions.find(j => j.code.toLowerCase() === q || j.name.toLowerCase().includes(q));
    if (foundJunction) {
      onSelectJunction?.(foundJunction);
      const [jx, jy] = toSvgCoords(foundJunction.coordinates[0], foundJunction.coordinates[1]);
      setPan({ x: 500 - jx * 1.5, y: 350 - jy * 1.5 });
      setZoom(1.5);
      return;
    }

    // Check segments
    const foundSegment = segments.find(s => s.name.toLowerCase().includes(q) || s.id.toLowerCase() === q);
    if (foundSegment) {
      onSelectSegment?.(foundSegment);
      return;
    }

    // Check routes
    const foundRoute = routes.find(r => r.name.toLowerCase().includes(q) || r.tag.toLowerCase().includes(q));
    if (foundRoute) {
      onSelectRoute?.(foundRoute.id);
    }
  };

  if (mapEngine === 'GOOGLE_MAPS') {
    return (
      <div className={`relative w-full ${className}`}>
        {/* Toggle Pill at Top Center */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center bg-neutral-900/95 backdrop-blur border border-neutral-700 rounded-lg p-1 shadow-xl">
          <button
            type="button"
            onClick={() => setMapEngine('SCHEMATIC')}
            className="px-2.5 py-1 text-xs font-mono rounded text-neutral-300 hover:text-white transition-colors flex items-center space-x-1"
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Digital Twin</span>
          </button>
          <button
            type="button"
            onClick={() => setMapEngine('GOOGLE_MAPS')}
            className="px-2.5 py-1 text-xs font-mono rounded bg-cyan-600 text-white font-semibold shadow-sm transition-colors flex items-center space-x-1"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Google Maps</span>
          </button>
          <button
            type="button"
            onClick={() => setMapEngine('GEOGRAPHIC')}
            className="px-2.5 py-1 text-xs font-mono rounded text-neutral-300 hover:text-white transition-colors flex items-center space-x-1"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>MapLibre</span>
          </button>
        </div>

        <GoogleMapsView
          junctions={junctions}
          segments={segments}
          incidents={incidents}
          routes={routes}
          selectedRouteId={selectedRouteId}
          onSelectRoute={onSelectRoute}
          selectedJunctionCode={selectedJunctionCode}
          onSelectJunction={onSelectJunction}
          selectedSegmentId={selectedSegmentId}
          onSelectSegment={onSelectSegment}
          showEmergencyCorridor={showEmergencyCorridor}
          showCascadePropagation={showCascadePropagation}
          interactiveMode={interactiveMode}
          className={className}
        />
      </div>
    );
  }

  if (mapEngine === 'GEOGRAPHIC') {
    return (
      <div className={`relative w-full ${className}`}>
        {/* Toggle Pill at Top Center */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center bg-neutral-900/95 backdrop-blur border border-neutral-700 rounded-lg p-1 shadow-xl">
          <button
            type="button"
            onClick={() => setMapEngine('SCHEMATIC')}
            className="px-2.5 py-1 text-xs font-mono rounded text-neutral-300 hover:text-white transition-colors flex items-center space-x-1"
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Digital Twin</span>
          </button>
          <button
            type="button"
            onClick={() => setMapEngine('GOOGLE_MAPS')}
            className="px-2.5 py-1 text-xs font-mono rounded text-neutral-300 hover:text-white transition-colors flex items-center space-x-1"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Google Maps</span>
          </button>
          <button
            type="button"
            onClick={() => setMapEngine('GEOGRAPHIC')}
            className="px-2.5 py-1 text-xs font-mono rounded bg-cyan-600 text-white font-semibold shadow-sm transition-colors flex items-center space-x-1"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>MapLibre</span>
          </button>
        </div>

        <MapLibreMap
          junctions={junctions}
          segments={segments}
          incidents={incidents}
          routes={routes}
          selectedRouteId={selectedRouteId}
          onSelectRoute={onSelectRoute}
          selectedJunctionCode={selectedJunctionCode}
          onSelectJunction={onSelectJunction}
          selectedSegmentId={selectedSegmentId}
          onSelectSegment={onSelectSegment}
          showEmergencyCorridor={showEmergencyCorridor}
          showCascadePropagation={showCascadePropagation}
          interactiveMode={interactiveMode}
          className={className}
        />
      </div>
    );
  }

  return (
    <div className={`relative w-full overflow-hidden bg-[#0a0f18] rounded-xl border border-neutral-800 select-none ${className}`}>
      {/* Search Bar on Map */}
      <div className="absolute top-3 left-3 z-20 w-72 sm:w-80">
        <form onSubmit={handleSearchSubmit} className="relative shadow-lg">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={interactiveMode === 'ADMIN' ? 'Search J1-J10, segment, or incident...' : 'Search street or route...'}
            className="w-full pl-8 pr-8 py-2 text-xs bg-neutral-900/90 backdrop-blur border border-neutral-700 rounded-lg text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-400 pointer-events-none" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-white text-xs"
            >
              ×
            </button>
          )}
        </form>
      </div>

      {/* Map Engine Toggle Pill */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 hidden sm:flex items-center bg-neutral-900/95 backdrop-blur border border-neutral-700 rounded-lg p-1 shadow-lg">
        <button
          type="button"
          onClick={() => setMapEngine('SCHEMATIC')}
          className="px-2.5 py-1 text-xs font-mono rounded bg-cyan-600 text-white font-semibold shadow-sm transition-colors flex items-center space-x-1"
        >
          <MapIcon className="w-3.5 h-3.5" />
          <span>Digital Twin</span>
        </button>
        <button
          type="button"
          onClick={() => setMapEngine('GOOGLE_MAPS')}
          className="px-2.5 py-1 text-xs font-mono rounded text-neutral-300 hover:text-white transition-colors flex items-center space-x-1"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Google Maps</span>
        </button>
        <button
          type="button"
          onClick={() => setMapEngine('GEOGRAPHIC')}
          className="px-2.5 py-1 text-xs font-mono rounded text-neutral-300 hover:text-white transition-colors flex items-center space-x-1"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>MapLibre</span>
        </button>
      </div>

      {/* Layer Toggles & Map Controls */}
      <div className="absolute top-3 right-3 z-20 flex flex-col space-y-2">
        {/* Layer Dropdown */}
        <div className="relative">
          <button
            id="map-layers-toggle"
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
                <span>Traffic Speed Flow</span>
                <input
                  type="checkbox"
                  checked={showTrafficLayer}
                  onChange={(e) => setShowTrafficLayer(e.target.checked)}
                  className="rounded bg-neutral-950 border-neutral-700 text-cyan-500"
                />
              </label>
              <label className="flex items-center justify-between px-2 py-1.5 hover:bg-neutral-800 rounded cursor-pointer">
                <span>Predicted Risk Halos</span>
                <input
                  type="checkbox"
                  checked={showRiskLayer}
                  onChange={(e) => setShowRiskLayer(e.target.checked)}
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
              <label className="flex items-center justify-between px-2 py-1.5 hover:bg-neutral-800 rounded cursor-pointer">
                <span>Junction Control Nodes</span>
                <input
                  type="checkbox"
                  checked={showJunctionsLayer}
                  onChange={(e) => setShowJunctionsLayer(e.target.checked)}
                  className="rounded bg-neutral-950 border-neutral-700 text-cyan-500"
                />
              </label>
            </div>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="flex flex-col bg-neutral-900/90 backdrop-blur rounded-lg border border-neutral-700 shadow-md overflow-hidden">
          <button
            onClick={() => setZoom(prev => Math.min(2.5, prev + 0.25))}
            className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-800 border-b border-neutral-800 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(0.75, prev - 0.25))}
            className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-800 border-b border-neutral-800 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
            title="Reset Map Center"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 z-20 bg-neutral-900/90 backdrop-blur border border-neutral-800 rounded-lg p-2.5 text-[11px] font-mono space-y-1.5 shadow-md">
        <div className="font-semibold text-neutral-300 uppercase tracking-wide flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>Corridor Network Status</span>
        </div>
        <div className="flex items-center space-x-3 text-neutral-400">
          <span className="flex items-center space-x-1"><span className="w-2.5 h-1 rounded bg-emerald-500"></span><span>Normal (&gt;35 km/h)</span></span>
          <span className="flex items-center space-x-1"><span className="w-2.5 h-1 rounded bg-yellow-500"></span><span>Moderate</span></span>
          <span className="flex items-center space-x-1"><span className="w-2.5 h-1 rounded bg-orange-500"></span><span>Congested</span></span>
          <span className="flex items-center space-x-1"><span className="w-2.5 h-1 rounded bg-rose-500"></span><span>Spillback / Stalled</span></span>
        </div>
      </div>

      {/* Active Corridor Attribution / Mode Banner */}
      <div className="absolute bottom-3 right-3 z-20 text-[10px] font-mono text-neutral-500 bg-neutral-950/80 px-2 py-1 rounded border border-neutral-800">
        © OpenStreetMap contributors · AURA-TWIN Spatial Sandbox
      </div>

      {/* Main SVG Vector Canvas */}
      <div
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          viewBox="0 0 1000 700"
          className="w-full h-full transition-transform duration-75"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '50% 50%'
          }}
        >
          <defs>
            {/* Pulsing halo filters */}
            <radialGradient id="criticalHalo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="emergencyHalo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </radialGradient>

            {/* Road flow dash animation */}
            <pattern id="roadDash" width="20" height="20" patternUnits="userSpaceOnUse">
              <line x1="0" y1="10" x2="10" y2="10" stroke="#38bdf8" strokeWidth="2" />
            </pattern>
          </defs>

          {/* Grid background reference lines */}
          <g stroke="#1a2234" strokeWidth="0.5" strokeDasharray="4,4">
            <line x1="100" y1="0" x2="100" y2="700" />
            <line x1="300" y1="0" x2="300" y2="700" />
            <line x1="500" y1="0" x2="500" y2="700" />
            <line x1="700" y1="0" x2="700" y2="700" />
            <line x1="900" y1="0" x2="900" y2="700" />
            <line x1="0" y1="150" x2="1000" y2="150" />
            <line x1="0" y1="350" x2="1000" y2="350" />
            <line x1="0" y1="550" x2="1000" y2="550" />
          </g>

          {/* Emergency Corridor Highlight Layer */}
          {showEmergencyCorridor && (
            <g id="emergency-corridor-layer">
              <path
                d="M 440 258 L 520 317 L 600 368 L 700 427 L 810 488"
                fill="none"
                stroke="#0284c7"
                strokeWidth="20"
                strokeOpacity="0.3"
                strokeLinecap="round"
                className="animate-pulse"
              />
              <path
                d="M 440 258 L 520 317 L 600 368 L 700 427 L 810 488"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="4"
                strokeDasharray="8,6"
              />
            </g>
          )}

          {/* Cascade Propagation Lines */}
          {showCascadePropagation && (
            <g id="cascade-propagation-layer">
              {/* E1 (J7) -> E2 (J6) */}
              <line
                x1="600" y1="368"
                x2="480" y2="390"
                stroke="#f43f5e"
                strokeWidth="3"
                strokeDasharray="6,4"
                className="animate-pulse"
              />
              {/* E1 (J7) -> E3 (J8) */}
              <line
                x1="600" y1="368"
                x2="700" y2="427"
                stroke="#f97316"
                strokeWidth="3"
                strokeDasharray="6,4"
              />
              {/* E3 (J8) -> E4 (J9) */}
              <line
                x1="700" y1="427"
                x2="810" y2="488"
                stroke="#eab308"
                strokeWidth="2"
                strokeDasharray="4,4"
              />
            </g>
          )}

          {/* Road Segments Layer */}
          {showTrafficLayer && (
            <g id="road-segments-layer">
              {segments.map((seg) => {
                const isSelected = selectedSegmentId === seg.id;
                const pointsStr = seg.coordinates
                  .map(c => toSvgCoords(c[0], c[1]).join(','))
                  .join(' ');

                const strokeColor = getSeverityStroke(seg.predictedRisk);
                const strokeWidth = isSelected ? 8 : 5;

                return (
                  <g
                    key={seg.id}
                    id={`segment-${seg.id}`}
                    onClick={() => onSelectSegment?.(seg)}
                    className="cursor-pointer group"
                  >
                    {/* Wider hit zone for easy clicking */}
                    <polyline
                      points={pointsStr}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="22"
                    />

                    {/* Road base underlay */}
                    <polyline
                      points={pointsStr}
                      fill="none"
                      stroke="#0f172a"
                      strokeWidth={strokeWidth + 4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Active speed/risk colored road */}
                    <polyline
                      points={pointsStr}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-all duration-300"
                    />

                    {/* Segment Speed Badge on Midpoint */}
                    {seg.coordinates.length >= 2 && (
                      <g className="pointer-events-none">
                        {(() => {
                          const midIndex = Math.floor(seg.coordinates.length / 2);
                          const [mx, my] = toSvgCoords(
                            seg.coordinates[midIndex][0],
                            seg.coordinates[midIndex][1]
                          );
                          return (
                            <g transform={`translate(${mx}, ${my - 10})`}>
                              <rect
                                x="-18"
                                y="-9"
                                width="36"
                                height="18"
                                rx="4"
                                fill="#0a0f18"
                                stroke={strokeColor}
                                strokeWidth="1"
                              />
                              <text
                                x="0"
                                y="3"
                                textAnchor="middle"
                                fill="#f8fafc"
                                fontSize="9"
                                fontFamily="monospace"
                                fontWeight="bold"
                              >
                                {seg.currentSpeedKmh}k
                              </text>
                            </g>
                          );
                        })()}
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          )}

          {/* Citizen Routes Layer (If active) */}
          {routes.length > 0 && (
            <g id="citizen-routes-overlay">
              {routes.map((route) => {
                const isSelected = selectedRouteId === route.id;
                const pointsStr = route.polylineCoordinates
                  .map(c => toSvgCoords(c[0], c[1]).join(','))
                  .join(' ');

                const routeColor = route.tag === 'FASTEST'
                  ? '#f43f5e'
                  : route.tag === 'LOWER_FUTURE_RISK'
                  ? '#10b981'
                  : '#38bdf8';

                return (
                  <g
                    key={route.id}
                    id={`route-path-${route.id}`}
                    onClick={() => onSelectRoute?.(route.id)}
                    className="cursor-pointer"
                  >
                    <polyline
                      points={pointsStr}
                      fill="none"
                      stroke={routeColor}
                      strokeWidth={isSelected ? 10 : 4}
                      strokeOpacity={isSelected ? 0.85 : 0.35}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* Incidents Layer */}
          {showIncidentsLayer && (
            <g id="incidents-layer">
              {incidents.map((inc) => {
                // Approximate location near target junction
                const j = junctions.find(j => j.id === inc.junctionId) || junctions[6];
                const [ix, iy] = toSvgCoords(j.coordinates[0], j.coordinates[1]);

                return (
                  <g
                    key={inc.id}
                    id={`map-incident-${inc.id}`}
                    transform={`translate(${ix + 15}, ${iy - 15})`}
                    className="cursor-pointer animate-bounce"
                  >
                    <circle r="14" fill="#f43f5e" fillOpacity="0.2" />
                    <circle r="9" fill="#f43f5e" />
                    <text
                      x="0"
                      y="3.5"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      !
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Junction Nodes Layer */}
          {showJunctionsLayer && (
            <g id="junctions-layer">
              {junctions.map((junc) => {
                const [jx, jy] = toSvgCoords(junc.coordinates[0], junc.coordinates[1]);
                const isSelected = selectedJunctionCode === junc.code;
                const isCritical = junc.riskSeverity === 'CRITICAL';
                const isHigh = junc.riskSeverity === 'HIGH';

                return (
                  <g
                    key={junc.id}
                    id={`junction-node-${junc.code}`}
                    transform={`translate(${jx}, ${jy})`}
                    onClick={() => onSelectJunction?.(junc)}
                    className="cursor-pointer group"
                  >
                    {/* Risk halo for critical/high nodes */}
                    {(isCritical || isHigh) && (
                      <circle
                        r={isCritical ? 36 : 24}
                        fill={isCritical ? 'url(#criticalHalo)' : '#f97316'}
                        fillOpacity={isCritical ? 0.6 : 0.25}
                        className="animate-pulse"
                      />
                    )}

                    {/* Junction base circle */}
                    <circle
                      r={isSelected ? 16 : 13}
                      fill={isCritical ? '#881337' : isHigh ? '#7c2d12' : '#0f172a'}
                      stroke={isSelected ? '#38bdf8' : isCritical ? '#f43f5e' : '#334155'}
                      strokeWidth={isSelected ? 3 : 2}
                      className="transition-all"
                    />

                    {/* Code label (e.g. J7) */}
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="11"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {junc.code}
                    </text>

                    {/* Spillback % indicator tag */}
                    {junc.spillbackProbabilityPercent > 30 && (
                      <g transform="translate(18, -12)">
                        <rect
                          x="-2"
                          y="-7"
                          width="32"
                          height="14"
                          rx="3"
                          fill="#0a0f18"
                          stroke={isCritical ? '#f43f5e' : '#f97316'}
                          strokeWidth="1"
                        />
                        <text
                          x="14"
                          y="3"
                          textAnchor="middle"
                          fill={isCritical ? '#fda4af' : '#fdba74'}
                          fontSize="8"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {junc.spillbackProbabilityPercent}%
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
