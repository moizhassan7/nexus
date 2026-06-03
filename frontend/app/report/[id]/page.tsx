"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import SummaryChart from "@/components/SummaryChart";
import VulnCard from "@/components/VulnCard";
import type { AnalysisResult, Vulnerability } from "@/lib/api";
import { getResult } from "@/lib/api";

const SEVERITY_ORDER: Record<Vulnerability["severity"], number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

const COUNT_BADGE: Record<string, string> = {
  Critical: "bg-red-100 text-red-800 ring-red-200",
  High: "bg-orange-100 text-orange-800 ring-orange-200",
  Medium: "bg-yellow-100 text-yellow-800 ring-yellow-200",
  Low: "bg-blue-100 text-blue-800 ring-blue-200",
};

export default function ReportPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getResult(id)
      .then(setResult)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleExport = useCallback(() => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result.vulnerabilities, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `secureshield-report-${id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [result, id]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-slate-600">Loading report...</p>
      </main>
    );
  }

  if (error || !result) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-red-600">{error ?? "Report not found"}</p>
        <Link href="/" className="text-shield-600 hover:underline">
          ← Back to home
        </Link>
      </main>
    );
  }

  const sorted = [...result.vulnerabilities].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="font-bold text-shield-700 hover:text-shield-900"
          >
            ← SecureShield
          </Link>
          <button
            type="button"
            onClick={handleExport}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Export JSON
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">{result.spec_title}</h1>
          <SummaryStats result={result} />
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">
            Severity breakdown
          </h2>
          <SummaryChart
            critical={result.critical_count}
            high={result.high_count}
            medium={result.medium_count}
            low={result.low_count}
          />
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">
            Vulnerabilities
          </h2>
          {sorted.length === 0 ? (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center text-emerald-800">
              No vulnerabilities detected in this specification.
            </p>
          ) : (
            <div className="space-y-4">
              {sorted.map((v, i) => (
                <VulnCard
                  key={`${v.rule_id}-${v.endpoint}-${i}`}
                  vulnerability={v}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function SummaryStats({ result }: { result: AnalysisResult }) {
  const counts: { label: Vulnerability["severity"]; value: number }[] = [
    { label: "Critical", value: result.critical_count },
    { label: "High", value: result.high_count },
    { label: "Medium", value: result.medium_count },
    { label: "Low", value: result.low_count },
  ];

  return (
    <>
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
        <span>
          <strong className="text-slate-900">{result.total_endpoints}</strong>{" "}
          endpoints scanned
        </span>
        <span>
          <strong className="text-slate-900">
            {result.total_vulnerabilities}
          </strong>{" "}
          vulnerabilities found
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {counts.map(({ label, value }) => (
          <span
            key={label}
            className={`rounded-full px-3 py-1 text-sm font-semibold ring-1 ${COUNT_BADGE[label]}`}
          >
            {label}: {value}
          </span>
        ))}
      </div>
    </>
  );
}
