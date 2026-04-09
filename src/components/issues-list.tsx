"use client";

import { useState } from "react";
import type { ValidationError, ValidationWarning } from "@/lib/types";

interface IssuesListProps {
  /** When false, file was not loaded (404, timeout, etc.) — do not show "all checks passed". */
  found?: boolean;
  message?: string;
  errors?: ValidationError[];
  warnings?: ValidationWarning[];
}

interface IssueItemProps {
  rule: string;
  message: string;
  line?: number;
  icon: React.ReactNode;
}

function IssueItem({ rule, message, line, icon }: IssueItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-700 last:border-b-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-start gap-3 p-3 text-left hover:bg-slate-800/50 transition-colors rounded-lg"
      >
        <span className="flex-shrink-0 mt-0.5">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-100">{rule}</span>
            {line !== undefined && (
              <span className="text-xs text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                Line {line}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 mt-0.5">{message}</p>
        </div>
        <svg
          className={`flex-shrink-0 mt-1 w-4 h-4 text-slate-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-3 pb-3 pl-9">
          <div className="bg-slate-800/50 rounded-lg p-3 text-sm text-slate-300">
            <p>
              <span className="text-slate-400">Rule:</span> {rule}
            </p>
            <p className="mt-1">
              <span className="text-slate-400">Message:</span> {message}
            </p>
            {line !== undefined && (
              <p className="mt-1">
                <span className="text-slate-400">Location:</span> Line {line}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ErrorIcon() {
  return (
    <svg
      className="w-5 h-5 text-red-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="10" strokeWidth={2} />
      <path strokeLinecap="round" strokeWidth={2} d="M15 9l-6 6M9 9l6 6" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg
      className="w-5 h-5 text-yellow-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="w-6 h-6 text-green-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="10" strokeWidth={2} />
      <path strokeLinecap="round" strokeWidth={2} d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function IssuesList({ found = true, message, errors, warnings }: IssuesListProps) {
  if (found === false) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <svg
          className="w-12 h-12 text-amber-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <p className="mt-4 text-lg font-medium text-slate-200">Could not load llms.txt</p>
        <p className="mt-2 text-sm text-slate-400 max-w-md">
          {message ?? "The file was not found or could not be fetched from this site."}
        </p>
        <p className="mt-4 text-xs text-slate-500">
          Expected URL: <span className="font-mono text-slate-400">/llms.txt</span> at the site root.
        </p>
      </div>
    );
  }

  const errorsList = errors ?? [];
  const warningsList = warnings ?? [];
  const hasErrors = errorsList.length > 0;
  const hasWarnings = warningsList.length > 0;
  const hasIssues = hasErrors || hasWarnings;

  if (!hasIssues) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <CheckIcon />
        <p className="mt-4 text-lg font-medium text-slate-200">No issues found</p>
        <p className="mt-1 text-sm text-slate-400">
          Your llms.txt file passes all validation checks.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-700">
      {hasErrors && (
        <div>
          <div className="px-4 py-2 bg-slate-800/50">
            <h3 className="text-sm font-semibold text-slate-300">
              Errors ({errorsList.length})
            </h3>
          </div>
          <div className="divide-y divide-slate-700">
            {errorsList.map((error, index) => (
              <IssueItem
                key={`error-${index}`}
                rule={error.rule}
                message={error.message}
                line={error.line}
                icon={<ErrorIcon />}
              />
            ))}
          </div>
        </div>
      )}
      {hasWarnings && (
        <div>
          <div className="px-4 py-2 bg-slate-800/50">
            <h3 className="text-sm font-semibold text-slate-300">
              Warnings ({warningsList.length})
            </h3>
          </div>
          <div className="divide-y divide-slate-700">
            {warningsList.map((warning, index) => (
              <IssueItem
                key={`warning-${index}`}
                rule={warning.rule}
                message={warning.message}
                line={warning.line}
                icon={<WarningIcon />}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
