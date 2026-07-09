"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

interface AnswerCardProps {
  answer: string;
  confidence: number;
}

export function AnswerCard({ answer, confidence }: AnswerCardProps) {
  if (!answer) return null;

  const confidenceLabel =
    confidence >= 0.8
      ? "High"
      : confidence >= 0.5
        ? "Medium"
        : "Low";

  const confidenceColor =
    confidence >= 0.8
      ? "text-green-700 bg-green-100"
      : confidence >= 0.5
        ? "text-yellow-700 bg-yellow-100"
        : "text-gray-700 bg-gray-100";

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            AI Answer
          </CardTitle>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${confidenceColor}`}
          >
            {confidenceLabel} confidence ({Math.round(confidence * 100)}%)
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-800 leading-relaxed">{answer}</p>
      </CardContent>
    </Card>
  );
}
