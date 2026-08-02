import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { shopifyGetCustomerWithOrders } from "@/lib/shopify/customers";
import { AccountDashboard } from "./account-dashboard";

export const metadata: Metadata = { title: "Mon compte — Lil'OG" };

export default async function AccountPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const shopifyToken = (session as { shopifyToken?: string | null }).shopifyToken ?? null;

  const displayName = session.user?.name ?? session.user?.email ?? "Cliente";
  const firstName = displayName.split(" ")[0];
  const email = session.user?.email ?? "";

  const { customer, orders } = shopifyToken
    ? await shopifyGetCustomerWithOrders(shopifyToken)
    : { customer: null, orders: [] };

  const fullName = customer
    ? [customer.firstName, customer.lastName].filter(Boolean).join(" ") || displayName
    : displayName;

  return (
    <AccountDashboard
      customer={customer}
      orders={orders}
      email={email}
      firstName={firstName}
      fullName={fullName}
      shopifyToken={shopifyToken}
    />
  );
}
