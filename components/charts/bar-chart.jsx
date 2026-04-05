"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const COLORS = ["#0d9488", "#f43f5e", "#f59e0b", "#ec4899", "#10b981", "#3b82f6", "#ef4444", "#14b8a6"];

export function ChoiceBarChart({ data, color }) {
  const chartData = Object.entries(data).map(([name, value]) => ({ name, value }));
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 30 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} angle={-20} textAnchor="end" />
        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip contentStyle={{ border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={color || COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RatingBarChart({ distribution, avg, max = 5 }) {
  const chartData = Array.from({ length: max }, (_, i) => ({
    rating: String(i + 1),
    count: distribution[String(i + 1)] || 0,
  }));
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="text-2xl font-bold text-slate-900">{avg.toFixed(1)}</span>
        <span className="text-sm text-slate-500">/ {max} avg</span>
        <div className="ml-auto flex gap-0.5">
          {Array.from({ length: max }).map((_, i) => (
            <div
              key={i}
              className={`h-2 w-6 rounded-full ${i < Math.round(avg) ? "bg-teal-500" : "bg-slate-200"}`}
            />
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={130}>
        <BarChart data={chartData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="rating" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip contentStyle={{ border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }} />
          <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
