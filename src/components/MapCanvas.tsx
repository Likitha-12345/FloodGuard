import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  CityId,
  StreetFeature,
  RiskLevel,
  CityInfo
} from '../types/flood';
import { CITIES_INFO } from '../data/citiesData';
import {
  VERIFIED_FLOOD_ZONES,
  VERIFIED_POIS,
  getFloodZoneCircleConfig
} from '../data/verifiedCoordinates';
import {
  Layers,
  MapPin,
  Cross,
  Eye,
  EyeOff,
  Maximize2
} from 'lucide-react';

interface MapCanvasProps {
  currentCity: CityId;
  streets: StreetFeature[];
  selectedStreetId: string | null;
  onSelectStreet: (streetId: string) => void;
  onCheckTripToLocation?: (coords: [number, number], label: string) => void;
  timeOffsetMin: number;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
  currentCity,
  streets,
  selectedStreetId,
  onSelectStreet,
  onCheckTripToLocation,
  timeOffsetMin
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Layer groups for dynamic toggling
  const streetsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const radarLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const hospitalsLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Layer toggles
  const [showStreets, setShowStreets] = useState(true);
  const [showRadar, setShowRadar] = useState(true);
  const [showHospitals, setShowHospitals] = useState(true);

  const cityInfo = CITIES_INFO[currentCity];

  // Helper color map for risk level
  const getRiskColor = (risk: RiskLevel = 'safe', depth: number = 0): string => {
    if (depth >= 30 || risk === 'severe') return '#ef4444'; // Red
    if (depth >= 15 || risk === 'high') return '#f97316'; // Orange
    if (depth >= 5 || risk === 'moderate') return '#eab308'; // Yellow
    return '#10b981'; // Green
  };

