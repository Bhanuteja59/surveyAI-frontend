"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400",
            "focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500",
            "disabled:bg-slate-50 disabled:text-slate-500",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export const Textarea = React.forwardRef(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={3}
          className={cn(
            "block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400",
            "focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none",
            error && "border-red-500",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
