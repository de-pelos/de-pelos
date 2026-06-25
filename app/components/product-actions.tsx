"use client";

import { useState } from "react";
import {
  buildProductWhatsAppMessage,
  buildWhatsAppHref,
  formatCOP,
  Product,
} from "../data/products";

const CART_STORAGE_KEY = "de-pelos-cart";

type CartLine = {
  productId: string;
  quantity: number;
};

export function ProductActions({
  product,
  onCartChange,
}: {
  product: Product;
  onCartChange?: (cart: CartLine[]) => void;
}) {
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  function addToCart() {
    if (product.precioCOP === null) return;

    const stored = window.localStorage.getItem(CART_STORAGE_KEY);
    let currentCart: CartLine[] = [];

    try {
      currentCart = stored ? JSON.parse(stored) : [];
    } catch {
      currentCart = [];
    }

    const existingLine = currentCart.find((line) => line.productId === product.id);
    const nextCart = existingLine
      ? currentCart.map((line) =>
          line.productId === product.id
            ? { ...line, quantity: line.quantity + quantity }
            : line,
        )
      : [...currentCart, { productId: product.id, quantity }];

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(nextCart));
    setAdded(true);
    onCartChange?.(nextCart);
  }

  const consultHref = buildWhatsAppHref(buildProductWhatsAppMessage(product));

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="flex items-center gap-3 sm:col-span-2">
        <span className="text-sm font-bold text-[#63594c]">Cantidad</span>
        <button
          className="quantity-button"
          type="button"
          onClick={() => setQuantity((currentQuantity) => Math.max(1, currentQuantity - 1))}
          disabled={quantity <= 1 || product.precioCOP === null}
          aria-label="Disminuir cantidad"
        >
          -
        </button>
        <span className="w-8 text-center text-sm font-black">{quantity}</span>
        <button
          className="quantity-button"
          type="button"
          onClick={() => setQuantity((currentQuantity) => currentQuantity + 1)}
          disabled={product.precioCOP === null}
          aria-label="Aumentar cantidad"
        >
          +
        </button>
      </div>
      <button
        className="h-12 rounded-lg bg-[#2d2a28] px-5 text-sm font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-[#b9aea0]"
        type="button"
        onClick={addToCart}
        disabled={product.precioCOP === null}
      >
        {product.precioCOP === null
          ? "Consultar precio"
          : added
            ? "Agregado al carrito"
            : "Agregar al carrito"}
      </button>
      <a
        className="flex h-12 items-center justify-center rounded-lg border border-[#1f9d55] bg-white px-5 text-center text-sm font-bold text-[#167242] transition hover:bg-[#eefaf2]"
        href={consultHref}
        rel="noreferrer"
        target="_blank"
      >
        Consultar por WhatsApp
      </a>
      <p className="text-sm font-semibold text-[#63594c] sm:col-span-2">
        Precio: {formatCOP(product.precioCOP)}
      </p>
    </div>
  );
}
