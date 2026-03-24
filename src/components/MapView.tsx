"use client";

import { Store } from "@/types";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapViewProps {
  stores: Store[];
  onStoreClick?: (store: Store) => void;
  selectedStore?: Store | null;
}

const defaultCenter: [number, number] = [37.5, 126.95];
const defaultZoom = 11;

function createPinIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<svg width="28" height="36" viewBox="0 0 32 40">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24C32 7.163 24.837 0 16 0z" fill="${color}"/>
      <circle cx="16" cy="14" r="6" fill="white" opacity="0.9"/>
    </svg>`,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
  });
}

const accentIcon = createPinIcon("#10B981");
const goldIcon = createPinIcon("#F59E0B");
const selectedIcon = createPinIcon("#F59E0B");

export default function MapView({
  stores,
  onStoreClick,
  selectedStore,
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const [ready, setReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: defaultCenter,
      zoom: defaultZoom,
      zoomControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    mapRef.current = map;
    setReady(true);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers
  useEffect(() => {
    if (!mapRef.current || !ready) return;
    const map = mapRef.current;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    stores.forEach((store) => {
      const icon = store.isRecommended ? goldIcon : accentIcon;
      const marker = L.marker([store.lat, store.lng], { icon }).addTo(map);

      marker.bindPopup(
        `<div style="font-size:13px;min-width:140px">
          <strong>${store.name}</strong><br/>
          <span style="color:#666;font-size:11px">${store.hours}</span><br/>
          <span style="color:#888;font-size:11px">${store.address}</span>
        </div>`
      );

      marker.on("click", () => {
        onStoreClick?.(store);
      });

      markersRef.current.set(store.id, marker);
    });
  }, [stores, ready, onStoreClick]);

  // Handle selected store
  useEffect(() => {
    if (!mapRef.current || !ready) return;

    markersRef.current.forEach((marker, id) => {
      const store = stores.find((s) => s.id === id);
      if (!store) return;

      if (selectedStore?.id === id) {
        marker.setIcon(selectedIcon);
        marker.openPopup();
        mapRef.current?.setView([store.lat, store.lng], 13, { animate: true });
      } else {
        marker.setIcon(store.isRecommended ? goldIcon : accentIcon);
      }
    });
  }, [selectedStore, stores, ready]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-border-custom">
      <div ref={containerRef} className="w-full h-full" />

      {/* Legend */}
      <div className="absolute bottom-12 left-3 bg-card/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-border-custom z-[1000]">
        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-accent" />
            <span className="text-muted">매장</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-gold" />
            <span className="text-muted">추천매장</span>
          </div>
        </div>
      </div>

      {/* Store count */}
      <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-border-custom z-[1000]">
        <p className="text-muted text-[10px]">
          수도권 매장 <span className="text-accent font-semibold">{stores.length}</span>곳
        </p>
      </div>
    </div>
  );
}
