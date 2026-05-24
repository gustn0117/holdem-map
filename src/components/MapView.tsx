"use client";

import { Store } from "@/types";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    kakao: {
      maps: {
        load: (cb: () => void) => void;
        Map: new (container: HTMLElement, options: { center: KakaoLatLng; level: number }) => KakaoMap;
        LatLng: new (lat: number, lng: number) => KakaoLatLng;
        Size: new (w: number, h: number) => KakaoSize;
        Point: new (x: number, y: number) => KakaoPoint;
        Marker: new (options: { position: KakaoLatLng; image?: KakaoMarkerImage; map?: KakaoMap; title?: string }) => KakaoMarker;
        MarkerImage: new (src: string, size: KakaoSize, options?: { offset?: KakaoPoint }) => KakaoMarkerImage;
        InfoWindow: new (options: { content: string; removable?: boolean; zIndex?: number }) => KakaoInfoWindow;
        event: { addListener: (target: object, type: string, handler: () => void) => void };
        ZoomControl: new () => object;
        ControlPosition: { RIGHT: number };
      };
    };
  }
}

type KakaoLatLng = { getLat: () => number; getLng: () => number };
type KakaoSize = object;
type KakaoPoint = object;
type KakaoMarkerImage = object;
type KakaoMap = {
  setLevel: (level: number, options?: { anchor?: KakaoLatLng; animate?: boolean }) => void;
  panTo: (latlng: KakaoLatLng) => void;
  setCenter: (latlng: KakaoLatLng) => void;
  addControl: (control: object, position: number) => void;
  relayout: () => void;
};
type KakaoMarker = {
  setMap: (map: KakaoMap | null) => void;
  setImage: (image: KakaoMarkerImage) => void;
  getPosition: () => KakaoLatLng;
};
type KakaoInfoWindow = {
  open: (map: KakaoMap, marker: KakaoMarker) => void;
  close: () => void;
};

interface MapViewProps {
  stores: Store[];
  onStoreClick?: (store: Store) => void;
  selectedStore?: Store | null;
}

const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
const DEFAULT_CENTER = { lat: 37.5, lng: 126.95 };
const DEFAULT_LEVEL = 9;
const SELECTED_LEVEL = 5;
const PIN_SIZE = 30;
const SELECTED_PIN_SIZE = 38;

