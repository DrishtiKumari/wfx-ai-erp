"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";

interface QueryInputProps {
  onSubmit: (question: string) => void;
  loading: boolean;
}

const exampleQuestions = [
  "Which buyer generated the highest revenue?",
  "How many orders are pending?",
  "What is the most popular fabric type?",
  "Show me all products under $50",
  "Compare revenue between top 5 buyers",
  "Which supplier has the most products?",
];

export function QueryInput({ onSubmit, loading }: QueryInputProps) {
  const [question, setQuestion] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && !loading) {
      onSubmit(question.trim());
    }
  };

  const handleExample = (q: string) => {
    setQuestion(q);
    onSubmit(q);
  };

  return (
    <div className="space-y-4">
      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a business question in plain English..."
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={!question.trim() || loading}
          className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Ask
        </button>
      </form>

      {/* Example questions */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-gray-500 py-1">Try:</span>
        {exampleQuestions.map((q) => (
          <button
            key={q}
            onClick={() => handleExample(q)}
            disabled={loading}
            className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-200 hover:text-gray-900 disabled:opacity-50 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
