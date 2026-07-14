import type { Metadata } from "next";
import { DurabiliteShell } from "@/components/durabilite-shell";

export const metadata: Metadata = { title: "Durabilité — Lil'OG" };

export default function DurabilitePage() {
  return <DurabiliteShell />;
}
