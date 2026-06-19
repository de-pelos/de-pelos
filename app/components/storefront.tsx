"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FloatingContact } from "./floating-contact";
import { SiteFooter } from "./site-footer";
import {
  buildProductWhatsAppMessage,
  buildWhatsAppHref,
  CONTACT_PHONE_DISPLAY,
  formatCOP,
  getProductImageUrl,
  placeholderProductImage,
  Product,
  ProductCategory,
  VETERINARIAN_PHONE_DISPLAY,
} from "../data/products";

const CART_STORAGE_KEY = "de-pelos-cart";
const categories: Array<"Todos" | ProductCategory> = [
  "Todos",
  "Gatos",
  "Perros",
  "Snacks y Premios",
  "Higiene y cuidado",
];
const quickSearches = [
  "Agility gatos 3kg",
  "BR For Cat salmón",
  "Churu salmón",
  "Calabaza Pets",
  "Tribu Natural",
  "Ringo 20kg",
  "Chunky cachorro",
  "Max Cat",
];

type CartLine = {
  productId: string;
  quantity: number;
};

type CartItem = {
  product: Product;
  quantity: number;
};

function normalizeText(value: string) {
  return value
    .toLocaleLowerCase("es-CO")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function compactText(value: string) {
  return normalizeText(value).replace(/\s+/g, "");
}

function getSearchableProductText(product: Product) {
  return normalizeText(
    `${product.id.replaceAll("-", " ")} ${product.nombre} ${product.categoria} ${
      product.subcategoria
    } ${product.presentacion} ${product.precioCOP ?? "consultar precio"}`,
  );
}

function productMatchesQuery(product: Product, rawQuery: string) {
  const normalizedQuery = normalizeText(rawQuery);
  if (!normalizedQuery) return true;

  const searchable = getSearchableProductText(product);
  const compactSearchable = compactText(searchable);
  const compactQuery = compactText(normalizedQuery);
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);

  return (
    compactSearchable.includes(compactQuery) ||
    tokens.every((token) => {
      const compactToken = compactText(token);
      return searchable.includes(token) || compactSearchable.includes(compactToken);
    })
  );
}

function getProductSearchScore(product: Product, rawQuery: string) {
  const normalizedQuery = normalizeText(rawQuery);
  if (!normalizedQuery) return 0;

  const normalizedName = normalizeText(product.nombre);
  const searchable = getSearchableProductText(product);
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  let score = 0;

  if (normalizedName === normalizedQuery) score += 120;
  if (normalizedName.startsWith(normalizedQuery)) score += 80;
  if (normalizedName.includes(normalizedQuery)) score += 60;
  if (compactText(product.presentacion).includes(compactText(normalizedQuery))) {
    score += 30;
  }

  for (const token of tokens) {
    if (normalizedName.includes(token)) score += 18;
    if (normalizeText(product.subcategoria).includes(token)) score += 12;
    if (normalizeText(product.categoria).includes(token)) score += 8;
    if (searchable.includes(token)) score += 4;
  }

  return score;
}

function readStoredCart(): CartLine[] {
  try {
    const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);
    return storedCart ? JSON.parse(storedCart) : [];
  } catch {
    return [];
  }
}

