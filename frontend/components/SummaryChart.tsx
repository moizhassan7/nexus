"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface SummaryChartProps {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

const COLORS = {
  Critical: "#ef4444",
  High: "#f97316",
  Medium: "#eab308",
  Low: "#3b82f6",
};

export default function SummaryChart({
  critical,
  high,
  medium,
  low,
}: SummaryChartProps) {
  const data = [
    { name: "Critical", value: critical, color: COLORS.Critical },
    { name: "High", value: high, color: COLORS.High },
    { name: "Medium", value: medium, color: COLORS.Medium },
    { name: "Low", value: low, color: COLORS.Low },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500">
        No vulnerabilities to chart
      </div>
    );
  }

  return (
    <div className="h-64 rounded-xl border border-slate-200 bg-white p-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
            label={({ name, value }) => `${name}: ${value}`}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
