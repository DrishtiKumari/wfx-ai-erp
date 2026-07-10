"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RecentOrder } from "@/lib/types";

interface RecentOrdersProps {
  data: RecentOrder[];
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "delivered":
      return "bg-green-100 text-green-800";
    case "shipped":
      return "bg-blue-100 text-blue-800";
    case "in production":
      return "bg-yellow-100 text-yellow-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export function RecentOrders({ data }: RecentOrdersProps) {
  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-900">
          Recent Orders
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((order) => (
            <div
              key={order.order_number}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-900">
                  {order.order_number}
                </p>
                <p className="text-xs text-gray-500">
                  {order.buyer_name} • {order.product}
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-sm font-medium text-gray-900">
                  ${order.total_value.toLocaleString()}
                </p>
                <Badge className={getStatusColor(order.status)} variant="secondary">
                  {order.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
