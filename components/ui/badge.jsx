import { cn } from "@/lib/utils";

export function Badge({ className, variant = "default", children, ...props }) {
  const variants = {
    default:     "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200/60",
    success:     "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60",
    warning:     "bg-amber-50 text-amber-700 ring-1 ring-amber-200/60",
    destructive: "bg-red-50 text-red-700 ring-1 ring-red-200/60",
    secondary:   "bg-slate-100 text-slate-600 ring-1 ring-slate-200/60",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
