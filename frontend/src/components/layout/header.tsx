"use client";

import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";

const pageConfig: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Dashboard", subtitle: "Business overview & analytics" },
  "/products": { title: "Product Explorer", subtitle: "Browse & manage finished goods" },
  "/ai-query": { title: "AI Query", subtitle: "Ask questions in plain English" },
  "/search": { title: "Product Search", subtitle: "Advanced search & filtering" },
  "/docs": { title: "Documentation", subtitle: "Architecture & technical details" },
};

export function Header() {
  const pathname = usePathname();
  const config = pageConfig[pathname] || { title: "WFX AI ERP", subtitle: "" };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/95 backdrop-blur-sm px-8">
      <div>
        <h1 className="text-lg font-bold text-gray-900 tracking-tight">{config.title}</h1>
        {config.subtitle && (
          <p className="text-xs text-gray-500 -mt-0.5">{config.subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="bg-green-50 text-green-700 border border-green-200 font-medium text-[11px]">
          Live
        </Badge>
      </div>
    </header>
  );
}
