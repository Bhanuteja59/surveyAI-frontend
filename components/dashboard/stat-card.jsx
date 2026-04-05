import { cn } from "@/lib/utils";

export function StatCard({ title, value, icon: Icon, trend, color = "indigo" }) {
  const iconColors = {
    teal: "bg-teal-50 text-teal-600",
    green: "bg-green-50 text-green-600",
    rose: "bg-rose-50 text-rose-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-wide text-slate-400">{title}</p>
          <p className="mt-1.5 text-2xl font-bold text-slate-900">{value}</p>
          {trend && <p className="mt-1 text-[11px] text-slate-400">{trend}</p>}
        </div>
        <div className={cn("rounded-lg p-2.5", iconColors[color])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
