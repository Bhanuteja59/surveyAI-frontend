"use client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function TrendChart({ data, surveyTitle }) {
  const formatted = data.map((d) => ({
    // Short date format: "30 Mar"
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    responses: d.count,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-xl rounded-xl p-3 text-sm ring-1 ring-black/5">
          <p className="font-bold text-slate-800 mb-0.5">{label}</p>
          <p className="font-semibold text-emerald-600 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {payload[0].value} {payload[0].value === 1 ? "Response" : "Responses"}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={formatted} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorResponses" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Tooltip 
          content={<CustomTooltip />} 
          cursor={{ stroke: '#10b981', strokeWidth: 2, strokeDasharray: '4 4' }} 
        />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 500 }} 
          tickLine={false} 
          axisLine={false} 
          minTickGap={30} // Prevent overlapping labels
          dy={10}
        />
        <YAxis 
          tick={{ fontSize: 10, fill: "#94a3b8" }} 
          tickLine={false} 
          axisLine={false} 
          allowDecimals={false} 
        />
        <Area
          type="monotone"
          dataKey="responses"
          stroke="#10b981"
          strokeWidth={4}
          fill="url(#colorResponses)"
          dot={false}
          activeDot={{ r: 6, strokeWidth: 0, fill: "#10b981", shadow: "0 0 10px rgba(16,185,129,0.5)" }}
          animationDuration={1500}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
