"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown } from "lucide-react";
import type { ProductItem } from "@/lib/types";

interface ProductTableProps {
  products: ProductItem[];
  sortBy: string;
  sortOrder: string;
  onSort: (column: string) => void;
  onSelect: (product: ProductItem) => void;
}

const columns = [
  { key: "style_number", label: "Style #" },
  { key: "description", label: "Description" },
  { key: "category", label: "Category" },
  { key: "supplier", label: "Supplier" },
  { key: "fabric", label: "Fabric" },
  { key: "color", label: "Color" },
  { key: "price", label: "Price" },
  { key: "status", label: "Status" },
];

export function ProductTable({
  products,
  sortBy,
  sortOrder,
  onSort,
  onSelect,
}: ProductTableProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className="cursor-pointer select-none hover:bg-gray-100 transition-colors"
                onClick={() => onSort(col.key)}
              >
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-gray-700 uppercase">
                    {col.label}
                  </span>
                  {sortBy === col.key && (
                    <ArrowUpDown className={`h-3 w-3 text-gray-900 ${sortOrder === "desc" ? "rotate-180" : ""}`} />
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-12 text-gray-500">
                No products found.
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow
                key={product.style_number}
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => onSelect(product)}
              >
                <TableCell className="font-medium text-gray-900">
                  {product.style_number}
                </TableCell>
                <TableCell className="max-w-48 truncate text-gray-700">
                  {product.description || "—"}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-700 font-normal">
                    {product.category || "—"}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-600 text-sm">
                  {product.supplier || "—"}
                </TableCell>
                <TableCell className="text-gray-600 text-sm">
                  {product.fabric || "—"}
                </TableCell>
                <TableCell className="text-gray-600 text-sm">
                  {product.color || "—"}
                </TableCell>
                <TableCell className="font-medium text-gray-900">
                  {product.price ? `$${product.price.toFixed(2)}` : "—"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={product.status === "active" ? "default" : "secondary"}
                    className={
                      product.status === "active"
                        ? "bg-green-100 text-green-800 font-normal"
                        : "bg-gray-100 text-gray-600 font-normal"
                    }
                  >
                    {product.status || "—"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
