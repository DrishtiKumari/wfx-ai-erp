"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, TrendingUp, AlertTriangle } from "lucide-react";
import type { DashboardInsight } from "@/lib/types";

interface InsightsPanelProps {
  data: DashboardInsight[];
}

function getInsightIcon(intent: string) {
  switch (intent) {
    case "opportunity":
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-amber-600" />;
    default:
      return <Lightbulb className="h-4 w-4 text-blue-600" />;
  }
}

function getInsightBg(intent: string) {
  switch (intent) {
    case "opportunity":
      return "bg-green-50 border-green-100";
    case "warning":
      return "bg-amber-50 border-amber-100";
    default:
      return "bg-blue-50 border-blue-100";
  }
}

export function InsightsPanel({ data }: InsightsPanelProps) {
  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-900">
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((insight, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 p-3 rounded-lg border ${getInsightBg(insight.intent)}`}
            >
              <div className="mt-0.5">{getInsightIcon(insight.intent)}</div>
              <p className="text-sm text-gray-700">{insight.text}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
