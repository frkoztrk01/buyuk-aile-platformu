import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { GoogleTranslateProvider } from "@/components/GoogleTranslateProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Büyük Aile Platformu",
  description: "Büyük Aile Platformu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${inter.variable} ${montserrat.variable} antialiased`}
      >
        <GoogleTranslateProvider>
          {children}
        </GoogleTranslateProvider>
      </body>
    </html>
  );
}
