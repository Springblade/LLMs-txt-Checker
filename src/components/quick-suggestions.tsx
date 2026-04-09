"use client";

import type { Suggestion } from "@/lib/types";

interface QuickSuggestionsProps {
  suggestions: Suggestion[];
}

const priorityStyles = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-green-100 text-green-700",
};

export function QuickSuggestions({ suggestions }: QuickSuggestionsProps) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <aside className="w-60 flex-shrink-0 border-l border-gray-200 bg-gray-50 p-4">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
        <svg
          className="h-5 w-5 text-amber-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        Quick Suggestions
      </h2>

      <ul className="space-y-3">
        {suggestions.map((suggestion) => (
          <li
            key={suggestion.id}
            className="rounded-lg border border-gray-200 bg-white p-3 transition-colors duration-150 hover:bg-gray-100"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <svg
                  className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-medium text-gray-900">
                  {suggestion.title}
                </span>
              </div>

              <p className="pl-6 text-sm text-gray-500">
                {suggestion.description}
              </p>

              <div className="pl-6">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                    priorityStyles[suggestion.priority]
                  }`}
                >
                  {suggestion.priority}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
