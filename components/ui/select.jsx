"use client";
import { cn } from "@/lib/utils";

export function Select({ className, label, error, id, options, ...props }) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          "block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900",
          "focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500",
          error && "border-red-500",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
