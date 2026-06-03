import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardChart from "../components/DashboardChart";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import RiskBadge from "../components/RiskBadge";
import StatCard from "../components/StatCard";
import { getDashboardSummary } from "../services/dashboardService";
import type { DashboardSummary } from "../types";

export default function Dashboard() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardSummary()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!data || data.total_scans === 0) {
    return (
      <EmptyState
        title="No scans yet"
        description="Run your first code or API security scan to see insights here."
        action={
          <Link to="/scan/new" className="btn-primary">
            Start New Scan
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Scans" value={data.total_scans} />
        <StatCard label="Average Score" value={data.average_score} accent="cyan" />
        <StatCard
          label="Critical Risk Scans"
          value={data.risk_distribution.Critical ?? 0}
          sub="Requires immediate attention"
        />
        <StatCard
          label="Issues Found"
          value={Object.values(data.severity_counts).reduce((a, b) => a + b, 0)}
        />
      </div>

      <DashboardChart
        severityCounts={data.severity_counts}
        riskDistribution={data.risk_distribution}
      />

      <div className="glass rounded-xl p-5">
        <h3 className="mb-4 font-semibold">Recent Scans</h3>
        <div className="space-y-3">
          {data.recent_scans.map((s) => (
            <Link
              key={s.id}
              to={`/scan/results/${s.id}`}
              className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-4 py-3 transition hover:border-orange-500/30"
            >
              <div>
                <p className="font-medium">{s.project_name}</p>
                <p className="text-xs text-slate-500">
                  {s.scan_type} · {new Date(s.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-orange-500">{s.score}</span>
                <RiskBadge level={s.risk_level} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
