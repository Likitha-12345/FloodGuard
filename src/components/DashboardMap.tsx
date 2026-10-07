import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { StreetFeature, CityId, RiskLevel } from '../types/flood';
import { CITIES_INFO } from '../data/citiesData';
import {
  VERIFIED_FLOOD_ZONES,
  getFloodZoneCircleConfig
} from '../data/verifiedCoordinates';
import { MapPin, Navigation, Compass, Layers, AlertTriangle } from 'lucide-react';

interface DashboardMapProps {
  currentCity: CityId;
  streets: StreetFeature[];
  selectedStreetId: string | null;
  onSelectStreet: (streetId: string) => void;
  isEmergencyMode?: boolean;
  timeOffsetMin?: number;
}

export const DashboardMap: React.FC<DashboardMapProps> = ({
  currentCity,
  streets,
  selectedStreetId,
  onSelectStreet,
  isEmergencyMode = false,
  timeOffsetMin = 0
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const streetsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const userLocationLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const [userLocation, setUserLocation] = useState<[number, number] | null>([19.0178, 72.8478]); // Default commuter in Dadar TT, Mumbai
  const [isLocating, setIsLocating] = useState(false);
  const [showLegend, setShowLegend] = useState(false);

  const cityInfo = CITIES_INFO[currentCity] || CITIES_INFO.mumbai;

  // Color helper based on depth
  const getRiskColor = (depth: number, isEmergency: boolean): string => {
    if (depth >= 30) return isEmergency ? '#ff0033' : '#ef4444'; // Red (Severe)
    if (depth >= 15) return isEmergency ? '#ff7700' : '#f97316'; // Orange (High)
    if (depth >= 5) return isEmergency ? '#ffdd00' : '#eab308'; // Yellow (Moderate)
    return isEmergency ? '#00ff66' : '#10b981'; // Green (Safe)
  };

  // Initialize Map Once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: cityInfo.center,
        zoom: currentCity === 'mumbai' ? 12.5 : cityInfo.zoom,
        zoomControl: false,
        attributionControl: false
      });

      // Free OpenStreetMap base tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Add Zoom control in top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Layer groups
      streetsLayerGroupRef.current = L.layerGroup().addTo(map);
      markersLayerGroupRef.current = L.layerGroup().addTo(map);
      userLocationLayerGroupRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [currentCity]);

  // Update Center when city changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(cityInfo.center, currentCity === 'mumbai' ? 12.5 : cityInfo.zoom);
    }
  }, [currentCity, cityInfo]);

  // Render Circles & Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !streetsLayerGroupRef.current || !markersLayerGroupRef.current) return;

    streetsLayerGroupRef.current.clearLayers();
    markersLayerGroupRef.current.clearLayers();

    const verifiedList = VERIFIED_FLOOD_ZONES[currentCity] || [];
    const floodPoints: L.LatLngExpression[] = [];

    // 1. Draw Circular Flood Zones and Street Polylines
    streets.forEach((street) => {
      const step = street.forecast.find((f) => f.timeOffsetMin === timeOffsetMin);
      const depth = step?.predictedDepthCm ?? (street.currentDepthCm || 0);
      const isSelected = street.id === selectedStreetId;

      const verified = verifiedList.find((v) => v.id === street.id || v.name.toLowerCase().includes(street.name.toLowerCase().slice(0, 8)));
      const junctionCoords: [number, number] = verified ? verified.coordinates : (street.coordinates[0] || cityInfo.center);
      floodPoints.push(junctionCoords);

      const circleConfig = getFloodZoneCircleConfig(depth);
      const trend = (step && step.predictedDepthCm > (street.currentDepthCm || 0) + 2) ? 'Rising' : 'Falling';

      // Circular Flood Zone for inundated junctions
      if (depth >= 15) {
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
        circle.on('click', () => onSelectStreet(street.id));
        circle.addTo(streetsLayerGroupRef.current!);
      }

      // Street Polyline
      const polyline = L.polyline(street.coordinates, {
        color: circleConfig.color,
        weight: isSelected ? 6 : depth >= 30 ? 4.5 : 3,
        opacity: isSelected ? 1 : depth >= 30 ? 0.9 : 0.7,
        lineCap: 'round',
        lineJoin: 'round'
      });

      polyline.on('click', () => onSelectStreet(street.id));
      polyline.addTo(streetsLayerGroupRef.current!);
    });

    // 2. Draw Top Dangerous Areas Pins (Pin with depth badge!)
    const severeStreets = [...streets]
      .sort((a, b) => (b.currentDepthCm || 0) - (a.currentDepthCm || 0))
      .filter((s) => (s.currentDepthCm || 0) >= 15 || s.id === selectedStreetId);

    severeStreets.forEach((street) => {
      const depth = street.currentDepthCm || 0;
      const isSelected = street.id === selectedStreetId;
      const verified = verifiedList.find((v) => v.id === street.id || v.name.toLowerCase().includes(street.name.toLowerCase().slice(0, 8)));
      const junctionCoords = verified ? verified.coordinates : (street.coordinates[0] || cityInfo.center);

      const markerHtml = `
        <div class="cursor-pointer transition-transform hover:scale-110 flex flex-col items-center">
          <div class="px-2 py-0.5 rounded-full text-[11px] font-black font-mono shadow-md border flex items-center gap-1 ${
            isSelected
              ? 'bg-white text-slate-950 border-cyan-400 ring-4 ring-cyan-500/50 scale-110'
              : depth >= 30
              ? 'bg-rose-950 text-rose-200 border-rose-500 ring-2 ring-rose-500/40'
              : 'bg-orange-950 text-orange-200 border-orange-500'
          }">
            <span class="w-2 h-2 rounded-full ${depth >= 30 ? 'bg-rose-500 animate-pulse' : 'bg-orange-500'}"></span>
            <span>${depth} cm</span>
          </div>
          <div class="w-3 h-3 rotate-45 -mt-1.5 ${isSelected ? 'bg-white' : depth >= 30 ? 'bg-rose-600' : 'bg-orange-500'}"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-flood-pin',
        html: markerHtml,
        iconSize: [64, 30],
        iconAnchor: [32, 28]
      });

      const marker = L.marker(junctionCoords, { icon: customIcon });
      marker.on('click', () => {
        onSelectStreet(street.id);
      });

      marker.bindPopup(
        `<div class="p-1 font-sans text-xs">
          <strong>${street.name}</strong><br/>
          <span class="text-rose-600 font-bold">Estimated Depth: ${depth} cm</span>
        </div>`,
        { maxWidth: 240 }
      );

      markersLayerGroupRef.current?.addLayer(marker);
    });

    // Auto fitBounds to all flood zones on load
    if (map && floodPoints.length > 0) {
      const bounds = L.latLngBounds(floodPoints);
      map.fitBounds(bounds, { padding: [45, 45], maxZoom: 14 });
    }
  }, [streets, selectedStreetId, isEmergencyMode, timeOffsetMin, onSelectStreet, currentCity]);

  // Pan to selected street when selected
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedStreetId) return;

    const targetStreet = streets.find((s) => s.id === selectedStreetId);
    if (targetStreet && targetStreet.coordinates.length > 0) {
      const midPoint = targetStreet.coordinates[Math.floor(targetStreet.coordinates.length / 2)];
      mapInstanceRef.current.flyTo(midPoint, 14.5, { duration: 0.8 });
    }
  }, [selectedStreetId, streets]);

  // User location marker
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocationLayerGroupRef.current) return;

    userLocationLayerGroupRef.current.clearLayers();

    if (userLocation) {
      const userHtml = `
        <div class="relative flex items-center justify-center">
          <div class="animate-ping absolute w-6 h-6 rounded-full bg-cyan-400 opacity-60"></div>
          <div class="w-4 h-4 rounded-full bg-cyan-500 border-2 border-white shadow-lg shadow-cyan-500/50"></div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'user-loc-pin',
        html: userHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const userMarker = L.marker(userLocation, { icon });
      userMarker.bindTooltip('<strong class="text-xs">Your Location (Dadar Central)</strong>', { direction: 'top' });
      userLocationLayerGroupRef.current.addLayer(userMarker);
    }
  }, [userLocation]);

  // Locate User handler
  const handleLocateMe = () => {
    setIsLocating(true);
    if (navigator.geolocation && currentCity === 'mumbai') {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(coords);
          mapInstanceRef.current?.flyTo(coords, 14.5, { duration: 0.8 });
          setIsLocating(false);
        },
        () => {
          // Fallback to central commuter point in Mumbai (Dadar TT)
          const fallback: [number, number] = [19.0178, 72.8478];
          setUserLocation(fallback);
          mapInstanceRef.current?.flyTo(fallback, 14.5, { duration: 0.8 });
          setIsLocating(false);
        },
        { timeout: 4000 }
      );
    } else {
      const fallback = cityInfo.center;
      setUserLocation(fallback);
      mapInstanceRef.current?.flyTo(fallback, 14.5, { duration: 0.8 });
      setIsLocating(false);
    }
  };

  return (
    <div className="relative w-full h-80 sm:h-96 lg:h-[420px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Map Controls & Overlays */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2">
        {/* City & Zone Badge */}
        <div className="px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-700/80 text-white text-xs font-bold flex items-center gap-2 shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
          <span>{cityInfo.name} Live Flood Zones</span>
        </div>

        {/* Demo notice */}
        <div className="px-2.5 py-1 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700 text-slate-300 text-[11px] font-medium hidden sm:flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          <span>Demo data: locations are approximate</span>
        </div>

        {/* Legend toggle */}
        <button
          onClick={() => setShowLegend(!showLegend)}
          className="min-h-[36px] px-2.5 py-1 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Legend</span>
        </button>
      </div>

      {/* Floating Bottom Right "My Location" & Recenter */}
      <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-2">
        <button
          onClick={handleLocateMe}
          disabled={isLocating}
          title="Zoom to My Location"
          className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white hover:bg-cyan-600 hover:border-cyan-500 shadow-xl flex items-center justify-center transition-all cursor-pointer group"
        >
          <Navigation className={`w-5 h-5 text-cyan-400 group-hover:text-white ${isLocating ? 'animate-spin' : ''}`} />
        </button>

        <button
          onClick={() => mapInstanceRef.current?.setView(cityInfo.center, currentCity === 'mumbai' ? 12.5 : cityInfo.zoom)}
          title="Recenter City Overview"
          className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700 text-slate-300 hover:bg-slate-800 shadow-xl flex items-center justify-center transition-all cursor-pointer"
        >
          <Compass className="w-5 h-5 text-slate-300" />
        </button>
      </div>

      {/* Floating Legend Card (Expandable) */}
      {showLegend && (
        <div className="absolute top-12 left-3 z-10 p-3 rounded-xl bg-slate-950/95 backdrop-blur-md border border-slate-700 shadow-2xl text-xs space-y-1.5 w-60 animate-in fade-in zoom-in-95 duration-150">
          <div className="font-bold text-white uppercase text-[11px] tracking-wider mb-2 pb-1 border-b border-slate-800 flex items-center justify-between">
            <span>Water Depth Levels</span>
            <span className="text-[10px] text-slate-400">Urban Risk</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-rose-300">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              <span>Severe Flood (&ge; 30 cm)</span>
            </span>
            <span className="font-mono text-slate-400 text-[11px]">Impasse</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-orange-300">
              <span className="w-3 h-3 rounded-full bg-orange-500"></span>
              <span>High Risk (15–29 cm)</span>
            </span>
            <span className="font-mono text-slate-400 text-[11px]">Stall Risk</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-amber-300">
              <span className="w-3 h-3 rounded-full bg-amber-400"></span>
              <span>Moderate (5–14 cm)</span>
            </span>
            <span className="font-mono text-slate-400 text-[11px]">Caution</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-emerald-300">
              <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
              <span>Safe Pass (&lt; 5 cm)</span>
            </span>
            <span className="font-mono text-slate-400 text-[11px]">Clear</span>
          </div>
        </div>
      )}

      {/* Interactive Helper Banner in Bottom Left */}
      <div className="absolute bottom-3 left-3 z-10 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[12px] text-slate-300">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
        <span>Click any pin or roadway to inspect depth & safe alternate routes</span>
      </div>
    </div>
  );
};
