import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { Analytics } from "@vercel/analytics/next";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Confeitaria Nedel — Faça seu Pedido",
  description: "Salgados, doces e tortas sob encomenda. Porto Alegre - RS.",
  openGraph: {
    title: "Confeitaria Nedel — Faça seu Pedido",
    description: "Salgados, doces e tortas sob encomenda. Porto Alegre - RS.",
    images: [{ url: "/logo.png" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={geist.className}>
      <body className="min-h-screen antialiased">
        <CartProvider>{children}</CartProvider>
        <Analytics />
      </body>
    </html>
  );
}
