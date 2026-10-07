import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  CityId,
  StreetFeature,
  DrainageNetwork,
  DashboardSummary
} from '../types/flood';
import { CITIES_INFO } from '../data/citiesData';
import {
  VERIFIED_FLOOD_ZONES,
  VERIFIED_POIS,
  getFloodZoneCircleConfig,
  VerifiedLocation
} from '../data/verifiedCoordinates';
import {
  ShieldCheck,
  PhoneCall,
  ChevronDown,
  ChevronUp,
  Layers,
  MapPin,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

interface EmergencyOperationsPageProps {
  currentCity: CityId;
  streets: StreetFeature[];
  drainage: DrainageNetwork;
  summary: DashboardSummary | null;
  onNavigateToTripCheck: (params?: { from?: string; to?: string }) => void;
}

export const EmergencyOperationsPage: React.FC<EmergencyOperationsPageProps> = ({
  currentCity,
  streets,
  drainage,
  summary,
  onNavigateToTripCheck
}) => {
  const cityInfo = CITIES_INFO[currentCity] || CITIES_INFO.mumbai;

  // Map refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const emergencyLayersRef = useRef<L.LayerGroup | null>(null);
  const circleLayersMapRef = useRef<Record<string, L.Circle>>({});

  // Legend collapsed state
  const [isLegendOpen, setIsLegendOpen] = useState(false);

  // Match streets with verified coordinates
  const verifiedList = VERIFIED_FLOOD_ZONES[currentCity] || [];

  const verifiedStreets = streets.map((st) => {
    const verified = verifiedList.find((v) => v.id === st.id || v.name.toLowerCase().includes(st.name.toLowerCase().slice(0, 8)));
    const coords: [number, number] = verified ? verified.coordinates : (st.coordinates[0] || cityInfo.center);
    return {
      ...st,
      verifiedCoords: coords
    };
  });

  // Blocked roads sorted deepest first
  const blockedRoads = [...verifiedStreets]
    .filter((s) => (s.currentDepthCm || 0) >= 30)
    .sort((a, b) => (b.currentDepthCm || 0) - (a.currentDepthCm || 0));

  // Critical road for top alert card
  const criticalRoad = blockedRoads[0] || verifiedStreets[0] || {
    id: 'crit_default',
    name: 'Milan Subway Underpass',
    currentDepthCm: 145,
    verifiedCoords: [19.0886, 72.8427] as [number, number]
  };

  // Verified nearest hospital
  const pois = VERIFIED_POIS[currentCity] || [];
  const hospitalList = pois.filter((p) => p.type === 'hospital');
  const fireList = pois.filter((p) => p.type === 'fire_station');
  const nearestHospital = hospitalList[0] || {
    name: 'KEM Hospital (Parel)',
    coordinates: [19.0028, 72.8427],
    label: 'Level 1 Trauma Center',
    info: '24/7 Apex municipal emergency trauma care.'
  };

  // Trend calculator
  const getTrendText = (st: StreetFeature): string => {
    const depthNow = st.currentDepthCm || 0;
    const step30 = st.forecast.find((f) => f.timeOffsetMin === 30)?.predictedDepthCm ?? depthNow;
    if (step30 > depthNow + 2) return 'Rising';
    if (step30 < depthNow - 2) return 'Falling';
    return 'Stable';
  };

  // Initialize Map with free OpenStreetMap tiles
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: cityInfo.center,
        zoom: cityInfo.zoom,
        zoomControl: false
      });

      // Free OpenStreetMap base tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);

      emergencyLayersRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }
  }, [currentCity, cityInfo]);

  // Render Flood Zones as Circles with proper radius, colors, and pulsing
  useEffect(() => {
    const map = mapInstanceRef.current;
    const lg = emergencyLayersRef.current;
    if (!map || !lg) return;
    lg.clearLayers();
    circleLayersMapRef.current = {};

    const latLngPoints: L.LatLngExpression[] = [];

    // 1. Draw each flooded spot as a circle (L.circle) at exact junction coordinates
    blockedRoads.forEach((st) => {
      const depth = st.currentDepthCm || 0;
      const coords = st.verifiedCoords;
      latLngPoints.push(coords);

      const config = getFloodZoneCircleConfig(depth);
      const trend = getTrendText(st);

      // Create circle with 40% fill opacity and solid border
      const circle = L.circle(coords, {
        radius: config.radiusM,
        color: config.color,
        fillColor: config.fillColor,
        fillOpacity: config.fillOpacity,
        weight: config.weight,
        className: config.isRedPulsing ? 'pulse-flood-zone' : undefined
      });

      // Small popup with place name, depth, trend
      const popupHtml = `
        <div class="p-1 font-sans text-sm">
          <strong class="text-slate-900 block text-sm font-bold">${st.name}</strong>
          <div class="text-xs font-mono font-bold mt-1" style="color: ${config.color}">
            Depth: ${depth} cm • Trend: ${trend === 'Rising' ? '▲ Rising' : trend === 'Falling' ? '▼ Falling' : '► Stable'}
          </div>
          <span class="text-slate-600 text-xs block mt-0.5">Road closed. Avoid this area.</span>
        </div>
      `;

      circle.bindPopup(popupHtml, { maxWidth: 260 });
      circle.addTo(lg);
      circleLayersMapRef.current[st.id] = circle;

      // Also add subtle center dot
      const centerDot = L.circleMarker(coords, {
        radius: 4,
        color: config.color,
        fillColor: '#ffffff',
        fillOpacity: 1,
        weight: 2
      });
      centerDot.bindPopup(popupHtml, { maxWidth: 260 });
      centerDot.addTo(lg);
    });

    // 2. Verified Hospitals (Red square with white '+')
    hospitalList.forEach((hosp) => {
      latLngPoints.push(hosp.coordinates);
      const hospHtml = `
        <div class="w-8 h-8 rounded-lg bg-rose-600 border-2 border-white shadow-xl flex items-center justify-center text-white text-base font-black cursor-pointer">
          +
        </div>
      `;
      const icon = L.divIcon({
        html: hospHtml,
        className: 'hosp-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      L.marker(hosp.coordinates, { icon })
        .bindPopup(
          `<div class="p-1 font-sans text-sm">
            <strong class="text-slate-900 block text-sm font-bold">${hosp.name}</strong>
            <span class="text-slate-600 text-xs">${hosp.info}</span>
          </div>`,
          { maxWidth: 260 }
        )
        .addTo(lg);
    });

    // 3. Verified Fire Stations (Amber square with white 'FS')
    fireList.forEach((fire) => {
      latLngPoints.push(fire.coordinates);
      const fireHtml = `
        <div class="w-8 h-8 rounded-lg bg-amber-600 border-2 border-white shadow-xl flex items-center justify-center text-white text-xs font-black cursor-pointer">
          FS
        </div>
      `;
      const icon = L.divIcon({
        html: fireHtml,
        className: 'fire-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      L.marker(fire.coordinates, { icon })
        .bindPopup(
          `<div class="p-1 font-sans text-sm">
            <strong class="text-slate-900 block text-sm font-bold">${fire.name}</strong>
            <span class="text-slate-600 text-xs">${fire.info}</span>
          </div>`,
          { maxWidth: 260 }
        )
        .addTo(lg);
    });

    // Fit bounds to all flood zones with padding on load
    if (latLngPoints.length > 0) {
      const bounds = L.latLngBounds(latLngPoints);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [blockedRoads, hospitalList, fireList]);

  // Clicking a list row zooms to that circle (zoom 16) and opens its popup
  const handleSelectRoad = (st: StreetFeature & { verifiedCoords: [number, number] }) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo(st.verifiedCoords, 16, { duration: 0.8 });
    const circle = circleLayersMapRef.current[st.id];
    if (circle) {
      setTimeout(() => {
        circle.openPopup();
      }, 850);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full w-full bg-slate-950 overflow-hidden select-none">
      {/* LEFT PANEL: 3 Simple Items Only */}
      <div className="w-full lg:w-[440px] bg-slate-900 border-r border-slate-800 flex flex-col h-full z-10 shrink-0 overflow-y-auto">
        {/* Simple Page Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/95 sticky top-0 backdrop-blur-md z-10">
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Emergency Help
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Blocked roads and nearest help
          </p>
        </div>

        <div className="p-5 space-y-5 flex-1">
          {/* 1. TOP STATUS CARD */}
          {blockedRoads.length === 0 ? (
            <div className="p-5 rounded-2xl bg-emerald-950/80 border-2 border-emerald-600 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  <span>Corridors Open</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-black bg-emerald-600 text-white">
                  SAFE / CLEAR
                </span>
              </div>

              <div>
                <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                  All Emergency Routes Clear
                </h2>
                <div className="text-2xl sm:text-3xl font-black text-emerald-300 font-mono mt-1">
                  0 <span className="text-sm font-semibold text-emerald-200">cm water</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-medium block mt-0.5">
                  Estimated depth
                </span>
              </div>

              <p className="text-sm font-medium text-emerald-100">
                No road closures detected across monitored transit corridors.
              </p>

              <button
                onClick={() => onNavigateToTripCheck()}
                className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all uppercase tracking-wide cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Check my trip</span>
              </button>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-rose-950/80 border-2 border-rose-600 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                  <span>Critical Warning</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-black bg-rose-600 text-white">
                  CLOSED
                </span>
              </div>

              <div>
                <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                  {criticalRoad.name}
                </h2>
                <div className="text-2xl sm:text-3xl font-black text-rose-300 font-mono mt-1">
                  {criticalRoad.currentDepthCm} <span className="text-sm font-semibold text-rose-200">cm water</span>
                </div>
                <span className="text-[10px] text-rose-300 font-medium block mt-0.5">
                  Estimated depth
                </span>
              </div>

              <p className="text-sm font-medium text-rose-100">
                Road closed. Avoid this area.
              </p>

              <button
                onClick={() => onNavigateToTripCheck({ from: criticalRoad.name })}
                className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all uppercase tracking-wide cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Check my trip</span>
              </button>
            </div>
          )}

          {/* 2. BLOCKED ROADS LIST (Sorted deepest first) */}
          <div className="p-5 rounded-2xl bg-slate-850 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Blocked Roads ({blockedRoads.length})
              </h2>
              <span className="text-xs text-rose-400 font-mono font-bold">
                Deepest First
              </span>
            </div>

            {blockedRoads.length === 0 ? (
              <div className="p-3 text-xs text-emerald-300 bg-slate-900 rounded-xl border border-slate-800">
                No roads currently blocked. All arterial corridors passable.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {blockedRoads.map((st) => (
                  <div
                    key={st.id}
                    onClick={() => handleSelectRoad(st)}
                    className="min-h-[44px] p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 transition-colors cursor-pointer"
                  >
                    <span className="text-sm font-semibold text-white truncate">
                      {st.name}
                    </span>
                    <div className="text-right shrink-0 ml-2">
                      <span className="text-sm font-black text-rose-400 font-mono block">
                        {st.currentDepthCm} cm
                      </span>
                      <span className="text-[9px] text-slate-400">
                        Estimated depth
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. NEAREST HOSPITAL CARD */}
          <div className="p-5 rounded-2xl bg-slate-850 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Nearest Hospital
              </h2>
              <span className="text-xs font-bold text-emerald-400 font-mono">
                1.2 km away
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-white">
                {nearestHospital.name}
              </h3>
              <p className="text-sm text-slate-300 mt-0.5">
                Emergency trauma center on standby.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <a
                href="tel:108"
                className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call Hospital</span>
              </a>

              <button
                onClick={() => onNavigateToTripCheck({ to: nearestHospital.name })}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-slate-700 text-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Check trip</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Large Emergency Tactical Map */}
      <div className="flex-1 relative w-full h-full min-h-[400px]">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Small Notice Label on Top-Left */}
        <div className="absolute top-4 left-4 z-[1000] px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700 text-xs text-slate-300 shadow-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>Demo data: locations are approximate</span>
        </div>

        {/* Small Collapsible Map Legend in Bottom-Left */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-3 shadow-2xl text-white text-sm max-w-[220px]">
          <button
            onClick={() => setIsLegendOpen(!isLegendOpen)}
            className="w-full flex items-center justify-between gap-2 font-bold text-slate-200 cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-extrabold text-slate-300">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Map Legend</span>
            </div>
            {isLegendOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>

          {isLegendOpen && (
            <div className="mt-2.5 pt-2 border-t border-slate-800 space-y-2 text-xs text-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full border border-rose-500 bg-rose-600/40"></span>
                <span className="text-sm font-medium">Blocked road</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-rose-600 flex items-center justify-center text-white text-xs font-black">+</span>
                <span className="text-sm font-medium">Hospital</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-amber-600 flex items-center justify-center text-white text-[10px] font-black">FS</span>
                <span className="text-sm font-medium">Fire station</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
