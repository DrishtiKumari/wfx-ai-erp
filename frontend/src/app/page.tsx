"use client";

import { useEffect, useState } from "react";
import {
  Package,
  Users,
  Truck,
  ShoppingCart,
  DollarSign,
  AlertCircle,
  FileText,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { RevenueTrendChart } from "@/components/dashboard/revenue-trend-chart";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { InsightsPanel } from "@/components/dashboard/insights-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboardData } from "@/lib/api";
import type { DashboardResponse } from "@/lib/types";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const response = await getDashboardData();
        setData(response);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          Unable to Load Dashboard
        </h3>
        <p className="mt-2 text-sm text-gray-500 text-center max-w-md">
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page intro */}
      <div>
        <p className="text-sm text-gray-600">
          Real-time analytics across your apparel ERP operations.
        </p>
        {loading && (
          <p className="mt-1 text-xs text-gray-400">
            Loading data from server (may take a few seconds on first visit)...
          </p>
        )}
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Products"
            value={data.total_products.toLocaleString()}
            icon={Package}
          />
          <StatCard
            title="Total Buyers"
            value={data.total_buyers}
            icon={Users}
          />
          <StatCard
            title="Total Suppliers"
            value={data.total_suppliers}
            icon={Truck}
          />
          <StatCard
            title="Total Orders"
            value={data.total_orders.toLocaleString()}
            icon={ShoppingCart}
          />
          <StatCard
            title="Total Revenue"
            value={`$${(data.total_revenue / 1000000).toFixed(1)}M`}
            icon={DollarSign}
          />
          <StatCard
            title="Total Invoices"
            value={data.total_invoices.toLocaleString()}
            icon={FileText}
          />
        </div>
      ) : null}

      {/* Charts */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-96 rounded-xl" />
          ))}
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueTrendChart data={data.revenue_chart} />
          <RevenueChart data={data.buyer_mix} />
          <RecentOrders data={data.recent_orders} />
          <InsightsPanel data={data.insights} />
        </div>
      ) : null}
    </div>
  );
}
