import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "De Pelos | Tienda online de mascotas en Colombia",
  description:
    "Compra alimentos, snacks, premios y productos para gatos y perros en De Pelos. Pedidos por WhatsApp y contacto de Yeison Valencia Bravo, Médico Veterinario Zootecnista.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "De Pelos | Tienda online de mascotas",
    description:
      "Catálogo de alimentos, snacks y premios para mascotas con carrito, checkout por WhatsApp y contacto zootecnista en Colombia.",
    images: ["/assets/brand/de-pelos-logo.png"],
    locale: "es_CO",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fffaf2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