  // Initialize Map
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
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      // Add zoom control in top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Setup Layer Groups
      streetsLayerGroupRef.current = L.layerGroup().addTo(map);
      radarLayerGroupRef.current = L.layerGroup().addTo(map);
      hospitalsLayerGroupRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    // Adjust view when city changes
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(cityInfo.center, cityInfo.zoom, { animate: true });
    }

    return () => {
      // Don't destroy instance completely on quick re-renders, clean on unmount
    };
  }, [currentCity]);

  // Re-render Streets Layer with Circular Flood Zones
  useEffect(() => {
    const lg = streetsLayerGroupRef.current;
    const map = mapInstanceRef.current;
    if (!lg) return;
    lg.clearLayers();

    if (!showStreets) return;

    const verifiedList = VERIFIED_FLOOD_ZONES[currentCity] || [];
    const allFloodPoints: L.LatLngExpression[] = [];

    streets.forEach((street) => {
      const step = street.forecast.find((f) => f.timeOffsetMin === timeOffsetMin);
      const depth = step?.predictedDepthCm ?? (street.currentDepthCm || 0);
      const isSelected = street.id === selectedStreetId;

      const verified = verifiedList.find((v) => v.id === street.id || v.name.toLowerCase().includes(street.name.toLowerCase().slice(0, 8)));
      const junctionCoords: [number, number] = verified ? verified.coordinates : (street.coordinates[0] || cityInfo.center);
      allFloodPoints.push(junctionCoords);

      const circleConfig = getFloodZoneCircleConfig(depth);

      // 1. Draw Circular Flood Zone at exact junction coordinates
      if (depth >= 15) {
        const trend = (step && step.predictedDepthCm > (street.currentDepthCm || 0) + 2) ? 'Rising' : 'Falling';
        const circle = L.circle(junctionCoords, {
          radius: circleConfig.radiusM,
          color: circleConfig.color,
          fillColor: circleConfig.fillColor,
          fillOpacity: isSelected ? 0.6 : circleConfig.fillOpacity,
          weight: isSelected ? 4 : circleConfig.weight,
          className: circleConfig.isRedPulsing ? 'pulse-flood-zone' : undefined
        });

        const popupHtml = `
          <div class="p-1 font-sans text-sm">
            <strong class="text-slate-900 block text-sm font-bold">${street.name}</strong>
            <span class="text-slate-600 text-xs">${street.neighborhood}</span>
            <div class="mt-1 text-xs font-mono font-bold" style="color: ${circleConfig.color}">
              Estimated Depth: ${depth} cm • Trend: ${trend === 'Rising' ? '▲ Rising' : '▼ Falling'}
            </div>
            <div class="text-[11px] text-slate-500 mt-0.5">${circleConfig.severityLabel}</div>
          </div>
        `;

        circle.bindPopup(popupHtml, { maxWidth: 260 });
        circle.on('click', () => {
          onSelectStreet(street.id);
        });

        circle.addTo(lg);

        // Center pin marker with depth pill
        const centerMarkerHtml = `
          <div class="cursor-pointer transition-transform hover:scale-110 flex flex-col items-center">
            <div class="px-1.5 py-0.5 rounded-full text-[10px] font-black font-mono shadow-md border ${
              isSelected
                ? 'bg-white text-slate-950 border-cyan-400 ring-2 ring-cyan-500'
                : depth >= 30
                ? 'bg-rose-950 text-rose-200 border-rose-500'
                : 'bg-orange-950 text-orange-200 border-orange-500'
            }">
              ${depth}cm
            </div>
          </div>
        `;
        const centerIcon = L.divIcon({
          html: centerMarkerHtml,
          className: 'custom-center-pin',
          iconSize: [40, 20],
          iconAnchor: [20, 10]
        });
        const centerMarker = L.marker(junctionCoords, { icon: centerIcon });
        centerMarker.on('click', () => onSelectStreet(street.id));
        centerMarker.bindPopup(popupHtml, { maxWidth: 260 });
        centerMarker.addTo(lg);
      }

      // 2. Road geometry polyline
      const polyline = L.polyline(street.coordinates, {
        color: circleConfig.color,
        weight: isSelected ? 6 : depth > 15 ? 4.5 : 3,
        opacity: isSelected ? 1.0 : depth > 5 ? 0.85 : 0.7,
        lineCap: 'round',
        lineJoin: 'round'
      });

      polyline.bindTooltip(
        `<div class="p-1 font-sans text-xs">
          <strong>${street.name}</strong><br/>
          Depth: <strong>${depth} cm</strong>
        </div>`,
        { sticky: true }
      );
      polyline.on('click', () => onSelectStreet(street.id));
      polyline.addTo(lg);
    });

    // Auto fitBounds to all flood zones on city load
    if (map && allFloodPoints.length > 0) {
      const bounds = L.latLngBounds(allFloodPoints);
      map.fitBounds(bounds, { padding: [45, 45], maxZoom: 14 });
    }
  }, [streets, selectedStreetId, showStreets, timeOffsetMin, currentCity]);



  // Re-render Radar Reflectivity Overlay
  useEffect(() => {
    const lg = radarLayerGroupRef.current;
    if (!lg) return;
    lg.clearLayers();

    if (!showRadar) return;

    // Simulate convective precipitation cells around city center
    const center = cityInfo.center;
    const radarCircle1 = L.circle(center, {
      radius: 4500,
      color: '#06b6d4',
      weight: 1,
      fillColor: '#06b6d4',
      fillOpacity: 0.12
    }).addTo(lg);

    const radarCircle2 = L.circle([center[0] + 0.015, center[1] + 0.01], {
      radius: 2500,
      color: '#3b82f6',
      weight: 1,
      fillColor: '#3b82f6',
      fillOpacity: 0.18
    }).addTo(lg);

    const radarCircle3 = L.circle([center[0] - 0.01, center[1] - 0.012], {
      radius: 1800,
      color: '#f97316',
      weight: 1,
      fillColor: '#f97316',
      fillOpacity: 0.22
    }).addTo(lg);
  }, [cityInfo, showRadar]);

  // Re-render Hospitals & Critical Landmarks
  useEffect(() => {
    const lg = hospitalsLayerGroupRef.current;
    if (!lg) return;
    lg.clearLayers();

    if (!showHospitals) return;

    cityInfo.hospitals.forEach((hosp) => {
      const hospHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          <div class="w-6 h-6 rounded-md bg-rose-600 border-2 border-white shadow-md flex items-center justify-center text-white font-extrabold text-xs group-hover:scale-110 transition-transform">
            +
          </div>
        </div>
      `;

      const hospIcon = L.divIcon({
        html: hospHtml,
        className: 'hospital-marker',
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      const marker = L.marker(hosp.coordinates, { icon: hospIcon });
      marker.bindPopup(
        `<div class="p-1 font-sans">
          <div class="text-xs font-bold text-slate-900">${hosp.name}</div>
          <div class="text-[11px] text-rose-600 font-semibold">${hosp.emergencyTier}</div>
          <button id="trip-to-${hosp.name.replace(/\s+/g, '-')}" class="mt-2 w-full px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition-colors flex items-center justify-center gap-1">
            <span>Check trip</span>
          </button>
        </div>`
      );

      marker.on('popupopen', () => {
        const btn = document.getElementById(`trip-to-${hosp.name.replace(/\s+/g, '-')}`);
        if (btn && onCheckTripToLocation) {
          btn.onclick = () => {
            onCheckTripToLocation(hosp.coordinates, hosp.name);
            marker.closePopup();
          };
        }
      });

      marker.addTo(lg);
    });
  }, [cityInfo, showHospitals, onCheckTripToLocation]);

  const resetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(cityInfo.center, cityInfo.zoom, { animate: true });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[450px] bg-slate-950 overflow-hidden select-none">
      {/* Map Target Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Demo data notice banner */}
      <div className="absolute top-3 right-12 z-[1000] px-3 py-1 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700 text-xs text-slate-300 shadow-lg hidden sm:flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
        <span>Demo data: locations are approximate</span>
      </div>

      {/* Top Left Layer Control Floating Panel */}
      <div className="absolute top-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-2.5 shadow-xl text-white text-xs max-w-[210px]">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 font-semibold text-slate-300">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            GIS Overlays
          </span>
          <button
            onClick={resetView}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
            title="Recenter City Map"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-2 space-y-1.5">
          <label className="flex items-center justify-between cursor-pointer hover:text-cyan-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              Street Inundation
            </span>
            <input
              type="checkbox"
              checked={showStreets}
              onChange={(e) => setShowStreets(e.target.checked)}
              className="accent-cyan-500 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer hover:text-cyan-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              Doppler Radar Isohyet
            </span>
            <input
              type="checkbox"
              checked={showRadar}
              onChange={(e) => setShowRadar(e.target.checked)}
              className="accent-cyan-500 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer hover:text-cyan-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
              Emergency Hospitals
            </span>
            <input
              type="checkbox"
              checked={showHospitals}
              onChange={(e) => setShowHospitals(e.target.checked)}
              className="accent-cyan-500 cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Bottom Right Floating Map Legend */}
      <div className="absolute bottom-3 right-3 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-2.5 shadow-xl text-white text-[11px] max-w-[240px]">
        <div className="font-semibold text-slate-300 mb-1.5 pb-1 border-b border-slate-800 flex items-center justify-between">
          <span>Flood Depth (cm)</span>
          <span className="text-[10px] text-cyan-400 font-mono">T+{timeOffsetMin}m</span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-4 h-1.5 rounded bg-emerald-500"></span>
              <span className="text-slate-300">Safe</span>
            </div>
            <span className="text-slate-400">&lt; 5 cm</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-4 h-1.5 rounded bg-amber-500"></span>
              <span className="text-slate-300">Moderate</span>
            </div>
            <span className="text-slate-400">5 – 15 cm</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-4 h-1.5 rounded bg-orange-500"></span>
              <span className="text-slate-300">High Risk</span>
            </div>
            <span className="text-slate-400">15 – 30 cm</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-4 h-1.5 rounded bg-rose-500 animate-pulse"></span>
              <span className="text-rose-300 font-bold">Severe Flooding</span>
            </div>
            <span className="text-rose-400 font-semibold">&gt; 30 cm</span>
          </div>
        </div>
      </div>
    </div>
  );
};
