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

function createPinIcon(color: string, glowColor: string, size: number = 30) {
  return L.divIcon({
    className: "",
    html: `<div style="position:relative;width:${size}px;height:${Math.round(size * 1.3)}px">
      <div style="position:absolute;bottom:2px;left:50%;transform:translateX(-50%);width:${size * 0.5}px;height:4px;background:${glowColor};border-radius:50%;filter:blur(3px);opacity:0.5"></div>
      <svg width="${size}" height="${Math.round(size * 1.3)}" viewBox="0 0 30 40" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">
        <path d="M15 0C6.716 0 0 6.716 0 15c0 11.25 15 25 15 25s15-13.75 15-25C30 6.716 23.284 0 15 0z" fill="${color}"/>
        <circle cx="15" cy="14" r="6.5" fill="rgba(255,255,255,0.95)"/>
        <circle cx="15" cy="14" r="3" fill="${color}" opacity="0.7"/>
      </svg>
    </div>`,
    iconSize: [size, Math.round(size * 1.3)],
    iconAnchor: [size / 2, Math.round(size * 1.3)],
    popupAnchor: [0, -Math.round(size * 1.2)],
  });
}

const accentIcon = createPinIcon("#d4a843", "rgba(212,168,67,0.4)");
const goldIcon = createPinIcon("#f0d060", "rgba(240,208,96,0.5)");
const selectedIcon = createPinIcon("#f0d060", "rgba(240,208,96,0.6)", 38);

export default function MapView({ stores, onStoreClick, selectedStore }: MapViewProps) {
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

    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();

    stores.forEach((store) => {
      const icon = store.is_recommended ? goldIcon : accentIcon;
      const marker = L.marker([store.lat, store.lng], { icon }).addTo(map);

      marker.bindPopup(
        `<div style="font-family:-apple-system,sans-serif;min-width:180px;padding:4px 0">
          <div style="font-weight:700;font-size:14px;color:#ffffff;margin-bottom:6px">${store.name}${store.is_recommended ? ' <span style="background:rgba(201,164,74,0.2);color:#e8c84a;font-size:9px;padding:2px 6px;border-radius:4px;font-weight:700;margin-left:4px">추천</span>' : ''}</div>
          <div style="font-size:12px;color:#cdcde0;margin-bottom:3px">영업시간: ${store.hours}</div>
          <div style="font-size:12px;color:#9d9db5">${store.address}</div>
          <div style="font-size:11px;color:#9d9db5;margin-top:4px">${store.phone}</div>
        </div>`,
        {
          className: "dark-popup",
          closeButton: false,
        }
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
        marker.setIcon(store.is_recommended ? goldIcon : accentIcon);
      }
    });
  }, [selectedStore, stores, ready]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/5">
      <style>{`
        .dark-popup .leaflet-popup-content-wrapper {
          background: rgba(22,22,30,0.97);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(201,164,74,0.2);
          border-radius: 14px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(201,164,74,0.08);
          color: #ffffff;
          padding: 4px;
        }
        .dark-popup .leaflet-popup-tip {
          background: rgba(22,22,30,0.97);
          border-right: 1px solid rgba(201,164,74,0.2);
          border-bottom: 1px solid rgba(201,164,74,0.2);
        }
        .dark-popup .leaflet-popup-content {
          margin: 10px 14px;
        }
        .leaflet-control-zoom a {
          background: rgba(22,22,32,0.9) !important;
          backdrop-filter: blur(8px);
          color: #8e8ea0 !important;
          border-color: rgba(255,255,255,0.05) !important;
        }
        .leaflet-control-zoom a:hover {
          background: rgba(30,30,42,0.95) !important;
          color: #d4a843 !important;
        }
      `}</style>
      <div ref={containerRef} className="w-full h-full" />

      {/* Legend */}
      <div className="absolute bottom-12 left-3 glass rounded-xl px-3.5 py-2 border border-white/5 z-1000">
        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <span className="text-muted">매장</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-accent-light" />
            <span className="text-muted">추천</span>
          </div>
        </div>
      </div>

      {/* Count */}
      <div className="absolute top-3 right-3 glass rounded-xl px-3.5 py-2 border border-white/5 z-1000">
        <p className="text-muted/50 text-[11px]">
          매장 <span className="text-accent-light font-bold">{stores.length}</span>
        </p>
      </div>
    </div>
  );
}
