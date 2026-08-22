import type { MetadataRoute } from "next";
import { shopifyFetch } from "@/lib/shopify/client";
import { ALL_PRODUCTS_QUERY, ALL_COLLECTIONS_QUERY } from "@/lib/shopify/queries";

const SITE_URL = "https://lilog.shop";

interface ProductsResponse {
  products: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    edges: Array<{ node: { handle: string; title: string } }>;
  };
}

interface CollectionsResponse {
  collections: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    edges: Array<{ node: { handle: string; title: string; updatedAt: string } }>;
  };
}

async function getAllProducts(): Promise<Array<{ handle: string; title: string }>> {
  const products: Array<{ handle: string; title: string }> = [];
  let hasNextPage = true;
  let cursor: string | null = null;

  while (hasNextPage) {
    const data: ProductsResponse = await shopifyFetch<ProductsResponse>(ALL_PRODUCTS_QUERY, {
      first: 100,
      after: cursor,
    }, 3600); // cache for 1 hour

    const edges = data.products.edges;
    for (const edge of edges) {
      products.push({
        handle: edge.node.handle,
        title: edge.node.title,
      });
    }

    hasNextPage = data.products.pageInfo.hasNextPage;
    cursor = data.products.pageInfo.endCursor;
  }

  return products;
}

async function getAllCollections(): Promise<
  Array<{ handle: string; title: string; updatedAt: string }>
> {
  const collections: Array<{ handle: string; title: string; updatedAt: string }> = [];
  let hasNextPage = true;
  let cursor: string | null = null;

  while (hasNextPage) {
    const data: CollectionsResponse = await shopifyFetch<CollectionsResponse>(
      ALL_COLLECTIONS_QUERY,
      {
        first: 100,
        after: cursor,
      },
      3600
    ); // cache for 1 hour

    const edges = data.collections.edges;
    for (const edge of edges) {
      collections.push({
        handle: edge.node.handle,
        title: edge.node.title,
        updatedAt: edge.node.updatedAt,
      });
    }

    hasNextPage = data.collections.pageInfo.hasNextPage;
    cursor = data.collections.pageInfo.endCursor;
  }

  return collections;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/gift-card`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/histoire`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/durabilite`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/faq`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/contact`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/livraison`,
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/retours`,
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/cgv`,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/confidentialite`,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/mentions-legales`,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/cookies`,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/search`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  try {
    const [products, collections] = await Promise.all([
      getAllProducts(),
      getAllCollections(),
    ]);

    const productPages: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${SITE_URL}/products/${product.handle}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    const collectionPages: MetadataRoute.Sitemap = collections.map((collection) => ({
      url: `${SITE_URL}/category/${collection.handle}`,
      changeFrequency: "weekly" as const,
      priority: 0.9,
      lastModified: new Date(collection.updatedAt),
    }));

    return [...staticPages, ...collectionPages, ...productPages];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return staticPages;
  }
}
