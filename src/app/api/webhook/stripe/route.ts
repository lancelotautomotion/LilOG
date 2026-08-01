import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";

async function createShopifyOrder(session: Stripe.Checkout.Session) {
  const shop = process.env.SHOPIFY_STORE_DOMAIN!;
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN!;

  const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ["line_items"],
  });

  const lineItems = fullSession.line_items?.data ?? [];
  const customer = session.customer_details;
  const shipping = session.shipping_details;

  const nameParts = (shipping?.name ?? customer?.name ?? "").split(" ");
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ") || firstName;

  const order = {
    line_items: lineItems.map((item) => ({
      title: item.description ?? "Article",
      price: ((item.amount_total ?? 0) / (item.quantity ?? 1) / 100).toFixed(2),
      quantity: item.quantity ?? 1,
    })),
    customer: {
      first_name: firstName,
      last_name: lastName,
      email: customer?.email ?? "",
    },
    email: customer?.email ?? "",
    phone: customer?.phone ?? undefined,
    financial_status: "paid",
    send_receipt: true,
    send_fulfillment_receipt: true,
    shipping_address: shipping?.address
      ? {
          first_name: firstName,
          last_name: lastName,
          address1: shipping.address.line1 ?? "",
          address2: shipping.address.line2 ?? undefined,
          city: shipping.address.city ?? "",
          province: shipping.address.state ?? undefined,
          zip: shipping.address.postal_code ?? "",
          country_code: shipping.address.country ?? "FR",
          phone: customer?.phone ?? undefined,
        }
      : undefined,
    transactions: [
      {
        kind: "sale",
        status: "success",
        amount: ((session.amount_total ?? 0) / 100).toFixed(2),
        currency: (session.currency ?? "eur").toUpperCase(),
      },
    ],
    note: `Stripe: ${session.id}`,
    tags: "stripe",
  };

  const res = await fetch(
    `https://${shop}/admin/api/2025-01/orders.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify({ order }),
    }
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Shopify order failed: ${res.status} ${error}`);
  }

  return res.json();
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return new Response("STRIPE_WEBHOOK_SECRET is not set", { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(`Webhook signature verification failed: ${msg}`, {
      status: 400,
    });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      try {
        await createShopifyOrder(session);
      } catch (err) {
        console.error("Shopify order error:", err);
      }
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("Checkout session expired:", session.id);
      break;
    }
    default:
      break;
  }

  return new Response("OK", { status: 200 });
}
