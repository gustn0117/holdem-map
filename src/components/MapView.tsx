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

function createPinIcon(color: string, size: number = 28) {
  return L.divIcon({
    className: "",
    html: `<svg width="${size}" height="${Math.round(size * 1.3)}" viewBox="0 0 32 42">
      <filter id="shadow" x="-20%" y="-10%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.3"/>
      </filter>
      <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26C32 7.163 24.837 0 16 0z" fill="${color}" filter="url(#shadow)"/>
      <circle cx="16" cy="15" r="7" fill="white" opacity="0.95"/>
      <circle cx="16" cy="15" r="3" fill="${color}" opacity="0.8"/>
    </svg>`,
    iconSize: [size, Math.round(size * 1.3)],
    iconAnchor: [size / 2, Math.round(size * 1.3)],
    popupAnchor: [0, -Math.round(size * 1.3)],
  });
}

const accentIcon = createPinIcon("#6c5ce7");
const goldIcon = createPinIcon("#ffd32a");
const selectedIcon = createPinIcon("#6c5ce7", 36);

export default function MapView({
  stores,
  onStoreClick,
  selectedStore,
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: defaultCenter,
      zoom: defaultZoom,
      zoomControl: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    mapRef.current = map;
    setReady(true);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !ready) return;
    const map = mapRef.current;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    stores.forEach((store) => {
      const icon = store.isRecommended ? goldIcon : accentIcon;
      const marker = L.marker([store.lat, store.lng], { icon }).addTo(map);

      marker.bindPopup(
        `<div style="font-size:13px;min-width:160px;font-family:-apple-system,sans-serif">
          <strong style="color:#222">${store.name}</strong>
          ${store.isRecommended ? '<span style="background:#ffd32a22;color:#e6a800;font-size:10px;padding:1px 5px;border-radius:4px;margin-left:4px">추천</span>' : ''}
          <br/><span style="color:#888;font-size:11px">${store.hours}</span>
          <br/><span style="color:#aaa;font-size:11px">${store.address}</span>
        </div>`,
        { className: "custom-popup" }
      );

      marker.on("click", () => onStoreClick?.(store));
      markersRef.current.set(store.id, marker);
    });
  }, [stores, ready, onStoreClick]);

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
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-border-custom/50">
      <div ref={containerRef} className="w-full h-full" />

      <div className="absolute bottom-12 left-3 bg-card/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-border-custom/50 z-1000">
        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <span className="text-muted">매장</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-gold" />
            <span className="text-muted">추천</span>
          </div>
        </div>
      </div>

      <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-border-custom/50 z-1000">
        <p className="text-muted text-[11px]">
          매장 <span className="text-accent-light font-semibold">{stores.length}</span>곳
        </p>
      </div>
    </div>
  );
}
