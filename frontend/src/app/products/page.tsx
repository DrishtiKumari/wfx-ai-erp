"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductTable } from "@/components/products/product-table";
import { ProductDetail } from "@/components/products/product-detail";
import { Pagination } from "@/components/products/pagination";
import { getProducts, getProductFilters } from "@/lib/api";
import type { ProductItem, ProductListResponse, ProductFilters } from "@/lib/types";

export default function ProductsPage() {
  const [data, setData] = useState<ProductListResponse | null>(null);
  const [filters, setFilters] = useState<ProductFilters | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Query state
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("style_number");
  const [sortOrder, setSortOrder] = useState("asc");
  const [category, setCategory] = useState("");
  const [supplier, setSupplier] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getProducts({
        page,
        limit: 15,
        sort_by: sortBy,
        sort_order: sortOrder,
        category: category || undefined,
        supplier: supplier || undefined,
      });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, sortOrder, category, supplier]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    getProductFilters()
      .then(setFilters)
      .catch(() => {});
  }, []);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const handleSelectProduct = (product: ProductItem) => {
    setSelectedProduct(product);
    setDetailOpen(true);
  };

  const handleFilterChange = (type: string, value: string) => {
    if (type === "category") setCategory(value);
    if (type === "supplier") setSupplier(value);
    setPage(1);
  };

  // Filter products by search term locally (description/style_number)
  const displayProducts = data?.products.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.style_number?.toLowerCase().includes(term) ||
      p.description?.toLowerCase().includes(term) ||
      p.fabric?.toLowerCase().includes(term) ||
      p.color?.toLowerCase().includes(term)
    );
  }) || [];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          Unable to Load Products
        </h3>
        <p className="mt-2 text-sm text-gray-500">{error}</p>
        <button
          onClick={fetchProducts}
          className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Product Explorer</h2>
        <p className="mt-1 text-gray-600">
          Browse, filter, and sort your finished goods catalog.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category filter */}
        <select
          value={category}
          onChange={(e) => handleFilterChange("category", e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          <option value="">All Categories</option>
          {filters?.categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Supplier filter */}
        <select
          value={supplier}
          onChange={(e) => handleFilterChange("supplier", e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          <option value="">All Suppliers</option>
          {filters?.suppliers.map((sup) => (
            <option key={sup} value={sup}>
              {sup}
            </option>
          ))}
        </select>

        {/* Results count */}
        {data && (
          <span className="ml-auto text-sm text-gray-500">
            {data.total} products total
          </span>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 rounded-lg" />
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : (
        <ProductTable
          products={displayProducts}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onSelect={handleSelectProduct}
        />
      )}

      {/* Pagination */}
      {data && (
        <Pagination
          page={data.page}
          totalPages={data.total_pages}
          onPageChange={setPage}
        />
      )}

      {/* Product Detail Drawer */}
      <ProductDetail
        product={selectedProduct}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
}
