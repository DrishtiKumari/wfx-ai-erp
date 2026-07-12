"use client";

import { useState } from "react";
import { AlertCircle, Sparkles } from "lucide-react";
import { QueryInput } from "@/components/ai/query-input";
import { SqlDisplay } from "@/components/ai/sql-display";
import { ResultTable } from "@/components/ai/result-table";
import { AnswerCard } from "@/components/ai/answer-card";
import { askQuestion } from "@/lib/api";
import type { NLQueryResponse } from "@/lib/types";

export default function AIQueryPage() {
  const [result, setResult] = useState<NLQueryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (question: string) => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const response = await askQuestion(question);
      setResult(response);

      if (response.error) {
        setError(response.answer);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to process question"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          AI Query
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Ask business questions in plain English. The AI will generate safe SQL,
          execute it, and provide insights.
        </p>
      </div>

      {/* Safety notice */}
      <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">
        <p className="text-xs text-gray-500">
          <span className="font-medium text-gray-700">Safety:</span> Only
          read-only SELECT queries are executed. All write operations (INSERT,
          DELETE, DROP, etc.) are blocked. Only known ERP tables can be queried.
        </p>
      </div>

      {/* Query input */}
      <QueryInput onSubmit={handleSubmit} loading={loading} />

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-gray-900 animate-spin" />
          </div>
          <p className="mt-4 text-sm font-medium text-gray-700">
            Generating SQL and querying your data...
          </p>
          <p className="mt-1 text-xs text-gray-500">
            This may take 10-20 seconds on the free tier
          </p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">Query Error</p>
            <p className="mt-1 text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {result && !loading && !result.error && (
        <div className="space-y-4">
          {/* Generated SQL */}
          <SqlDisplay sql={result.sql} />

          {/* Result table */}
          <ResultTable rows={result.rows} />

          {/* AI Answer */}
          <AnswerCard answer={result.answer} confidence={result.confidence} />
        </div>
      )}

      {/* Empty state - before any query */}
      {!result && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-gray-100 p-4">
            <Sparkles className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-700">
            Ready to Answer
          </h3>
          <p className="mt-2 text-sm text-gray-500 max-w-sm">
            Type a question above or click one of the examples to get started.
            The AI will analyze your ERP data and provide insights.
          </p>
        </div>
      )}
    </div>
  );
}
