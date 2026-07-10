"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, AlertCircle, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductDetail } from "@/components/products/product-detail";
import { Pagination } from "@/components/products/pagination";
import { getProducts } from "@/lib/api";
import type { ProductItem, ProductListResponse } from "@/lib/types";

export default function ProductsPage() {
  const [data, setData] = useState<ProductListResponse | null>(null);
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
        page_size: 12,
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
    void fetchProducts();
  }, [fetchProducts]);

  const handleSelectProduct = (product: ProductItem) => {
    setSelectedProduct(product);
    setDetailOpen(true);
  };

  const handleSort = (value: string) => {
    const [field, order] = value.split(":");
    setSortBy(field);
    setSortOrder(order);
    setPage(1);
  };

  // Filter products by search term locally
  const displayProducts = data?.items.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.style_number?.toLowerCase().includes(term) ||
      p.style_name?.toLowerCase().includes(term) ||
      p.fabric?.toLowerCase().includes(term) ||
      p.color?.toLowerCase().includes(term) ||
      p.supplier?.toLowerCase().includes(term)
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
        <p className="text-sm text-gray-600">
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

        {/* Sort */}
        <select
          value={`${sortBy}:${sortOrder}`}
          onChange={(e) => handleSort(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          <option value="style_number:asc">Style # (A-Z)</option>
          <option value="style_number:desc">Style # (Z-A)</option>
          <option value="selling_price:asc">Price (Low-High)</option>
          <option value="selling_price:desc">Price (High-Low)</option>
          <option value="category:asc">Category (A-Z)</option>
        </select>

        {/* Results count */}
        {data && (
          <span className="ml-auto text-sm text-gray-500">
            {data.total} products total
          </span>
        )}
      </div>

      {/* Product Gallery */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {displayProducts.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16">
              <Search className="h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-semibold text-gray-700">
                No products found
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Try adjusting your search or filters.
              </p>
            </div>
          ) : (
            displayProducts.map((product) => (
              <Card
                key={product.style_number}
                className="border-gray-200 shadow-sm hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
                onClick={() => handleSelectProduct(product)}
              >
                {/* Product Image */}
                <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.style_name || product.style_number}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-xs">No Image</span>
                    </div>
                  )}
                </div>

                <CardContent className="p-4 space-y-2">
                  {/* Style Number & Name */}
                  <div>
                    <p className="text-xs font-medium text-gray-500">
                      {product.style_number}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {product.style_name || "—"}
                    </p>
                  </div>

                  {/* Fabric & GSM */}
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>{product.fabric || "—"}</span>
                    {product.gsm && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span>{product.gsm} GSM</span>
                      </>
                    )}
                  </div>

                  {/* Supplier */}
                  <p className="text-xs text-gray-500 truncate">
                    {product.supplier || "Unknown supplier"}
                  </p>

                  {/* Price & Demand */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-sm font-bold text-gray-900">
                      {product.selling_price
                        ? `$${product.selling_price.toFixed(2)}`
                        : "—"}
                    </span>
                    {product.ai_demand && (
                      <Badge
                        variant="secondary"
                        className={
                          product.ai_demand === "High"
                            ? "bg-green-100 text-green-700 text-xs"
                            : "bg-gray-100 text-gray-600 text-xs"
                        }
                      >
                        {product.ai_demand}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {data && data.total_pages > 1 && (
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
