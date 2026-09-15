import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "deepchill — Discover tools built by indie makers",
    template: "%s | deepchill",
  },
  description:
    "A curated discovery platform for indie makers, SaaS founders, and tech launches. Find your next favorite tool.",
  keywords: ["indie makers", "SaaS", "product discovery", "developer tools", "startups"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Header />
        <main style={{ flex: 1 }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
