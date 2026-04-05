"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export const Button = React.forwardRef(
  ({ className, variant = "default", size = "md", loading, disabled, children, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      default:     "bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-sm hover:shadow-md hover:opacity-90",
      outline:     "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 hover:border-slate-300",
      ghost:       "text-slate-700 hover:bg-slate-100",
      destructive: "bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-sm hover:shadow-md hover:opacity-90",
      secondary:   "bg-slate-100 text-slate-900 hover:bg-slate-200",
    };

    const sizes = {
      sm:   "h-8 px-3 text-sm",
      md:   "h-10 px-4 text-sm",
      lg:   "h-11 px-6 text-base",
      icon: "h-9 w-9",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && (
          <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
