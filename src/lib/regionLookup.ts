import { regionData } from "@/data/areas";

const districtToCity = (() => {
  const m: Record<string, string[]> = {};
  for (const [city, districts] of Object.entries(regionData)) {
    for (const d of districts) {
      if (!m[d]) m[d] = [];
      m[d].push(city);
    }
  }
  return m;
})();

export function citiesContainingDistrict(district: string): string[] {
  return districtToCity[district] || [];
}

export function isValidCity(city: string): boolean {
  return city in regionData;
}

export function isValidDistrict(city: string, district: string): boolean {
  return regionData[city]?.includes(district) || false;
}

export function getCityList(): string[] {
  return Object.keys(regionData);
}

export function getDistrictList(city: string): string[] {
  return regionData[city] || [];
}

/** stores 테이블 row에서 시·도 추정 (region 필드 → district→city 매핑 → address 텍스트 매칭 순) */
export function detectStoreCity(store: { region?: string | null; address?: string | null }): string | null {
  const region = (store.region || "").trim();
  const address = (store.address || "").trim();
  if (region && regionData[region]) return region;
  if (region) {
    const cities = districtToCity[region];
    if (cities && cities.length === 1) return cities[0];
    if (cities && cities.length > 1) {
      const fromAddr = cities.find(c => address.startsWith(c));
      if (fromAddr) return fromAddr;
    }
  }
  for (const city of Object.keys(regionData)) {
    if (address.startsWith(city)) return city;
  }
  return null;
}

export function detectStoreDistrict(store: { region?: string | null; address?: string | null }, city: string): string | null {
  const districts = regionData[city] || [];
  const region = (store.region || "").trim();
  if (region && districts.includes(region)) return region;
  const address = store.address || "";
  for (const d of districts) {
    if (address.includes(d)) return d;
  }
  return null;
}
