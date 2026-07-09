"use client";

import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
      <p className="mt-4 text-sm text-gray-500">{message}</p>
    </div>
  );
}
