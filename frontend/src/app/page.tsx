"use client";

import { useEffect, useState } from "react";
import {
  Package,
  Users,
  Truck,
  ShoppingCart,
  DollarSign,
  AlertCircle,
  Crown,
  Star,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { OrdersStatusChart } from "@/components/dashboard/orders-status-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { SuppliersChart } from "@/components/dashboard/suppliers-chart";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getDashboardStats,
  getRevenueByBuyer,
  getOrdersByStatus,
  getProductsByCategory,
  getTopSuppliers,
} from "@/lib/api";
import type {
  DashboardStats,
  RevenueBuyerItem,
  OrderStatusItem,
  ProductCategoryItem,
  TopSupplierItem,
} from "@/lib/types";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueBuyerItem[]>([]);
  const [ordersData, setOrdersData] = useState<OrderStatusItem[]>([]);
  const [categoryData, setCategoryData] = useState<ProductCategoryItem[]>([]);
  const [suppliersData, setSuppliersData] = useState<TopSupplierItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch sequentially to avoid pgbouncer prepared statement conflicts
        const statsRes = await getDashboardStats();
        setStats(statsRes);

        const revenueRes = await getRevenueByBuyer();
        setRevenueData(revenueRes);

        const ordersRes = await getOrdersByStatus();
        setOrdersData(ordersRes);

        const categoryRes = await getProductsByCategory();
        setCategoryData(categoryRes);

        const suppliersRes = await getTopSuppliers();
        setSuppliersData(suppliersRes);
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
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Products"
            value={stats.total_products}
            icon={Package}
          />
          <StatCard
            title="Total Buyers"
            value={stats.total_buyers}
            icon={Users}
          />
          <StatCard
            title="Total Suppliers"
            value={stats.total_suppliers}
            icon={Truck}
          />
          <StatCard
            title="Total Orders"
            value={stats.total_orders}
            icon={ShoppingCart}
          />
          <StatCard
            title="Total Revenue"
            value={`$${stats.total_revenue.toLocaleString()}`}
            icon={DollarSign}
          />
          <StatCard
            title="Pending Invoices"
            value={stats.pending_invoices}
            icon={AlertCircle}
          />
          <StatCard
            title="Top Buyer"
            value={stats.top_buyer || "—"}
            icon={Crown}
          />
          <StatCard
            title="Top Supplier"
            value={stats.top_supplier || "—"}
            icon={Star}
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
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart data={revenueData} />
          <OrdersStatusChart data={ordersData} />
          <CategoryChart data={categoryData} />
          <SuppliersChart data={suppliersData} />
        </div>
      )}
    </div>
  );
}
