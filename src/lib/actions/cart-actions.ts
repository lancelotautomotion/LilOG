"use server";

import { cookies } from "next/headers";
import { auth } from "@/auth";
import { getShopifyToken } from "@/lib/shopify/session-token";
import {
  addCartLines,
  cartBuyerIdentityUpdate,
  createCartWithLines,
  getCartNode,
  mapCart,
  removeCartLine,
  updateCartLine,
} from "@/lib/shopify/cart";
import type { CartLineInput } from "@/lib/shopify/cart";
import type { Cart } from "@/lib/shopify/types";

const CART_COOKIE = "lilog_cart_id";

/* ── Validation des lignes entrantes ───────────────────────────────────────
 *
 * Une Server Action `"use server"` n'est pas un appel de fonction privé :
 * c'est un endpoint HTTP public, appelable directement, sans passer par le
 * formulaire qui l'utilise normalement. Ce qui arrive ici n'est donc pas
 * « ce que le tunnel carte cadeau a envoyé », mais n'importe quoi.
 *
 * Les attributs comptent double : Shopify les attache à la commande et les
 * rend dans les emails de notification, dont les gabarits Liquid n'échappent
 * rien (`confirmation-commande.liquid`, `{{ property.last }}` — y compris
 * dans un href). Sans liste blanche, ce point d'entrée injecte du HTML dans
 * un email portant votre marque.
 */
const ALLOWED_ATTR_KEYS = new Set([
  // Clés réservées Shopify du tunnel carte cadeau (cf. setup-wizard.tsx).
  "__shopify_send_gift_card_to_recipient",
  "Recipient email",
  "Recipient name",
  "Message",
  "Send on",
]);

const MAX_LINES = 30;
const MAX_ATTRS_PER_LINE = 8;
const MAX_ATTR_VALUE = 500;
const MAX_QUANTITY = 20;

