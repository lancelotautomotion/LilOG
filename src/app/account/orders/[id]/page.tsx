import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { shopifyGetCustomerOrder } from "@/lib/shopify/customers";
import { OrderDetailShell } from "./order-detail-shell";

export const metadata: Metadata = { title: "Détail commande · Lil'OG" };

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");

  const shopifyToken = (session as { shopifyToken?: string | null }).shopifyToken ?? null;
  if (!shopifyToken) redirect("/account");

  const { id } = await params;
  const order = await shopifyGetCustomerOrder(shopifyToken, decodeURIComponent(id));
  if (!order) notFound();

  return <OrderDetailShell order={order} />;
}
