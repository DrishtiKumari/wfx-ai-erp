"use client";

import { Card, CardContent } from "@/components/ui/card";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
}

export function StatCard({ title, value, subtitle, icon: Icon }: StatCardProps) {
  return (
    <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
            <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}
          </div>
          <div className="rounded-lg bg-gray-900 p-2.5 shadow-sm">
            <Icon className="h-4 w-4 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
