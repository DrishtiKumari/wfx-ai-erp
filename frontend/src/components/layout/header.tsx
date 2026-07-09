"use client";

import { usePathname } from "next/navigation";

const pageNames: Record<string, string> = {
  "/": "Dashboard",
  "/products": "Product Explorer",
  "/ai-query": "AI Query",
  "/search": "Product Search",
  "/docs": "Documentation",
};

export function Header() {
  const pathname = usePathname();

  // Get the page name from the mapping, or derive from path
  const pageName =
    pageNames[pathname] ||
    pathname
      .split("/")
      .pop()
      ?.replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()) ||
    "Dashboard";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b border-gray-200 bg-white/95 backdrop-blur px-8">
      <h1 className="text-xl font-bold text-gray-900">{pageName}</h1>
    </header>
  );
}
