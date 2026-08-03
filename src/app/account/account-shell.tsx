"use client";

import { useState } from "react";
import { Nav } from "@/components/nav";
import { Drawer } from "@/components/drawer";
import { Footer } from "@/components/footer";
import { AccountDashboard } from "./account-dashboard";
import type { ShopifyCustomer, ShopifyOrder, ShopifyAddress } from "@/lib/shopify/customers";

export function AccountShell({
  customer,
  orders,
  email,
  firstName,
  fullName,
  shopifyToken,
  initialAddresses,
  initialDefaultAddressId,
}: {
  customer: ShopifyCustomer | null;
  orders: ShopifyOrder[];
  email: string;
  firstName: string;
  fullName: string;
  shopifyToken: string | null;
  initialAddresses: ShopifyAddress[];
  initialDefaultAddressId: string | null;
}) {
  const [menu, setMenu] = useState(false);

  return (
    <>
      <Nav onMenu={() => setMenu(true)} forceSolid />
      <Drawer open={menu} onClose={() => setMenu(false)} />
      <AccountDashboard
        customer={customer}
        orders={orders}
        email={email}
        firstName={firstName}
        fullName={fullName}
        shopifyToken={shopifyToken}
        initialAddresses={initialAddresses}
        initialDefaultAddressId={initialDefaultAddressId}
      />
      <Footer />
    </>
  );
}
