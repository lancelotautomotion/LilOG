"use server";

import { shopifyCustomerReset } from "@/lib/shopify/customers";

export async function actionResetPassword(customerId: string, token: string, password: string) {
  const { error } = await shopifyCustomerReset(`gid://shopify/Customer/${customerId}`, token, password);
  return { error };
}
