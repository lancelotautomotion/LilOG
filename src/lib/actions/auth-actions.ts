"use server";

import { shopifyCustomerCreate, type ShopifyCustomer } from "@/lib/shopify/customers";

export async function actionSignup(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
): Promise<{ customer: ShopifyCustomer | null; error: string | null }> {
  return shopifyCustomerCreate(email, password, firstName, lastName);
}