function sanitizeLines(lines: CartLineInput[]): CartLineInput[] {
  return lines.slice(0, MAX_LINES).map((l) => ({
    variantId: String(l.variantId ?? ""),
    /* La quantité n'était bornée nulle part : un décimal ou un négatif
       partait tel quel dans la mutation Shopify. */
    quantity: Math.min(Math.max(Math.trunc(Number(l.quantity) || 1), 1), MAX_QUANTITY),
    attributes: (Array.isArray(l.attributes) ? l.attributes : [])
      .filter((a) => a && ALLOWED_ATTR_KEYS.has(a.key))
      .slice(0, MAX_ATTRS_PER_LINE)
      .map((a) => ({
        key: a.key,
        // Chevrons et guillemets n'ont aucun usage légitime dans un nom, un
        // email ou un message de carte cadeau, et sont exactement ce qui
        // casse le rendu HTML des notifications.
        value: String(a.value ?? "").replace(/[<>"']/g, "").slice(0, MAX_ATTR_VALUE),
      })),
  }));
}

/* Le panier se lie au client Shopify connecté, mais reste utilisable sans
   compte : pas de session, pas de token, et l'ajout au panier fonctionne
   quand même. */
async function currentShopifyToken(): Promise<string | null> {
  if (!(await auth())) return null;
  return getShopifyToken();
}

/* Lie le panier au client Shopify connecté s'il ne l'est pas déjà,
   condition pour que la commande finale apparaisse dans son historique. */
async function ensureLinkedToCustomer(cartId: string, token: string | null): Promise<Cart | null> {
  if (!token) return null;
  return cartBuyerIdentityUpdate(cartId, token).catch((err) => {
    console.error("[cart] échec de l'association panier ↔ client:", err instanceof Error ? err.message : err);
    return null;
  });
}

export async function getCartAction(): Promise<Cart | null> {
  const cartId = (await cookies()).get(CART_COOKIE)?.value;
  if (!cartId) return null;
  try {
    const node = await getCartNode(cartId);
    if (!node) return null;
    const token = await currentShopifyToken();
    if (token && node.buyerIdentity?.customer?.id == null) {
      const linked = await ensureLinkedToCustomer(cartId, token);
      if (linked) return linked;
    }
    return mapCart(node);
  } catch {
    return null;
  }
}

/**
 * Ce qu'une tentative d'ajout au panier renvoie : le panier à jour, ou un
 * message d'erreur — jamais les deux. Une Server Action qui *lève* une
 * exception en production voit son message effacé par Next.js (remplacé par
 * « An error occurred in the Server Components render… », sans lien avec la
 * cause réelle) : c'est un filet de sécurité générique contre la fuite de
 * détails internes, qui ne sait pas distinguer un message Shopify parfaitement
 * présentable (« Rupture de stock », un userError de mutation…) d'une vraie
 * fuite. Renvoyer l'erreur comme donnée plutôt que la lever la fait passer la
 * frontière serveur → client intacte ; c'est alors au code client de la
 * relever, ce qui, lui, n'est jamais assaini.
 */
export interface AddToCartResult {
  cart: Cart | null;
  error: string | null;
}

/**
 * Ajoute plusieurs lignes d'un coup.
 *
 * Un appel par pièce ne marche pas pour un look complet : le tout premier
 * crée le panier *et* pose le cookie, et les appels suivants sont émis avant
 * que le navigateur ait forcément appliqué ce Set-Cookie, ils repartent donc
 * sans identifiant et recréent chacun leur panier. Une seule mutation Shopify
 * pour tout le look supprime la course.
 */
export async function addLinesToCartAction(rawLines: CartLineInput[]): Promise<AddToCartResult> {
  if (!Array.isArray(rawLines) || rawLines.length === 0) {
    return { cart: null, error: "Aucune ligne à ajouter au panier." };
  }
  const lines = sanitizeLines(rawLines).filter((l) => l.variantId !== "");
  if (lines.length === 0) return { cart: null, error: "Aucune ligne à ajouter au panier." };

  const jar = await cookies();
  const cartId = jar.get(CART_COOKIE)?.value;
  const token = await currentShopifyToken();

  const createFresh = async () => {
    const cart = await createCartWithLines(lines, token);
    /* httpOnly : ce cookie n'est lu que côté serveur (seul `cookies()` y
       touche, dans ce fichier). Un identifiant de panier donne accès au
       contenu du panier et à sa checkoutUrl — il n'a rien à faire à portée
       du JavaScript de la page. */
    jar.set(CART_COOKIE, cart.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return cart;
  };

  try {
    if (!cartId) return { cart: await createFresh(), error: null };

    try {
      const cart = await addCartLines(cartId, lines);
      return { cart: (await ensureLinkedToCustomer(cartId, token)) ?? cart, error: null };
    } catch (err) {
      // Only recreate the cart when the cart itself is invalid/expired.
      // Other errors (invalid variant, sold out, etc.) should propagate.
      //
      // Shopify localise le message de userError selon la langue de la
      // requête Storefront (la boutique est en français) : ne reconnaître
      // que les tournures anglaises laissait passer tout droit le vrai motif
      // ("Le panier spécifié n'existe pas."), qui remontait alors comme une
      // erreur générique au lieu de déclencher la recréation automatique.
      const msg = err instanceof Error ? err.message.toLowerCase() : "";
      const isStaleCart =
        msg.includes("cart not found") ||
        msg.includes("cart does not exist") ||
        msg.includes("invalid cart") ||
        msg.includes("provided invalid value") ||
        msg.includes("n'existe pas") ||
        msg.includes("introuvable");
      if (!isStaleCart) throw err;
      return { cart: await createFresh(), error: null };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Échec de l'ajout au panier.";
    console.error("[cart] échec de l'ajout au panier:", message);
    return { cart: null, error: message };
  }
}

export async function addToCartAction(variantId: string, quantity = 1): Promise<AddToCartResult> {
  return addLinesToCartAction([{ variantId, quantity }]);
}

export async function updateCartLineAction(lineId: string, quantity: number): Promise<Cart | null> {
  const cartId = (await cookies()).get(CART_COOKIE)?.value;
  if (!cartId) return null;
  // Même endpoint public que l'ajout : la quantité se borne ici aussi.
  const qty = Math.min(Math.max(Math.trunc(Number(quantity) || 0), 0), MAX_QUANTITY);
  return updateCartLine(cartId, lineId, qty);
}

export async function removeCartLineAction(lineId: string): Promise<Cart | null> {
  const cartId = (await cookies()).get(CART_COOKIE)?.value;
  if (!cartId) return null;
  return removeCartLine(cartId, lineId);
}
