export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return new Response("Code manquant", { status: 400 });
  }

  const shop = process.env.SHOPIFY_STORE_DOMAIN!;

  const res = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_API_SECRET,
      code,
    }),
  });

  const data = await res.json();
  const token = data.access_token ?? JSON.stringify(data);

  return new Response(
    `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Token Shopify</title></head>
<body style="font-family:monospace;padding:40px;background:#000080;color:#fff;min-height:100vh">
  <h2 style="color:#00ff41">✓ Token récupéré !</h2>
  <p>Copie ce token et ajoute-le dans Vercel comme <strong>SHOPIFY_ADMIN_ACCESS_TOKEN</strong> :</p>
  <div style="background:#fff;color:#000;padding:16px;font-size:14px;word-break:break-all;margin:16px 0">${token}</div>
  <p style="color:#a0cfff">Une fois ajouté dans Vercel → redéploie → cette page ne sera plus nécessaire.</p>
</body>
</html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}
