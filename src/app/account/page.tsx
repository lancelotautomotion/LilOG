import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { shopifyGetCustomerWithOrders, shopifyGetAddresses } from "@/lib/shopify/customers";
import { getShopifyToken } from "@/lib/shopify/session-token";
import { AccountShell } from "./account-shell";

export const metadata: Metadata = { title: "Mon compte · Lil'OG" };

export default async function AccountPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const shopifyToken = await getShopifyToken();

  const displayName = session.user?.name ?? session.user?.email ?? "Cliente";
  const firstName = displayName.split(" ")[0];
  const email = session.user?.email ?? "";

  const [{ customer, orders }, { addresses, defaultAddressId }] = shopifyToken
    ? await Promise.all([
        shopifyGetCustomerWithOrders(shopifyToken),
        shopifyGetAddresses(shopifyToken),
      ])
    : [{ customer: null, orders: [] }, { addresses: [], defaultAddressId: null }];

  const fullName = customer
    ? [customer.firstName, customer.lastName].filter(Boolean).join(" ") || displayName
    : displayName;

  return (
    <AccountShell
      customer={customer}
      orders={orders}
      email={email}
      firstName={firstName}
      fullName={fullName}
      hasShopifyAccount={shopifyToken !== null}
      initialAddresses={addresses}
      initialDefaultAddressId={defaultAddressId}
    />
  );
}
