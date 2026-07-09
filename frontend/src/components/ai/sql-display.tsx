"use client";

import { useState } from "react";
import { Copy, Check, Code } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SqlDisplayProps {
  sql: string;
}

export function SqlDisplay({ sql }: SqlDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!sql) return null;

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Code className="h-4 w-4" />
            Generated SQL
          </CardTitle>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-green-600" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy
              </>
            )}
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <pre className="rounded-lg bg-gray-900 p-4 overflow-x-auto">
          <code className="text-sm text-gray-100 font-mono whitespace-pre-wrap break-words">
            {sql}
          </code>
        </pre>
      </CardContent>
    </Card>
  );
}
