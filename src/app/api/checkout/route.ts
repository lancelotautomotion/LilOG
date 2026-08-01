import { stripe } from "@/lib/stripe";
import type { CartLine } from "@/lib/shopify/types";

export async function POST(request: Request) {
  const { lines, currency = "eur" }: { lines: CartLine[]; currency?: string } =
    await request.json();

  if (!lines?.length) {
    return Response.json({ error: "Panier vide" }, { status: 400 });
  }

  const origin =
    request.headers.get("origin") ??
    process.env.NEXTAUTH_URL ??
    "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    currency,
    line_items: lines.map((line) => ({
      quantity: line.quantity,
      price_data: {
        currency,
        unit_amount: Math.round(line.price * 100),
        product_data: {
          name: line.title,
          ...(line.variantTitle &&
            line.variantTitle !== "Default Title" && {
              description: line.variantTitle,
            }),
          ...(line.image && { images: [line.image] }),
          metadata: { handle: line.handle },
        },
      },
    })),
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/cart`,
  });

  return Response.json({ url: session.url });
}
