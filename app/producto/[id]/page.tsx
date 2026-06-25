import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "../../components/product-detail";
import {
  formatCOP,
  getProductById,
  getProductImageUrl,
  products,
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

  return <ProductDetail product={product} />;
}
