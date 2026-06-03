import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const SEV_COLORS: Record<string, string> = {
  Critical: "#EF4444",
  High: "#F97316",
  Medium: "#EAB308",
  Low: "#3B82F6",
  Info: "#64748B",
};

const RISK_COLORS: Record<string, string> = {
  Low: "#10B981",
  Medium: "#EAB308",
  High: "#F97316",
  Critical: "#EF4444",
};

interface Props {
  severityCounts: Record<string, number>;
  riskDistribution: Record<string, number>;
}

export default function DashboardChart({ severityCounts, riskDistribution }: Props) {
  const sevData = Object.entries(severityCounts).map(([name, value]) => ({ name, value }));
  const riskData = Object.entries(riskDistribution)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="glass rounded-xl p-5">
        <h3 className="mb-4 text-sm font-medium text-slate-400">Issues by Severity</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={sevData}>
            <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: "#0D1117", border: "1px solid rgba(255,255,255,0.1)" }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {sevData.map((entry) => (
                <Cell key={entry.name} fill={SEV_COLORS[entry.name] ?? "#64748B"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="glass rounded-xl p-5">
        <h3 className="mb-4 text-sm font-medium text-slate-400">Risk Distribution</h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={riskData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={4}
            >
              {riskData.map((entry) => (
                <Cell key={entry.name} fill={RISK_COLORS[entry.name] ?? "#64748B"} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "#0D1117", border: "1px solid rgba(255,255,255,0.1)" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
