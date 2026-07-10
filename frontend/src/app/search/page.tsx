"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, X, AlertCircle, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/products/pagination";
import { searchProducts, getProductFilters } from "@/lib/api";
import type { ProductItem, ProductListResponse, ProductFilters } from "@/lib/types";

export default function SearchPage() {
  const [data, setData] = useState<ProductListResponse | null>(null);
  const [filters, setFilters] = useState<ProductFilters | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState<{
    category: string;
    fabric: string;
    supplier: string;
    color: string;
    season: string;
    min_price: string;
    max_price: string;
  }>({
    category: "",
    fabric: "",
    supplier: "",
    color: "",
    season: "",
    min_price: "",
    max_price: "",
  });

  const [showFilters, setShowFilters] = useState(true);

  // Load filter options on mount
  useEffect(() => {
    getProductFilters()
      .then(setFilters)
      .catch(() => {});
  }, []);

  const doSearch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await searchProducts({
        q: keyword || undefined,
        page,
        limit: 12,
        category: activeFilters.category || undefined,
        fabric: activeFilters.fabric || undefined,
        supplier: activeFilters.supplier || undefined,
        color: activeFilters.color || undefined,
        season: activeFilters.season || undefined,
        min_price: activeFilters.min_price
          ? Number(activeFilters.min_price)
          : undefined,
        max_price: activeFilters.max_price
          ? Number(activeFilters.max_price)
          : undefined,
      });

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }, [keyword, page, activeFilters]);

  useEffect(() => {
    void doSearch();
  }, [doSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    doSearch();
  };

  const handleFilterChange = (key: string, value: string) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setActiveFilters({
      category: "",
      fabric: "",
      supplier: "",
      color: "",
      season: "",
      min_price: "",
      max_price: "",
    });
    setKeyword("");
    setPage(1);
  };

  const activeFilterCount = Object.values(activeFilters).filter(
    (v) => v !== ""
  ).length + (keyword ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm text-gray-600">
          Search products with keyword and advanced filters.
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by keyword (e.g., silk, dress, cotton)..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="pl-9"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
            showFilters
              ? "border-gray-900 bg-gray-900 text-white"
              : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-gray-900">
              {activeFilterCount}
            </span>
          )}
        </button>
      </form>

      {/* Filter panel */}
      {showFilters && filters && (
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700">Filters</h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900"
                >
                  <X className="h-3 w-3" />
                  Clear all
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Category */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  Category
                </label>
                <select
                  value={activeFilters.category}
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                  <option value="">All</option>
                  {filters.categories.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fabric */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  Fabric
                </label>
                <select
                  value={activeFilters.fabric}
                  onChange={(e) => handleFilterChange("fabric", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                  <option value="">All</option>
                  {filters.fabrics.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              {/* Supplier */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  Supplier
                </label>
                <select
                  value={activeFilters.supplier}
                  onChange={(e) =>
                    handleFilterChange("supplier", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                  <option value="">All</option>
                  {filters.suppliers.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              {/* Color */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  Color
                </label>
                <select
                  value={activeFilters.color}
                  onChange={(e) => handleFilterChange("color", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                  <option value="">All</option>
                  {filters.colors.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              {/* Season */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  Season
                </label>
                <select
                  value={activeFilters.season}
                  onChange={(e) => handleFilterChange("season", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                  <option value="">All</option>
                  {filters.seasons.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              {/* Min Price */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  Min Price ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={activeFilters.min_price}
                  onChange={(e) =>
                    handleFilterChange("min_price", e.target.value)
                  }
                  placeholder={`${filters.price_min}`}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>

              {/* Max Price */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  Max Price ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={activeFilters.max_price}
                  onChange={(e) =>
                    handleFilterChange("max_price", e.target.value)
                  }
                  placeholder={`${filters.price_max}`}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : data && data.products.length > 0 ? (
        <>
          <p className="text-sm text-gray-500">
            Showing {data.products.length} of {data.total} results
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.products.map((product) => (
              <ProductCard key={product.style_number} product={product} />
            ))}
          </div>
          <Pagination
            page={data.page}
            totalPages={data.total_pages}
            onPageChange={setPage}
          />
        </>
      ) : data && data.products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-semibold text-gray-700">
            No products found
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Try adjusting your search or filters.
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Clear Filters
          </button>
        </div>
      ) : null}
    </div>
  );
}

// ── Product Card Component ───────────────────────────────────────────────────

function ProductCard({ product }: { product: ProductItem }) {
  return (
    <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm font-bold text-gray-900">
              {product.style_number}
            </p>
            <p className="mt-0.5 text-sm text-gray-600 line-clamp-2">
              {product.description || "No description"}
            </p>
          </div>
          {product.selling_price && (
            <span className="text-sm font-bold text-gray-900 whitespace-nowrap ml-2">
              ${product.selling_price.toFixed(2)}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {product.category && (
            <Badge
              variant="secondary"
              className="bg-gray-100 text-gray-700 font-normal text-xs"
            >
              {product.category}
            </Badge>
          )}
          {product.fabric && (
            <Badge
              variant="secondary"
              className="bg-gray-100 text-gray-700 font-normal text-xs"
            >
              {product.fabric}
            </Badge>
          )}
          {product.color && (
            <Badge
              variant="secondary"
              className="bg-gray-100 text-gray-700 font-normal text-xs"
            >
              {product.color}
            </Badge>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {product.supplier || "Unknown supplier"}
          </span>
          {product.season && (
            <span className="text-xs text-gray-400">{product.season}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
