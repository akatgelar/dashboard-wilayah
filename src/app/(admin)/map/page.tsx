
import { Metadata } from "next";
import MapWrapper from '@/components/map/MapWrapper';
 
export const metadata: Metadata = {
    title: "Map | Dashboard Wilayah",
    description: "Halaman map", 
};
 
export default function Map() {

  return <MapWrapper/>;
}