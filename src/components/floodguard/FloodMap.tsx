import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Crosshair,
  Layers,
  Maximize2,
  Minimize2,
  Navigation,
  ShieldAlert,
  Info
} from 'lucide-react';
import { FloodArea, MUMBAI_HOSPITALS } from '../../data/mumbaiFloodConstants';

interface FloodMapProps {
  areas: FloodArea[];
  selectedArea: FloodArea | null;
  onSelectArea: (area: FloodArea) => void;
  emergencyMode: boolean;
  onFindSafeRouteToHospital?: (hospitalName: string) => void;
}

export const FloodMap: React.FC<FloodMapProps> = ({
  areas,
  selectedArea,
  onSelectArea,
  emergencyMode,
  onFindSafeRouteToHospital
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [19.0450, 72.8550], // Central Mumbai
        zoom: 12,
        zoomControl: false,
        attributionControl: false
      });

      // Free OpenStreetMap base tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      // Keep instance intact during state changes
    };
  }, []);

  // Update Markers & Highlights
  useEffect(() => {
    const lg = markersLayerRef.current;
    if (!lg || !mapInstanceRef.current) return;
    lg.clearLayers();

    // 1. Draw flood risk circles & pins for Top Areas to Avoid
    areas.forEach((area) => {
      const isSelected = selectedArea?.id === area.id;
      const isSevere = area.status === 'severe';
      const isHigh = area.status === 'high';
      const color = isSevere ? '#FF4D4F' : isHigh ? '#FFA940' : '#F1C40F';

      // Translucent risk zone circle
      L.circle(area.coordinates, {
        radius: isSevere ? 750 : isHigh ? 500 : 350,
        color,
        fillColor: color,
        fillOpacity: isSelected ? 0.35 : 0.2,
        weight: isSelected ? 3 : 1.5
      }).addTo(lg);

      // Pin badge marker
      const pinHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          ${isSevere ? '<span class="absolute inline-flex h-9 w-9 rounded-full bg-[#FF4D4F]/40 animate-ping"></span>' : ''}
          <div style="background-color: ${color};" class="px-2 py-1 rounded-full text-white text-[11px] font-black shadow-xl border-2 ${
            isSelected ? 'border-white ring-4 ring-[#38BDF8] scale-125' : 'border-white'
          } flex items-center gap-1 transition-transform">
            <span>${area.depthCm}cm</span>
          </div>
        </div>
      `;

      const pinIcon = L.divIcon({
        html: pinHtml,
        className: 'custom-flood-pin',
        iconSize: [48, 28],
        iconAnchor: [24, 14]
      });

      const marker = L.marker(area.coordinates, { icon: pinIcon });
      marker.bindTooltip(
        `<div class="p-1 font-sans text-xs">
          <strong>${area.name}</strong> (${area.locality})<br/>
          Depth: <b>${area.depthCm} cm</b> (${area.status.toUpperCase()})<br/>
          <span style="color:${color}">Click to inspect safe alternate route</span>
        </div>`,
        { sticky: true }
      );

      marker.on('click', () => {
        onSelectArea(area);
      });

      marker.addTo(lg);
    });

    // 2. If Emergency Mode is active: Highlight Open Hospital Corridors
    if (emergencyMode) {
      MUMBAI_HOSPITALS.forEach((hosp) => {
        const hospHtml = `
          <div class="w-8 h-8 rounded-lg bg-[#2ECC71] border-2 border-white shadow-xl flex items-center justify-center text-white text-xs font-black ring-2 ring-[#2ECC71]/60 animate-pulse">
            +
          </div>
        `;
        const hospIcon = L.divIcon({
          html: hospHtml,
          className: 'hospital-corridor-pin',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const hospMarker = L.marker(hosp.coordinates as [number, number], { icon: hospIcon });
        hospMarker.bindPopup(
          `<div class="p-1.5 font-sans text-xs">
            <strong class="text-emerald-700">${hosp.name}</strong><br/>
            <span class="text-slate-600">Priority Corridor Open: ${hosp.openRoute}</span>
          </div>`
        );
        hospMarker.addTo(lg);
      });
    }

    // Pan to selected area if set
    if (selectedArea && mapInstanceRef.current) {
      mapInstanceRef.current.setView(selectedArea.coordinates, 14, { animate: true });
    }
  }, [areas, selectedArea, emergencyMode, onSelectArea]);

  // Handle "My Location" button
  const handleLocateMe = () => {
    const dadarCoords: [number, number] = [19.0178, 72.8478]; // Simulated Central Mumbai location
    setUserLocation(dadarCoords);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(dadarCoords, 14, { animate: true });

      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }

      const userIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute inline-flex h-8 w-8 rounded-full bg-[#38BDF8]/40 animate-ping"></span>
            <div class="w-5 h-5 rounded-full bg-[#38BDF8] border-2 border-white shadow-lg ring-2 ring-[#38BDF8]"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      userMarkerRef.current = L.marker(dadarCoords, { icon: userIcon }).addTo(mapInstanceRef.current);
      userMarkerRef.current.bindPopup('<b>You are here (Dadar Central)</b><br/>High flood risk nearby: Hindmata (0.8km)').openPopup();
    }
  };

  return (
    <section className={`relative rounded-2xl sm:rounded-3xl border border-[#1E2D4A] bg-[#111A2E] overflow-hidden shadow-2xl transition-all ${
      isFullscreen ? 'fixed inset-4 z-50 rounded-2xl' : 'h-[440px] sm:h-[480px]'
    }`}>
      {/* Map Header Ribbon */}
      <div className="absolute top-3 left-3 z-[1000] bg-[#0B1220]/90 backdrop-blur-md border border-[#1E2D4A] rounded-xl px-3 py-2 text-xs text-white shadow-lg flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF4D4F] animate-pulse"></span>
          <span className="font-bold">Mumbai Flood Risk Map</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-300 pl-2 border-l border-slate-700">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#FF4D4F]"></span> Severe</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#FFA940]"></span> High</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#2ECC71]"></span> Safe Corridors</span>
        </div>
      </div>

      {/* Floating Tools on Top Right: My Location & Fullscreen */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2">
        <button
          onClick={handleLocateMe}
          className="px-3 py-2 rounded-xl bg-[#0B1220]/90 hover:bg-[#111A2E] text-white border border-[#1E2D4A] text-xs font-bold shadow-lg flex items-center gap-1.5 transition-all cursor-pointer"
          title="Locate my position in Mumbai"
        >
          <Crosshair className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span>My Location</span>
        </button>

        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 rounded-xl bg-[#0B1220]/90 hover:bg-[#111A2E] text-white border border-[#1E2D4A] shadow-lg transition-all cursor-pointer"
          title="Toggle Expanded Map View"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Emergency Mode Corridors Banner Overlay */}
      {emergencyMode && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-[#2ECC71]/95 text-[#0B1220] font-black px-3.5 py-1.5 rounded-xl text-xs shadow-xl flex items-center gap-2 animate-pulse">
          <span>🚑 Open Hospital Corridors Active (KEM, Lilavati, Hinduja)</span>
        </div>
      )}

      {/* The Leaflet Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />
    </section>
  );
};
