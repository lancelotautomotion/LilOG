import type { Metadata } from "next";
import { FaqShell } from "@/components/faq-shell";

export const metadata: Metadata = { title: "FAQ · Lil'OG" };

export default function FaqPage() {
  return <FaqShell />;
}
