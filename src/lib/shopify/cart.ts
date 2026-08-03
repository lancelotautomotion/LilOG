import { shopifyFetch } from "./client";
import { extractSizeValue } from "./products";
import {
  CART_BUYER_IDENTITY_UPDATE_MUTATION,
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  GET_CART_QUERY,
} from "./queries";
import type {
  Cart,
  CartBuyerIdentityUpdateResponse,
  CartCreateResponse,
  CartLinesAddResponse,
  CartLinesRemoveResponse,
  CartLinesUpdateResponse,
  CartResponse,
  ShopifyCartNode,
} from "./types";

export function mapCart(node: ShopifyCartNode): Cart {
  return {
    id: node.id,
    checkoutUrl: node.checkoutUrl,
    totalQuantity: node.totalQuantity,
    subtotal: Number(node.cost.subtotalAmount.amount),
    currency: node.cost.subtotalAmount.currencyCode,
    lines: node.lines.edges.map((e) => ({
      id: e.node.id,
      variantId: e.node.merchandise.id,
      quantity: e.node.quantity,
      title: e.node.merchandise.product.title,
      variantTitle: e.node.merchandise.title !== "Default Title" ? e.node.merchandise.title : "",
      handle: e.node.merchandise.product.handle,
      price: Number(e.node.merchandise.price.amount),
      image: e.node.merchandise.image?.url ?? "",
      available: e.node.merchandise.availableForSale,
      vendor: e.node.merchandise.product.vendor ?? "",
      etat: e.node.merchandise.product.etat?.value ?? null,
      size: extractSizeValue(e.node.merchandise.product.options),
    })),
  };
}

export async function getCartNode(cartId: string): Promise<ShopifyCartNode | null> {
  const data = await shopifyFetch<CartResponse>(GET_CART_QUERY, { cartId }, 0);
  return data.cart;
}

export async function getCart(cartId: string): Promise<Cart | null> {
  const node = await getCartNode(cartId);
  return node ? mapCart(node) : null;
}

export async function createCart(
  variantId: string,
  quantity = 1,
  customerAccessToken?: string | null,
): Promise<Cart> {
  const data = await shopifyFetch<CartCreateResponse>(
    CART_CREATE_MUTATION,
    {
      lines: [{ merchandiseId: variantId, quantity }],
      ...(customerAccessToken && { buyerIdentity: { customerAccessToken } }),
    },
    0,
  );
  const { cart, userErrors } = data.cartCreate;
  if (!cart || userErrors.length > 0) throw new Error(userErrors[0]?.message ?? "Failed to create cart");
  return mapCart(cart);
}

/* Associe le panier au client Shopify connecté — condition pour que la
   commande finale apparaisse dans son historique de commandes. */
export async function cartBuyerIdentityUpdate(cartId: string, customerAccessToken: string): Promise<Cart> {
  const data = await shopifyFetch<CartBuyerIdentityUpdateResponse>(
    CART_BUYER_IDENTITY_UPDATE_MUTATION,
    { cartId, buyerIdentity: { customerAccessToken } },
    0,
  );
  const { cart, userErrors } = data.cartBuyerIdentityUpdate;
  if (!cart) throw new Error(userErrors[0]?.message ?? "Failed to link cart to customer");
  return mapCart(cart);
}

export async function addCartLine(cartId: string, variantId: string, quantity = 1): Promise<Cart> {
  const data = await shopifyFetch<CartLinesAddResponse>(
    CART_LINES_ADD_MUTATION,
    { cartId, lines: [{ merchandiseId: variantId, quantity }] },
    0,
  );
  const { cart, userErrors } = data.cartLinesAdd;
  if (!cart || userErrors.length > 0) throw new Error(userErrors[0]?.message ?? "Failed to add to cart");
  return mapCart(cart);
}

export async function updateCartLine(cartId: string, lineId: string, quantity: number): Promise<Cart> {
  const data = await shopifyFetch<CartLinesUpdateResponse>(
    CART_LINES_UPDATE_MUTATION,
    { cartId, lines: [{ id: lineId, quantity }] },
    0,
  );
  const { cart, userErrors } = data.cartLinesUpdate;
  if (!cart) throw new Error(userErrors[0]?.message ?? "Failed to update cart");
  return mapCart(cart);
}

export async function removeCartLine(cartId: string, lineId: string): Promise<Cart> {
  const data = await shopifyFetch<CartLinesRemoveResponse>(
    CART_LINES_REMOVE_MUTATION,
    { cartId, lineIds: [lineId] },
    0,
  );
  const { cart, userErrors } = data.cartLinesRemove;
  if (!cart) throw new Error(userErrors[0]?.message ?? "Failed to remove cart line");
  return mapCart(cart);
}
