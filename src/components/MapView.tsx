"use client";

import { Store } from "@/types";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    kakao: any;
  }
}

interface MapViewProps {
  stores: Store[];
  onStoreClick?: (store: Store) => void;
  selectedStore?: Store | null;
}

const defaultCenter = { lat: 37.5, lng: 126.95 };
const defaultZoom = 8;

export default function MapView({ stores, onStoreClick, selectedStore }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const overlayRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  // Init map
  useEffect(() => {
    if (!containerRef.current) return;

    const initMap = () => {
      if (!window.kakao?.maps) return;

      window.kakao.maps.load(() => {
        const options = {
          center: new window.kakao.maps.LatLng(defaultCenter.lat, defaultCenter.lng),
          level: defaultZoom,
        };
        const map = new window.kakao.maps.Map(containerRef.current, options);

        // Add zoom control
        const zoomControl = new window.kakao.maps.ZoomControl();
        map.addControl(zoomControl, window.kakao.maps.ControlPosition.BOTTOMRIGHT);

        mapRef.current = map;
        setReady(true);
      });
    };

    if (window.kakao?.maps) {
      initMap();
    } else {
      const check = setInterval(() => {
        if (window.kakao?.maps) { clearInterval(check); initMap(); }
      }, 100);
      return () => clearInterval(check);
    }
  }, []);

  // Update markers
  useEffect(() => {
    if (!mapRef.current || !ready) return;
    const map = mapRef.current;

    // Clear old markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current.clear();
    if (overlayRef.current) { overlayRef.current.setMap(null); overlayRef.current = null; }

    stores.forEach(store => {
      const position = new window.kakao.maps.LatLng(store.lat, store.lng);

      const markerImage = new window.kakao.maps.MarkerImage(
        `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36"><path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z" fill="${store.is_recommended ? '#02b350' : '#03c75a'}"/><circle cx="14" cy="13" r="5.5" fill="white"/><circle cx="14" cy="13" r="2.5" fill="${store.is_recommended ? '#02b350' : '#03c75a'}" opacity="0.7"/></svg>`)}`,
        new window.kakao.maps.Size(28, 36),
        { offset: new window.kakao.maps.Point(14, 36) }
      );

      const marker = new window.kakao.maps.Marker({ position, image: markerImage });
      marker.setMap(map);

      // Click event
      window.kakao.maps.event.addListener(marker, "click", () => {
        onStoreClick?.(store);

        // Custom overlay (info window)
        if (overlayRef.current) overlayRef.current.setMap(null);

        const content = `<div style="background:white;border:1px solid #e5e5e5;border-radius:12px;padding:14px 16px;min-width:200px;box-shadow:0 4px 20px rgba(0,0,0,0.1);font-family:-apple-system,sans-serif;position:relative">
          <a href="/store/${store.id}" style="font-weight:700;font-size:14px;color:#03c75a;text-decoration:none;display:block;margin-bottom:6px">${store.name}${store.is_recommended ? ' <span style="background:#e6f7ee;color:#03c75a;font-size:9px;padding:2px 6px;border-radius:4px;font-weight:700;margin-left:4px">추천</span>' : ''} <span style="font-size:11px;color:#999">→</span></a>
          <div style="font-size:12px;color:#555;margin-bottom:3px">${store.hours}</div>
          <div style="font-size:12px;color:#777">${store.address}</div>
          ${store.phone ? `<div style="font-size:11px;color:#777;margin-top:4px">${store.phone}</div>` : ''}
          <div style="position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);width:16px;height:16px;background:white;border-right:1px solid #e5e5e5;border-bottom:1px solid #e5e5e5;transform:translateX(-50%) rotate(45deg)"></div>
        </div>`;

        const overlay = new window.kakao.maps.CustomOverlay({
          content, position, yAnchor: 1.15,
        });
        overlay.setMap(map);
        overlayRef.current = overlay;

        map.panTo(position);
      });

      markersRef.current.set(store.id, marker);
    });

    // Click on map to close overlay
    window.kakao.maps.event.addListener(map, "click", () => {
      if (overlayRef.current) { overlayRef.current.setMap(null); overlayRef.current = null; }
    });
  }, [stores, ready, onStoreClick]);

  // Handle selected store
  useEffect(() => {
    if (!mapRef.current || !ready || !selectedStore) return;

    const marker = markersRef.current.get(selectedStore.id);
    if (marker) {
      window.kakao.maps.event.trigger(marker, "click");
    }
  }, [selectedStore, ready]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-border-custom z-0">
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute top-3 right-3 bg-white rounded-lg px-3 py-1.5 border border-border-custom shadow-sm" style={{ zIndex: 2 }}>
        <p className="text-muted text-xs">
          매장 <span className="text-accent font-bold">{stores.length}</span>
        </p>
      </div>
    </div>
  );
}
