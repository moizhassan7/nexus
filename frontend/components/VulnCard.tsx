import type { Vulnerability } from "@/lib/api";
import SeverityBadge from "./SeverityBadge";

interface VulnCardProps {
  vulnerability: Vulnerability;
}

export default function VulnCard({ vulnerability }: VulnCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900">
            {vulnerability.rule_id}{" "}
            <span className="font-semibold text-slate-700">
              — {vulnerability.rule_name}
            </span>
          </p>
          <code className="mt-1 block truncate font-mono text-sm text-shield-600">
            {vulnerability.endpoint}
          </code>
        </div>
        <SeverityBadge severity={vulnerability.severity} />
      </div>
      <p className="mt-3 text-sm text-slate-600">{vulnerability.description}</p>
      <div className="mt-4 flex gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
        <span className="text-emerald-600" aria-hidden>
          ✓
        </span>
        <p className="text-sm text-emerald-900">
          <span className="font-medium">Fix: </span>
          {vulnerability.fix}
        </p>
      </div>
    </article>
  );
}
