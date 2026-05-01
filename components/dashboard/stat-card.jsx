import { cn } from "@/lib/utils";

export function StatCard({ title, value, icon: Icon, trend, color = "indigo" }) {
  const iconColors = {
    teal: "bg-teal-50 text-teal-600",
    green: "bg-green-50 text-green-600",
    rose: "bg-rose-50 text-rose-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-indigo-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-wide text-slate-400 transition-colors group-hover:text-slate-500">{title}</p>
          <p className="mt-1.5 text-2xl font-bold text-slate-900">{value}</p>
          {trend && <p className="mt-1 text-[11px] text-slate-400">{trend}</p>}
        </div>
        <div className={cn("rounded-lg p-2.5 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6", iconColors[color])}>
          <Icon className="h-5 w-5 transition-transform duration-500 group-hover:scale-110" />
        </div>
      </div>
    </div>
  );
}
