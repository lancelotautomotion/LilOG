import type { Metadata } from "next";
import { HistoireShell } from "@/components/histoire-shell";

export const metadata: Metadata = { title: "Notre Histoire — Lil'OG" };

export default function HistoirePage() {
  return <HistoireShell />;
}
