
'use client';

import dynamic from 'next/dynamic';

// Dynamically import the actual map component
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
});

export default function MapWrapper() {
  return <MapComponent />;
}
