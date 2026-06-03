import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import ReportButton from "../components/ReportButton";
import { listScans } from "../services/scanService";
import type { Scan } from "../types";

export default function Reports() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listScans()
      .then(setScans)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (scans.length === 0) {
    return (
      <EmptyState
        title="No reports available"
        description="Run a scan first, then download PDF reports here."
        action={
          <Link to="/scan/new" className="btn-primary">
            New Scan
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {scans.map((s) => (
        <div key={s.id} className="glass flex items-center justify-between rounded-xl p-5">
          <div>
            <h3 className="font-semibold">{s.project_name}</h3>
            <p className="text-sm text-slate-400">
              Score {s.score} · {s.issue_count ?? 0} issues
            </p>
            <Link to={`/scan/results/${s.id}`} className="mt-2 inline-block text-xs text-purple-400">
              View results →
            </Link>
          </div>
          <ReportButton scanId={s.id} projectName={s.project_name} />
        </div>
      ))}
    </div>
  );
}
