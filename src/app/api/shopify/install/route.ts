export async function GET() {
  const clientId = process.env.SHOPIFY_API_KEY!;
  const shop = process.env.SHOPIFY_STORE_DOMAIN!;
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/shopify/callback`;
  const scopes = "write_orders,read_orders,write_customers,read_customers";
  const state = Math.random().toString(36).substring(2, 15);

  const authUrl =
    `https://${shop}/admin/oauth/authorize` +
    `?client_id=${clientId}` +
    `&scope=${scopes}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${state}`;

  return Response.redirect(authUrl);
}
