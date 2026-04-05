"use client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function TrendChart({ data, surveyTitle }) {
  const formatted = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", { month: "long", day: "numeric" }),
    responses: d.count,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 shadow-md rounded-lg p-3 text-sm">
          <p className="font-bold text-slate-800 mb-1">{label} Date</p>
          <p className="font-semibold text-[#0d9488] mb-1">
            {payload[0].value} {payload[0].value === 1 ? "Response" : "Responses"}
          </p>
          {surveyTitle && (
            <p className="text-xs text-slate-500 max-w-[200px] truncate border-t border-slate-100 pt-1 mt-1">
              Survey: <strong>{surveyTitle}</strong>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={formatted} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorResponses" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0d9488" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
        <Area
          type="monotone"
          dataKey="responses"
          stroke="#0d9488"
          strokeWidth={3}
          fill="url(#colorResponses)"
          dot={false}
          activeDot={{ r: 5, strokeWidth: 0, fill: "#0d9488" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
