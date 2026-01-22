'use client';

import dynamic from "next/dynamic";

const RestaurantsMap = dynamic(() => import("./MapClient"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[80vh] text-slate-500">
      Loading map…
    </div>
  )
});

export default function MapWrapper() {
  return <RestaurantsMap />;
}