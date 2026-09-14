import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      /* /selection/ : les vitrines privées partagées par lien. Seul le
         préfixe est refusé — la clé secrète qui suit n'apparaît jamais ici,
         robots.txt étant lui-même public. C'est la troisième barrière, après
         le `noindex` des métadonnées de la page et l'en-tête HTTP
         X-Robots-Tag posé dans next.config.ts. */
      disallow: ["/api/", "/account/", "/admin/", "/selection/"],
    },
    sitemap: "https://lilog.shop/sitemap.xml",
  };
}
