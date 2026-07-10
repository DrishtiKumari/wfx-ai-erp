"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  MessageSquare,
  Search,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/products",
    icon: Package,
  },
  {
    title: "AI Query",
    href: "/ai-query",
    icon: MessageSquare,
  },
  {
    title: "Search",
    href: "/search",
    icon: Search,
  },
  {
    title: "Docs",
    href: "/docs",
    icon: FileText,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white flex flex-col">
      {/* Logo & Brand */}
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-gray-900 to-gray-700 text-white text-sm font-bold shadow-sm">
            W
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900 tracking-tight">WFX AI ERP</span>
            <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">Fashion Analytics</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 p-4 pt-6">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
          Main Menu
        </p>
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-gray-900 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon className={cn("h-[18px] w-[18px]", isActive ? "text-white" : "text-gray-400")} />
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-xs font-semibold text-gray-700">WFX AI Intern</p>
          <p className="text-[11px] text-gray-500 mt-0.5">Skill Assessment Project</p>
        </div>
      </div>
    </aside>
  );
}
