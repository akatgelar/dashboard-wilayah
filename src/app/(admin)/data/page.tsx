import { Metadata } from "next";
import DataWrapper from "@/components/data/DataWrapper";


export const metadata: Metadata = {
    title: "Data | Dashboard Wilayah",
    description: "Halaman data", 
};
 
export default async function Data() {

  return <DataWrapper/>;
}