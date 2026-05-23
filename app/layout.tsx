import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ComparisonBar } from "@/components/product/ComparisonBar";
import { ComparisonInitializer } from "@/components/product/ComparisonInitializer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'TechnoStore - Интернет-магазин электроники',
    template: '%s | TechnoStore',
  },
  description: 'Купить смартфоны, ноутбуки и аксессуары с доставкой по Приднестровью и оплатой при получении.',
  openGraph: {
    title: 'TechnoStore - Интернет-магазин электроники',
    description: 'Каталог электроники с доставкой по Приднестровью.',
    siteName: 'TechnoStore',
    locale: 'ru_RU',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${inter.variable} ${oswald.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col pb-28 lg:pb-24">
        <ComparisonInitializer />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <ComparisonBar />
      </body>
    </html>
  );
}
