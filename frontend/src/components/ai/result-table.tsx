"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TableIcon } from "lucide-react";

interface ResultTableProps {
  rows: Record<string, unknown>[];
}

export function ResultTable({ rows }: ResultTableProps) {
  if (!rows || rows.length === 0) return null;

  const columns = Object.keys(rows[0]);

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <TableIcon className="h-4 w-4" />
          Results ({rows.length} row{rows.length !== 1 ? "s" : ""})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-gray-200 overflow-x-auto max-h-96">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                {columns.map((col) => (
                  <TableHead
                    key={col}
                    className="text-xs font-semibold text-gray-700 uppercase whitespace-nowrap"
                  >
                    {col.replace(/_/g, " ")}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, rowIdx) => (
                <TableRow key={rowIdx} className="hover:bg-gray-50">
                  {columns.map((col) => (
                    <TableCell
                      key={col}
                      className="text-sm text-gray-700 whitespace-nowrap"
                    >
                      {formatValue(row[col])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number") {
    // Format large numbers with commas, decimals with 2 places
    if (Number.isInteger(value)) return value.toLocaleString();
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return String(value);
}