export function Storefront({ catalog }: { catalog: Product[] }) {
  const [activeCategory, setActiveCategory] =
    useState<(typeof categories)[number]>("Todos");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartReady, setCartReady] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setCart(readStoredCart());
      setCartReady(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (cartReady) {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart, cartReady]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const category = params.get("categoria");

      if (
        category === "Gatos" ||
        category === "Perros" ||
        category === "Snacks y Premios" ||
        category === "Higiene y cuidado"
      ) {
        setActiveCategory(category);
        scrollToSection("tienda");
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const filteredProducts = useMemo(() => {
    return catalog
      .filter((product) => {
        const matchesCategory =
          activeCategory === "Todos" || product.categoria === activeCategory;

        return matchesCategory && productMatchesQuery(product, query);
      })
      .sort((firstProduct, secondProduct) => {
        const scoreDifference =
          getProductSearchScore(secondProduct, query) -
          getProductSearchScore(firstProduct, query);

        return (
          scoreDifference ||
          firstProduct.nombre.localeCompare(secondProduct.nombre, "es-CO") ||
          firstProduct.presentacion.localeCompare(
            secondProduct.presentacion,
            "es-CO",
          )
        );
      });
  }, [activeCategory, catalog, query]);

  const cartItems = useMemo<CartItem[]>(() => {
    return cart
      .map((line) => {
        const product = catalog.find((item) => item.id === line.productId);
        return product ? { product, quantity: line.quantity } : null;
      })
      .filter((item): item is CartItem => item !== null);
  }, [cart, catalog]);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (total, item) => total + (item.product.precioCOP ?? 0) * item.quantity,
    0,
  );
  const checkoutHref = buildCheckoutHref(cartItems, cartTotal);

  function scrollToSection(sectionId: string) {
    requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    });
  }

  function selectCategory(category: (typeof categories)[number]) {
    setActiveCategory(category);
    setQuery("");
    scrollToSection("tienda");
  }

  function addToCart(product: Product) {
    if (product.precioCOP === null) {
      window.open(
        buildWhatsAppHref(buildProductWhatsAppMessage(product)),
        "_blank",
        "noreferrer",
      );
      return;
    }

    setCart((currentCart) => {
      const existingLine = currentCart.find(
        (line) => line.productId === product.id,
      );

      if (existingLine) {
        return currentCart.map((line) =>
          line.productId === product.id
            ? { ...line, quantity: line.quantity + 1 }
            : line,
        );
      }

      return [...currentCart, { productId: product.id, quantity: 1 }];
    });
    setCartOpen(true);
  }

  function setQuantity(productId: string, quantity: number) {
    setCart((currentCart) =>
      currentCart
        .map((line) =>
          line.productId === productId
            ? { ...line, quantity: Math.max(1, quantity) }
            : line,
        )
        .filter((line) => line.quantity > 0),
    );
  }

  function removeFromCart(productId: string) {
    setCart((currentCart) =>
      currentCart.filter((line) => line.productId !== productId),
    );
  }

  return (
    <>
      <main className="min-h-screen bg-[#fffaf2] text-[#2d2a28]">
        <header className="sticky top-0 z-40 border-b border-[#eadfcd] bg-[#fffaf2]/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 sm:gap-5">
            <button
              className="flex items-center gap-3 text-left"
              type="button"
              onClick={() => scrollToSection("inicio")}
            >
              <img
                className="h-12 w-12 rounded-lg object-cover"
                src="/assets/brand/de-pelos-logo.png"
                alt="Logo de De Pelos"
              />
              <span className="leading-tight">
                <span className="block text-lg font-black">De Pelos</span>
                <span className="block text-xs font-semibold text-[#7c6c5d]">
                  Tienda veterinaria
                </span>
              </span>
            </button>

            <nav
              className="order-3 flex w-full gap-1 overflow-x-auto text-sm font-bold sm:order-none sm:w-auto sm:flex-1 sm:justify-center"
              aria-label="Menu principal"
            >
              <button className="nav-link" type="button" onClick={() => scrollToSection("inicio")}>
                Inicio
              </button>
              <button className="nav-link" type="button" onClick={() => selectCategory("Todos")}>
                Tienda
              </button>
              <button className="nav-link" type="button" onClick={() => selectCategory("Gatos")}>
                Gatos
              </button>
              <button className="nav-link" type="button" onClick={() => selectCategory("Perros")}>
                Perros
              </button>
              <button
                className="nav-link"
                type="button"
                onClick={() => selectCategory("Snacks y Premios")}
              >
                Snacks y Premios
              </button>
              <button
                className="nav-link"
                type="button"
                onClick={() => selectCategory("Higiene y cuidado")}
              >
                Higiene y cuidado
              </button>
              <button className="nav-link" type="button" onClick={() => scrollToSection("contacto")}>
                Contacto
              </button>
            </nav>

            <button
              className="ml-auto flex h-11 items-center gap-2 rounded-lg bg-[#ffe36e] px-4 text-sm font-black text-[#2d2a28] shadow-sm transition hover:bg-[#ffd642]"
              type="button"
              onClick={() => setCartOpen(true)}
            >
              Carrito
              <span className="rounded-full bg-[#2d2a28] px-2 py-0.5 text-xs text-white">
                {cartCount}
              </span>
            </button>
          </div>
        </header>

        <section
          id="inicio"
          className="mx-auto max-w-7xl px-5 py-10 sm:py-14"
        >
          <div className="max-w-4xl">
            <p className="text-sm font-black uppercase tracking-wide text-[#167242]">
              Tienda física de mascotas en Colombia
            </p>
            <h1 className="mt-4 text-5xl font-black leading-[0.98] text-[#2d2a28] sm:text-6xl lg:text-7xl">
              De Pelos
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#63594c]">
              Compra alimento para gatos y perros, recibe asesoría veterinaria y
              finaliza tu pedido por WhatsApp con atención directa.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                className="rounded-lg bg-[#2d2a28] px-5 py-3 text-sm font-bold text-white transition hover:bg-black"
                type="button"
                onClick={() => selectCategory("Todos")}
              >
                Ver tienda
              </button>
              <a
                className="rounded-lg border border-[#1f9d55] bg-white px-5 py-3 text-sm font-bold text-[#167242] transition hover:bg-[#eefaf2]"
                href={buildWhatsAppHref()}
                rel="noreferrer"
                target="_blank"
              >
                Escríbenos por WhatsApp
              </a>
            </div>
          </div>
        </section>

        <section id="tienda" className="border-y border-[#eadfcd] bg-white px-5 py-10">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-[#167242]">
                  Catálogo
                </p>
                <h2 className="mt-2 text-3xl font-black sm:text-4xl">
                  Productos para mascotas
                </h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                <label className="sr-only" htmlFor="product-search">
                  Buscar productos
                </label>
                <input
                  id="product-search"
                  className="h-12 rounded-lg border border-[#d8ccb8] bg-[#fffaf2] px-4 text-sm font-semibold outline-none transition placeholder:text-[#9b8b77] focus:border-[#8fd4c2] focus:ring-4 focus:ring-[#8fd4c2]/25"
                  placeholder="Buscar marca, sabor, peso o precio"
                  type="search"
                  value={query}
                  onChange={(event) => {
                    setActiveCategory("Todos");
                    setQuery(event.target.value);
                  }}
                />
                <button
                  className="h-12 rounded-lg border border-[#d8ccb8] px-4 text-sm font-bold text-[#63594c] transition hover:bg-[#fffaf2]"
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setActiveCategory("Todos");
                  }}
                >
                  Limpiar
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="font-bold text-[#7c6c5d]">Búsquedas rápidas:</span>
              {quickSearches.map((suggestion) => (
                <button
                  key={suggestion}
                  className="rounded-lg border border-[#d8ccb8] bg-[#fffaf2] px-3 py-2 text-xs font-bold text-[#63594c] transition hover:bg-[#e7f8f2] hover:text-[#167242]"
                  type="button"
                  onClick={() => {
                    setActiveCategory("Todos");
                    setQuery(suggestion);
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
              {categories.map((category) => {
                const count =
                  category === "Todos"
                    ? catalog.length
                    : catalog.filter((product) => product.categoria === category)
                        .length;

                return (
                  <button
                    key={category}
                    className={`filter-chip ${
                      activeCategory === category ? "filter-chip-active" : ""
                    }`}
                    type="button"
                    onClick={() => selectCategory(category)}
                  >
                    {category}
                    <span>{count}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 text-sm font-semibold text-[#7c6c5d]">
              <p>
                {filteredProducts.length} producto
                {filteredProducts.length === 1 ? "" : "s"} disponible
                {activeCategory !== "Todos" ? ` en ${activeCategory}` : ""}
              </p>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <article key={product.id} className="product-card">
                    <Link
                      className="block"
                      href={`/producto/${product.id}`}
                      aria-label={`Ver producto ${product.nombre} ${product.presentacion}`}
                    >
                      <div className="product-image-wrap">
                        <img
                          className="h-full w-full object-contain"
                          src={getProductImageUrl(product.imagen)}
                          alt={`${product.nombre} ${product.presentacion}`}
                          onError={(event) => {
                            event.currentTarget.src =
                              getProductImageUrl(placeholderProductImage);
                          }}
                        />
                      </div>
                    </Link>
                    <div className="flex min-h-[216px] flex-col p-4">
                      <div className="flex items-start justify-between gap-3">
                        <span className="rounded-md bg-[#eefaf2] px-2.5 py-1 text-xs font-black text-[#167242]">
                          {product.categoria}
                        </span>
                        <span className="text-xs font-bold text-[#7c6c5d]">
                          {product.presentacion}
                        </span>
                      </div>
                      <h3 className="mt-3 line-clamp-2 text-base font-black leading-6">
                        {product.nombre}
                      </h3>
                      <p className="mt-1 text-sm font-semibold text-[#7c6c5d]">
                        {product.subcategoria}
                      </p>
                      <p className="mt-4 text-xl font-black text-[#2d2a28]">
                        {formatCOP(product.precioCOP)}
                      </p>
                      <div className="mt-auto grid gap-2 pt-4">
                        <button
                          className="h-11 rounded-lg bg-[#ffe36e] px-4 text-sm font-black text-[#2d2a28] transition hover:bg-[#ffd642]"
                          type="button"
                          onClick={() => addToCart(product)}
                        >
                          {product.precioCOP === null
                            ? "Consultar por WhatsApp"
                            : "Agregar al carrito"}
                        </button>
                        <Link
                          className="flex h-10 items-center justify-center rounded-lg border border-[#d8ccb8] text-sm font-bold text-[#63594c] transition hover:bg-[#fffaf2]"
                          href={`/producto/${product.id}`}
                        >
                          Ver producto
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-lg border border-dashed border-[#d8ccb8] bg-[#fffaf2] p-8 text-center">
                <h3 className="text-xl font-black">Sin productos en esta vista</h3>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#63594c]">
                  Prueba con marca, sabor, peso o categoria. Tambien puedes
                  escribirnos por WhatsApp para confirmar un producto puntual.
                </p>
                <a
                  className="mt-5 inline-flex rounded-lg bg-[#1f9d55] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#178348]"
                  href={buildWhatsAppHref(
                    `Hola, estoy buscando un producto en De Pelos y no lo encontré con esta búsqueda: "${query}". ¿Me puedes ayudar?`,
                  )}
                  rel="noreferrer"
                  target="_blank"
                >
                  Consultar por WhatsApp
                </a>
              </div>
            )}
          </div>
        </section>

        <section id="contacto" className="bg-[#fffaf2] px-5 py-12">
          <div className="mx-auto grid max-w-7xl gap-7 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-[#167242]">
                Contacto
              </p>
              <h2 className="mt-2 text-3xl font-black sm:text-4xl">
                Atención directa con De Pelos
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#63594c]">
                Yeison Valencia Bravo, Médico Veterinario Zootecnista. Escríbenos
                para confirmar disponibilidad, entregas y recomendaciones para tu
                mascota.
              </p>
            </div>
            <div className="contact-panel">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-bold text-[#7c6c5d]">
                    Pedidos y WhatsApp
                  </p>
                  <p className="mt-2 text-2xl font-black">
                    {CONTACT_PHONE_DISPLAY}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#7c6c5d]">
                    Contacto zootecnista
                  </p>
                  <p className="mt-2 text-2xl font-black">
                    {VETERINARIAN_PHONE_DISPLAY}
                  </p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  className="rounded-lg bg-[#1f9d55] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#178348]"
                  href={buildWhatsAppHref()}
                  rel="noreferrer"
                  target="_blank"
                >
                  Escríbenos por WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <CartDrawer
        cartItems={cartItems}
        cartOpen={cartOpen}
        checkoutHref={checkoutHref}
        total={cartTotal}
        onClose={() => setCartOpen(false)}
        onQuantityChange={setQuantity}
        onRemove={removeFromCart}
      />
      <FloatingContact />
      <SiteFooter />
    </>
  );
}

function buildCheckoutHref(cartItems: CartItem[], total: number) {
  const lines = cartItems.map(
    ({ product, quantity }) =>
      `- ${quantity} x ${product.nombre} ${product.presentacion} (${formatCOP(
        product.precioCOP,
      )} c/u)`,
  );
  const message = `Hola, quiero finalizar este pedido en De Pelos:\n\nProductos:\n${lines.join(
    "\n",
  )}\n\nTotal del pedido: ${formatCOP(
    total,
  )}\n\nDatos para coordinar entrega:\nNombre:\nBarrio o direccion:\nForma de pago:\n\nQuedo atento a disponibilidad y forma de entrega.`;

  return buildWhatsAppHref(message);
}

function CartDrawer({
  cartItems,
  cartOpen,
  checkoutHref,
  total,
  onClose,
  onQuantityChange,
  onRemove,
}: {
  cartItems: CartItem[];
  cartOpen: boolean;
  checkoutHref: string;
  total: number;
  onClose: () => void;
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}) {
  return (
    <div
      className={`fixed inset-0 z-50 transition ${
        cartOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!cartOpen}
    >
      <button
        className={`absolute inset-0 bg-black/35 transition-opacity ${
          cartOpen ? "opacity-100" : "opacity-0"
        }`}
        type="button"
        onClick={onClose}
        aria-label="Cerrar carrito"
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Carrito de compras"
      >
        <div className="flex items-center justify-between border-b border-[#eadfcd] px-5 py-4">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-[#167242]">
              Carrito
            </p>
            <h2 className="text-2xl font-black">Tu pedido</h2>
          </div>
          <button
            className="h-10 rounded-lg border border-[#d8ccb8] px-3 text-sm font-bold text-[#63594c] transition hover:bg-[#fffaf2]"
            type="button"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {cartItems.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#d8ccb8] bg-[#fffaf2] p-6 text-center">
              <p className="font-black">Tu carrito está vacío</p>
              <p className="mt-2 text-sm leading-6 text-[#63594c]">
                Agrega productos del catálogo para preparar el mensaje de WhatsApp.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {cartItems.map(({ product, quantity }) => (
                <article
                  className="grid grid-cols-[76px_1fr] gap-3 rounded-lg border border-[#eadfcd] p-3"
                  key={product.id}
                >
                  <img
                    className="h-[76px] w-[76px] rounded-lg bg-[#fffaf2] object-contain"
                    src={getProductImageUrl(product.imagen)}
                    alt={`${product.nombre} ${product.presentacion}`}
                    onError={(event) => {
                      event.currentTarget.src =
                        getProductImageUrl(placeholderProductImage);
                    }}
                  />
                  <div className="min-w-0">
                    <h3 className="line-clamp-2 text-sm font-black leading-5">
                      {product.nombre}
                    </h3>
                    <p className="text-xs font-semibold text-[#7c6c5d]">
                      {product.presentacion} · {formatCOP(product.precioCOP)}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        className="quantity-button"
                        type="button"
                        onClick={() => onQuantityChange(product.id, quantity - 1)}
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-black">
                        {quantity}
                      </span>
                      <button
                        className="quantity-button"
                        type="button"
                        onClick={() => onQuantityChange(product.id, quantity + 1)}
                      >
                        +
                      </button>
                      <button
                        className="ml-auto text-xs font-bold text-[#b84e44] hover:underline"
                        type="button"
                        onClick={() => onRemove(product.id)}
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-[#eadfcd] bg-[#fffaf2] p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[#7c6c5d]">Total</span>
            <strong className="text-2xl">{formatCOP(total)}</strong>
          </div>
          <a
            className={`mt-4 flex h-12 items-center justify-center rounded-lg text-sm font-black transition ${
              cartItems.length === 0
                ? "pointer-events-none bg-[#d8ccb8] text-[#7c6c5d]"
                : "bg-[#1f9d55] text-white hover:bg-[#178348]"
            }`}
            href={checkoutHref}
            rel="noreferrer"
            target="_blank"
            aria-disabled={cartItems.length === 0}
          >
            Finalizar pedido por WhatsApp
          </a>
        </div>
      </aside>
    </div>
  );
}
