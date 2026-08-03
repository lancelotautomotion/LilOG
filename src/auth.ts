import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { shopifyCustomerLogin, shopifyGetCustomer } from "@/lib/shopify/customers";
import { getOrCreateShopifyTokenForEmail } from "@/lib/shopify/shadow-account";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const { token, error } = await shopifyCustomerLogin(email, password);
        if (error || !token) return null;

        const customer = await shopifyGetCustomer(token);
        if (!customer) return null;

        return {
          id: customer.id,
          email: customer.email,
          name: [customer.firstName, customer.lastName].filter(Boolean).join(" ") || customer.email,
          shopifyToken: token,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.shopifyToken = (user as { shopifyToken?: string }).shopifyToken ?? null;
      }
      // Google sign-in: relie (ou crée) un compte Shopify miroir pour que
      // le panier et l'historique de commandes fonctionnent comme pour un
      // compte email/mot de passe.
      if (account?.provider === "google" && token.email) {
        const g = profile as { given_name?: string; family_name?: string } | undefined;
        const displayName = (token.name as string) ?? "";
        token.shopifyToken = await getOrCreateShopifyTokenForEmail(
          token.email,
          g?.given_name || displayName.split(" ")[0] || "Cliente",
          g?.family_name || displayName.split(" ").slice(1).join(" ") || "",
        ).catch(() => null);
      }
      return token;
    },
    async session({ session, token }) {
      (session as { shopifyToken?: string | null }).shopifyToken = token.shopifyToken as string | null ?? null;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
