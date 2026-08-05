"use client";

import { Store } from "@/types";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapViewProps {
  stores: Store[];
  onStoreClick?: (store: Store) => void;
  selectedStore?: Store | null;
  /** 홈·상세 등 페이지에 끼워 넣는 지도. 휠 줌/한손가락 드래그를 꺼서 페이지 스크롤을 방해하지 않는다 */
  embedded?: boolean;
}

const defaultCenter: [number, number] = [37.5, 126.95];
const defaultZoom = 11;

// 대한민국 영역(제주·울릉 포함)으로 지도 이동·축소 범위를 제한
const KOREA_BOUNDS: L.LatLngBoundsExpression = [
  [33.0, 124.5], // 남서
  [38.7, 132.0], // 북동
];
const MIN_ZOOM = 6; // 이보다 더 축소(세계지도)되지 않도록

function createPinIcon(color: string, size: number = 30) {
  return L.divIcon({
    className: "",
    html: `<div style="position:relative;width:${size}px;height:${Math.round(size * 1.3)}px">
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

const accentIcon = createPinIcon("#03c75a");
const recommendedIcon = createPinIcon("#02a94c");
const selectedIcon = createPinIcon("#006b3a", 38);

export default function MapView({ stores, onStoreClick, selectedStore, embedded = false }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: defaultCenter,
      zoom: defaultZoom,
      minZoom: MIN_ZOOM,
      zoomControl: false,
      maxBounds: KOREA_BOUNDS,
      maxBoundsViscosity: 1.0, // 경계 밖으로 밀리지 않게 단단히 고정
      // 임베드 지도(홈·상세): 마우스 휠 줌·드래그를 꺼서 페이지 스크롤을 방해하지 않음
      scrollWheelZoom: !embedded,
      dragging: !embedded,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 19,
      noWrap: true, // 세계지도가 좌우로 반복되지 않도록
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    mapRef.current = map;
    setReady(true);

    return () => { map.remove(); mapRef.current = null; };
  }, [embedded]);

  useEffect(() => {
    if (!mapRef.current || !ready) return;
    const map = mapRef.current;

    markersRef.current.forEach(m => m.remove());
    markersRef.current.clear();

    stores.forEach(store => {
      const icon = store.is_recommended ? recommendedIcon : accentIcon;
      const marker = L.marker([store.lat, store.lng], { icon }).addTo(map);

      marker.bindPopup(
        `<div style="font-family:-apple-system,sans-serif;min-width:180px;padding:4px 0">
          <a href="/store/${store.id}" style="font-weight:700;font-size:14px;color:#03c75a;text-decoration:none;display:block;margin-bottom:6px">${store.name}${store.is_recommended ? ' <span style="background:#e6f7ee;color:#03c75a;font-size:9px;padding:2px 6px;border-radius:4px;font-weight:700;margin-left:4px">추천</span>' : ''} <span style="font-size:11px;color:#999">→</span></a>
          <div style="font-size:12px;color:#555;margin-bottom:3px">${store.hours}</div>
          <div style="font-size:12px;color:#777">${store.address}</div>
          ${store.phone ? `<div style="font-size:11px;color:#777;margin-top:4px">${store.phone}</div>` : ''}
        </div>`,
        { className: "holdem-popup", closeButton: false }
      );

      marker.on("click", () => onStoreClick?.(store));
      markersRef.current.set(store.id, marker);
    });
  }, [stores, ready, onStoreClick]);

  useEffect(() => {
    if (!mapRef.current || !ready) return;

    markersRef.current.forEach((marker, id) => {
      const store = stores.find(s => s.id === id);
      if (!store) return;
      if (selectedStore?.id === id) {
        marker.setIcon(selectedIcon);
        marker.openPopup();
        mapRef.current?.setView([store.lat, store.lng], 13, { animate: true });
      } else {
        marker.setIcon(store.is_recommended ? recommendedIcon : accentIcon);
      }
    });
  }, [selectedStore, stores, ready]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-border-custom z-0">
      <style>{`
        .holdem-popup .leaflet-popup-content-wrapper {
          background: #fff; border: 1px solid #e5e5e5; border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1); color: #1a1a1a; padding: 4px;
        }
        .holdem-popup .leaflet-popup-tip { background: #fff; border-right: 1px solid #e5e5e5; border-bottom: 1px solid #e5e5e5; }
        .holdem-popup .leaflet-popup-content { margin: 10px 14px; }
        .leaflet-control-zoom a { background: #fff !important; color: #777 !important; border-color: #e5e5e5 !important; }
        .leaflet-control-zoom a:hover { background: #f5f5f5 !important; color: #03c75a !important; }
      `}</style>
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute top-3 right-3 bg-white rounded-lg px-3 py-1.5 border border-border-custom shadow-sm" style={{ zIndex: 2 }}>
        <p className="text-muted text-xs">매장 <span className="text-accent font-bold">{stores.length}</span></p>
      </div>
    </div>
  );
}
