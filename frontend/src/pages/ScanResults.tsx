import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import IssueCard from "../components/IssueCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ReportButton from "../components/ReportButton";
import RiskBadge from "../components/RiskBadge";
import ScoreRing from "../components/ScoreRing";
import { getScan } from "../services/scanService";
import type { Scan } from "../types";

export default function ScanResults() {
  const { id } = useParams();
  const [scan, setScan] = useState<Scan | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (!id) return;
    getScan(Number(id))
      .then(setScan)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!scan) {
    return <EmptyState title="Scan not found" description="This scan may have been deleted." />;
  }

  const issues = scan.issues ?? [];
  const filtered =
    filter === "all" ? issues : issues.filter((i) => i.severity.toLowerCase() === filter);

  const sevCounts: Record<string, number> = {};
  issues.forEach((i) => {
    sevCounts[i.severity] = (sevCounts[i.severity] ?? 0) + 1;
  });

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
        
        <div className="relative z-10 flex flex-wrap items-center gap-10">
          <ScoreRing score={scan.score} />
          <div className="flex-1">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">{scan.project_name}</h2>
            <p className="mt-1 text-sm font-medium text-slate-400">
              {scan.scan_type.toUpperCase()} SCAN <span className="mx-2 opacity-50">•</span> {new Date(scan.created_at).toLocaleString()}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <RiskBadge level={scan.risk_level} />
              {scan.language && (
                <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-300">
                  {scan.language}
                </span>
              )}
              {scan.target_url && (
                <span className="rounded-lg border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-mono text-purple-400 truncate max-w-md">
                  {scan.target_url}
                </span>
              )}
            </div>
          </div>
          <div className="shrink-0">
            <ReportButton scanId={scan.id} projectName={scan.project_name} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {["all", "critical", "high", "medium", "low", "info"].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`rounded-xl px-5 py-2 text-sm font-semibold capitalize transition-all ${
              filter === s 
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-[0_0_15px_rgba(255,106,0,0.4)] border-transparent" 
                : "bg-black/40 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white"
            }`}
          >
            {s} {s !== "all" && sevCounts[s.charAt(0).toUpperCase() + s.slice(1)]
              ? <span className={`ml-2 rounded-full bg-black/30 px-2 py-0.5 text-xs ${filter === s ? "text-white" : ""}`}>{sevCounts[s.charAt(0).toUpperCase() + s.slice(1)]}</span>
              : ""}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No issues in this filter"
          description="Great news — no findings match the selected severity."
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      )}

      <Link to="/history" className="text-sm text-purple-400 hover:underline">
        ← Back to history
      </Link>
    </div>
  );
}
