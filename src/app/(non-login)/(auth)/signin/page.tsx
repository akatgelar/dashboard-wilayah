import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SignIn Page | Dashboard Wilayah",
  description: "Dashboard Wilayah",
};

export default function SignIn() {
  return <SignInForm />;
}
