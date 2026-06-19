/* eslint-disable @next/next/no-img-element */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FloatingContact } from "../../components/floating-contact";
import { ProductActions } from "../../components/product-actions";
import { SiteFooter } from "../../components/site-footer";
import {
  buildWhatsAppHref,
  CONTACT_PHONE_DISPLAY,
  formatCOP,
  getProductById,
  getProductImageUrl,
  products,
  VETERINARIAN_PHONE_DISPLAY,
} from "../../data/products";

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    return {
      title: "Producto no encontrado | De Pelos",
    };
  }

  const productName = `${product.nombre} ${product.presentacion}`;

  return {
    title: `${productName} | De Pelos`,
    description: `${productName} en De Pelos. Precio: ${formatCOP(
      product.precioCOP,
    )}. Consulta disponibilidad por WhatsApp.`,
    openGraph: {
      title: `${productName} | De Pelos`,
      description: `Producto de categoría ${product.categoria}, disponible para consultar por WhatsApp.`,
      images: [getProductImageUrl(product.imagen)],
      locale: "es_CO",
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  const productName = `${product.nombre} ${product.presentacion}`;

  return (
    <>
      <main className="min-h-screen bg-[#fffaf2] text-[#2d2a28]">
        <header className="border-b border-[#eadfcd] bg-[#fffaf2] px-5 py-4">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3">
            <Link className="flex items-center gap-3" href="/">
              <img
                className="h-12 w-12 rounded-lg object-cover"
                src="/assets/brand/de-pelos-logo.png"
                alt="Logo de De Pelos"
              />
              <span>
                <span className="block text-lg font-black">De Pelos</span>
                <span className="block text-xs font-semibold text-[#7c6c5d]">
                  Tienda veterinaria
                </span>
              </span>
            </Link>
            <nav
              className="ml-auto flex gap-1 overflow-x-auto text-sm font-bold"
              aria-label="Menu principal"
            >
              <Link className="nav-link" href="/#inicio">
                Inicio
              </Link>
              <Link className="nav-link" href="/#tienda">
                Tienda
              </Link>
              <Link className="nav-link" href="/?categoria=Gatos#tienda">
                Gatos
              </Link>
              <Link className="nav-link" href="/?categoria=Perros#tienda">
                Perros
              </Link>
              <Link className="nav-link" href="/?categoria=Snacks%20y%20Premios#tienda">
                Snacks y Premios
              </Link>
              <Link className="nav-link" href="/?categoria=Higiene%20y%20cuidado#tienda">
                Higiene y cuidado
              </Link>
              <Link className="nav-link" href="/#contacto">
                Contacto
              </Link>
            </nav>
          </div>
        </header>

        <section className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="rounded-lg border border-[#eadfcd] bg-white p-5 shadow-sm">
            <div className="aspect-square rounded-lg bg-[#fffaf2] p-5">
              <img
                className="h-full w-full object-contain"
                src={getProductImageUrl(product.imagen)}
                alt={productName}
              />
            </div>
          </div>

          <div>
            <Link
              className="inline-flex rounded-lg border border-[#d8ccb8] bg-white px-4 py-2 text-sm font-bold text-[#63594c] transition hover:bg-[#fffaf2]"
              href="/#tienda"
            >
              Volver a la tienda
            </Link>
            <p className="mt-7 text-sm font-black uppercase tracking-wide text-[#167242]">
              {product.categoria} · {product.subcategoria}
            </p>
            <h1 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">
              {productName}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#63594c]">
              Producto disponible para compra o consulta directa con De Pelos.
              Confirma disponibilidad y entrega con atención veterinaria.
            </p>

            <div className="mt-6 grid gap-3 rounded-lg border border-[#eadfcd] bg-white p-5 sm:grid-cols-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-[#7c6c5d]">
                  Precio
                </p>
                <p className="mt-1 text-xl font-black">
                  {formatCOP(product.precioCOP)}
                </p>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-[#7c6c5d]">
                  Presentación
                </p>
                <p className="mt-1 text-xl font-black">{product.presentacion}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-[#7c6c5d]">
                  Disponibilidad
                </p>
                <p className="mt-1 text-xl font-black">
                  {product.disponible ? "Disponible" : "Consultar"}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <ProductActions product={product} />
            </div>

            <div className="mt-7 rounded-lg border border-[#eadfcd] bg-[#e7f8f2] p-5">
              <p className="text-sm font-black text-[#167242]">
                Pedidos y WhatsApp: {CONTACT_PHONE_DISPLAY}
              </p>
              <p className="mt-1 text-sm font-black text-[#167242]">
                Contacto zootecnista: {VETERINARIAN_PHONE_DISPLAY}
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <a
                  className="inline-flex rounded-lg bg-[#1f9d55] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#178348]"
                  href={buildWhatsAppHref()}
                  rel="noreferrer"
                  target="_blank"
                >
                  WhatsApp de la tienda
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <FloatingContact />
      <SiteFooter />
    </>
  );
}
