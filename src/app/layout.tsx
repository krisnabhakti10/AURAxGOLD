import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "AURAxGOLD — MT5 EA Licensing Portal",
  description:
    "Portal lisensi resmi AURAxGOLD EA untuk MetaTrader 5. Buat akun Exness, ajukan aktivasi, dan nikmati performa trading premium.",
  keywords: ["AURAxGOLD", "MT5 EA", "Expert Advisor", "Lisensi", "Trading"],
  openGraph: {
    title: "AURAxGOLD — MT5 EA Licensing Portal",
    description: "Portal lisensi resmi AURAxGOLD EA untuk MetaTrader 5.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-dark-900 text-gray-100 antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