function pinDataUri(color: string, size: number) {
  const h = Math.round(size * 1.3);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${h}" viewBox="0 0 30 40">
    <defs><filter id="s" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/></filter></defs>
    <g filter="url(#s)">
      <path d="M15 0C6.716 0 0 6.716 0 15c0 11.25 15 25 15 25s15-13.75 15-25C30 6.716 23.284 0 15 0z" fill="${color}"/>
      <circle cx="15" cy="14" r="6.5" fill="rgba(255,255,255,0.95)"/>
      <circle cx="15" cy="14" r="3" fill="${color}" opacity="0.7"/>
    </g>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

let sdkPromise: Promise<Window["kakao"]> | null = null;

function loadKakaoSdk(): Promise<Window["kakao"]> {
  if (typeof window === "undefined") return Promise.reject(new Error("SSR"));
  if (window.kakao?.maps?.Map) return Promise.resolve(window.kakao);
  if (sdkPromise) return sdkPromise;
  if (!KAKAO_KEY) return Promise.reject(new Error("NEXT_PUBLIC_KAKAO_MAP_KEY 미설정"));

  sdkPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById("kakao-maps-sdk") as HTMLScriptElement | null;
    const onScriptReady = () => window.kakao.maps.load(() => resolve(window.kakao));
    if (existing) {
      if (window.kakao?.maps) onScriptReady();
      else existing.addEventListener("load", onScriptReady, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.id = "kakao-maps-sdk";
    script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&autoload=false`;
    script.onload = onScriptReady;
    script.onerror = () => { sdkPromise = null; reject(new Error("Kakao Maps SDK 로드 실패")); };
    document.head.appendChild(script);
  });
  return sdkPromise;
}

export default function MapView({ stores, onStoreClick, selectedStore }: MapViewProps) {
  const mapRef = useRef<KakaoMap | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, KakaoMarker>>(new Map());
  const infoRef = useRef<KakaoInfoWindow | null>(null);
  const imagesRef = useRef<{ accent: KakaoMarkerImage; recommended: KakaoMarkerImage; selected: KakaoMarkerImage } | null>(null);
  const onStoreClickRef = useRef(onStoreClick);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { onStoreClickRef.current = onStoreClick; }, [onStoreClick]);

  useEffect(() => {
    let cancelled = false;
    loadKakaoSdk()
      .then((kakao) => {
        if (cancelled || !containerRef.current || mapRef.current) return;
        const map = new kakao.maps.Map(containerRef.current, {
          center: new kakao.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
          level: DEFAULT_LEVEL,
        });
        map.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.RIGHT);
        mapRef.current = map;

        const mkImg = (color: string, size: number) =>
          new kakao.maps.MarkerImage(
            pinDataUri(color, size),
            new kakao.maps.Size(size, Math.round(size * 1.3)),
            { offset: new kakao.maps.Point(size / 2, Math.round(size * 1.3)) }
          );
        imagesRef.current = {
          accent: mkImg("#03c75a", PIN_SIZE),
          recommended: mkImg("#02a94c", PIN_SIZE),
          selected: mkImg("#006b3a", SELECTED_PIN_SIZE),
        };
        setReady(true);
      })
      .catch(() => { if (!cancelled) setError("지도를 준비 중입니다. 카카오맵 API 권한 활성화 후 자동으로 표시됩니다."); });

    return () => {
      cancelled = true;
      infoRef.current?.close();
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current.clear();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current || !window.kakao || !imagesRef.current) return;
    const kakao = window.kakao;
    const map = mapRef.current;
    const images = imagesRef.current;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current.clear();

    stores.forEach((store) => {
      const marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(store.lat, store.lng),
        image: store.is_recommended ? images.recommended : images.accent,
        map,
        title: store.name,
      });
      kakao.maps.event.addListener(marker, "click", () => onStoreClickRef.current?.(store));
      markersRef.current.set(store.id, marker);
    });
  }, [stores, ready]);

  useEffect(() => {
    if (!ready || !mapRef.current || !window.kakao || !imagesRef.current) return;
    const map = mapRef.current;
    const images = imagesRef.current;
    const kakao = window.kakao;

    if (!selectedStore) {
      infoRef.current?.close();
      markersRef.current.forEach((marker, id) => {
        const store = stores.find((s) => s.id === id);
        if (store) marker.setImage(store.is_recommended ? images.recommended : images.accent);
      });
      return;
    }

    markersRef.current.forEach((marker, id) => {
      const store = stores.find((s) => s.id === id);
      if (!store) return;
      if (selectedStore.id === id) {
        marker.setImage(images.selected);
        const recommendedBadge = store.is_recommended
          ? ' <span style="background:#e6f7ee;color:#03c75a;font-size:9px;padding:2px 6px;border-radius:4px;font-weight:700;margin-left:4px">추천</span>'
          : "";
        const phoneRow = store.phone
          ? `<div style="font-size:11px;color:#777;margin-top:4px">${store.phone}</div>`
          : "";
        const content = `<div style="font-family:-apple-system,sans-serif;min-width:180px;padding:10px 14px">
          <a href="/store/${store.id}" style="font-weight:700;font-size:14px;color:#03c75a;text-decoration:none;display:block;margin-bottom:6px">${store.name}${recommendedBadge} <span style="font-size:11px;color:#999">→</span></a>
          <div style="font-size:12px;color:#555;margin-bottom:3px">${store.hours}</div>
          <div style="font-size:12px;color:#777">${store.address}</div>
          ${phoneRow}
        </div>`;
        infoRef.current?.close();
        infoRef.current = new kakao.maps.InfoWindow({ content, removable: false, zIndex: 3 });
        infoRef.current.open(map, marker);
        map.setLevel(SELECTED_LEVEL, { animate: true });
        map.panTo(marker.getPosition());
      } else {
        marker.setImage(store.is_recommended ? images.recommended : images.accent);
      }
    });
  }, [selectedStore, stores, ready]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-border-custom z-0">
      <div ref={containerRef} className="w-full h-full bg-card" />
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/95 p-6 text-center gap-3">
          <svg className="w-12 h-12 text-muted opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-surface text-sm font-semibold">지도를 준비 중입니다</p>
          <p className="text-muted text-xs max-w-xs leading-relaxed">카카오맵 API 권한이 활성화되면<br />자동으로 지도가 표시됩니다.</p>
        </div>
      )}
      <div className="absolute top-3 right-3 bg-white rounded-lg px-3 py-1.5 border border-border-custom shadow-sm" style={{ zIndex: 2 }}>
        <p className="text-muted text-xs">매장 <span className="text-accent font-bold">{stores.length}</span></p>
      </div>
    </div>
  );
}
