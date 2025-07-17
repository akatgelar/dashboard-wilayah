import type { Metadata } from "next"; 
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Root | Dashboard Wilayah",
  description: "Dashboard Wilayah",
};

export default function Root() {

  redirect(`/signin`)

}
