import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import RiskBadge from "../components/RiskBadge";
import { deleteScan, listScans } from "../services/scanService";
import type { Scan } from "../types";

export default function ScanHistory() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    listScans()
      .then(setScans)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this scan?")) return;
    await deleteScan(id);
    load();
  };

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
        title="No scan history"
        description="Completed scans will appear here."
        action={
          <Link to="/scan/new" className="btn-primary">
            New Scan
          </Link>
        }
      />
    );
  }

  return (
    <div className="glass overflow-hidden rounded-xl">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-white/10 bg-white/5 text-slate-400">
          <tr>
            <th className="px-4 py-3">Project</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Score</th>
            <th className="px-4 py-3">Risk</th>
            <th className="px-4 py-3">Issues</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {scans.map((s) => (
            <tr key={s.id} className="border-b border-white/5 hover:bg-white/5">
              <td className="px-4 py-3 font-medium">
                <Link to={`/scan/results/${s.id}`} className="text-purple-400 hover:underline">
                  {s.project_name}
                </Link>
              </td>
              <td className="px-4 py-3 capitalize text-slate-400">{s.scan_type}</td>
              <td className="px-4 py-3 font-bold text-orange-500">{s.score}</td>
              <td className="px-4 py-3">
                <RiskBadge level={s.risk_level} />
              </td>
              <td className="px-4 py-3">{s.issue_count ?? 0}</td>
              <td className="px-4 py-3 text-slate-500">
                {new Date(s.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => handleDelete(s.id)}
                  className="text-red-400 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
