"use server";

import { shopifyCustomerRecover } from "@/lib/shopify/customers";

export async function actionRequestPasswordReset(email: string) {
  return shopifyCustomerRecover(email);
}
