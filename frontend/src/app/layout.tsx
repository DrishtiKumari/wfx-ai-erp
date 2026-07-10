import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppLayout } from "@/components/layout/app-layout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "WFX AI ERP — Fashion Industry Analytics",
  description:
    "AI-native ERP exploration platform for the apparel and fashion industry. Natural language queries, real-time dashboards, and safe NL2SQL engine.",
  keywords: ["ERP", "AI", "Fashion", "NL2SQL", "Analytics", "Apparel"],
  authors: [{ name: "WFX AI Intern" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-gray-50`}>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
