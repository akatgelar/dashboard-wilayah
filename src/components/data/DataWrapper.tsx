
'use client';

import dynamic from 'next/dynamic';

// Dynamically import the actual map component
const DataComponent = dynamic(() => import('./DataComponent'), {
  ssr: false,
});

export default function DataWrapper() {
  return <DataComponent />;
}
