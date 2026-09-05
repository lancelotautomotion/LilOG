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
      /* Le fournisseur n'est présent qu'à la connexion : on le retient, il
         détermine si l'adresse e-mail du compte Shopify peut être modifiée
         (voir updateProfile dans account/edit/page.tsx). */
      if (account?.provider) token.authProvider = account.provider;
      if (user) {
        token.shopifyToken = user.shopifyToken ?? null;
      }
      // Google sign-in: relie (ou crée) un compte Shopify miroir pour que
      // le panier et l'historique de commandes fonctionnent comme pour un
      // compte email/mot de passe.
      if (account?.provider === "google" && token.email) {
        const g = profile as
          | { given_name?: string; family_name?: string; email_verified?: boolean }
          | undefined;

        /* On ne relie un compte Shopify qu'à un email dont Google atteste la
           vérification. Sans ce contrôle, un compte Google dont l'adresse
           n'est pas confirmée pourrait revendiquer l'email d'une cliente
           existante — et le compte miroir est justement retrouvé par email. */
        if (g?.email_verified === false) {
          token.shopifyToken = null;
          return token;
        }

        const displayName = (token.name as string) ?? "";
        const result = await getOrCreateShopifyTokenForEmail(
          token.email,
          g?.given_name || displayName.split(" ")[0] || "Cliente",
          g?.family_name || displayName.split(" ").slice(1).join(" ") || "",
        ).catch(() => ({ status: "unavailable", token: null }) as const);

        token.shopifyToken = result.token;
        /* Conservé pour expliquer la situation à la cliente plutôt que de
           lui présenter un espace compte vide sans un mot. */
        token.shopifyLinkStatus = result.status;
      }
      return token;
    },
    /* Ce callback définit ce que le NAVIGATEUR reçoit : l'objet renvoyé ici
       est sérialisé en clair par GET /api/auth/session et injecté dans le
       SessionProvider. Le customerAccessToken Shopify n'a donc rien à y
       faire — il donne accès à l'historique de commandes, aux adresses, et
       à customerUpdate, qui accepte `password` (prise de contrôle du
       compte). Il reste dans le JWT, d'où `getShopifyToken()` le relit
       côté serveur (@/lib/shopify/session-token).

       Le client, lui, n'a besoin que de savoir si un compte Shopify est
       relié : c'est ce qui conditionne l'affichage du bouton « Modifier le
       profil ». */
    async session({ session, token }) {
      session.hasShopifyAccount =
        typeof token.shopifyToken === "string" && token.shopifyToken.length > 0;
      /* Un statut, pas un secret : il dit POURQUOI le compte n'est pas relié,
         ce que le client a besoin de savoir pour proposer la réparation. */
      session.shopifyLinkStatus = token.shopifyLinkStatus ?? null;
      session.authProvider = token.authProvider ?? null;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
