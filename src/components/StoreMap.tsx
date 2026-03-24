"use client";

import dynamic from "next/dynamic";
import { Store } from "@/types";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function StoreMap({ store }: { store: Store }) {
  return <MapView stores={[store]} />;
}
