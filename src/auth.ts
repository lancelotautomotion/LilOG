import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { shopifyCustomerLogin, shopifyGetCustomer } from "@/lib/shopify/customers";

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
    async jwt({ token, user, account }) {
      if (user) {
        token.shopifyToken = (user as { shopifyToken?: string }).shopifyToken ?? null;
      }
      // Google sign-in: no Shopify token (account is linked by email)
      if (account?.provider === "google") {
        token.shopifyToken = null;
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
