import type { Metadata } from "next";
import { WishlistShell } from "@/components/wishlist-shell";

export const metadata: Metadata = { title: "Ma Wishlist — Lil'OG" };

export default function WishlistPage() {
  return <WishlistShell />;
}
