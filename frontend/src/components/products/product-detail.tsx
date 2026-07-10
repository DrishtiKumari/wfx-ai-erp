"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ProductItem } from "@/lib/types";

interface ProductDetailProps {
  product: ProductItem | null;
  open: boolean;
  onClose: () => void;
}

export function ProductDetail({ product, open, onClose }: ProductDetailProps) {
  if (!product) return null;

  const fields = [
    { label: "Style Number", value: product.style_number },
    { label: "Style Name", value: product.style_name },
    { label: "Category", value: product.category },
    { label: "Supplier", value: product.supplier },
    { label: "Fabric", value: product.fabric },
    { label: "GSM", value: product.gsm?.toString() },
    { label: "Color", value: product.color },
    { label: "Print", value: product.print },
    { label: "Brand", value: product.brand },
    { label: "Size Range", value: product.size_range },
    { label: "Season", value: product.season },
    {
      label: "Cost",
      value: product.cost ? `$${product.cost.toFixed(2)}` : undefined,
    },
    {
      label: "Selling Price",
      value: product.selling_price ? `$${product.selling_price.toFixed(2)}` : undefined,
    },
    { label: "Status", value: product.status },
  ];

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold text-gray-900">
            {product.style_number}
          </SheetTitle>
          <p className="text-sm text-gray-500">{product.description}</p>
        </SheetHeader>

        <Separator className="my-6" />

        <div className="space-y-5">
          {fields.map(
            (field) =>
              field.value && (
                <div key={field.label}>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {field.label}
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {field.value}
                  </p>
                </div>
              )
          )}
        </div>

        <Separator className="my-6" />

        <div className="flex gap-2 flex-wrap">
          {product.category && (
            <Badge variant="secondary" className="bg-gray-100 text-gray-700">
              {product.category}
            </Badge>
          )}
          {product.season && (
            <Badge variant="secondary" className="bg-gray-100 text-gray-700">
              {product.season}
            </Badge>
          )}
          {product.status && (
            <Badge
              className={
                product.status === "active"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-600"
              }
            >
              {product.status}
            </Badge>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
