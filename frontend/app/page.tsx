"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import UploadZone from "@/components/UploadZone";
import { analyzeSpec, analyzeUrl } from "@/lib/api";

type Tab = "upload" | "url";

const LOADING_STEPS = [
  "Parsing spec...",
  "Running OWASP checks...",
  "Generating report...",
];

export default function HomePage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [specUrl, setSpecUrl] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const runWithProgress = useCallback(
    async (fn: () => Promise<{ analysis_id: string }>) => {
      setError(null);
      setLoading(true);
      setLoadingStep(0);
      const interval = setInterval(() => {
        setLoadingStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1));
      }, 1200);
      try {
        const result = await fn();
        router.push(`/report/${result.analysis_id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Analysis failed");
        setLoading(false);
      } finally {
        clearInterval(interval);
      }
    },
    [router]
  );

  const handleAnalyze = () => {
    if (tab === "upload") {
      if (!file) {
        setError("Please select a spec file");
        return;
      }
      void runWithProgress(() =>
        analyzeSpec(file, baseUrl.trim() || undefined)
      );
    } else {
      if (!specUrl.trim()) {
        setError("Please enter a spec URL");
        return;
      }
      void runWithProgress(() =>
        analyzeUrl(specUrl.trim(), baseUrl.trim() || undefined)
      );
    }
  };

  const progress = ((loadingStep + 1) / LOADING_STEPS.length) * 100;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-shield-50">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-2xl px-4 py-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-shield-900">
            SecureShield
          </h1>
          <p className="mt-2 text-slate-600">
            Find security vulnerabilities in your API before attackers do
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-6 flex rounded-xl bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setTab("upload")}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
              tab === "upload"
                ? "bg-shield-600 text-white shadow"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Upload Spec File
          </button>
          <button
            type="button"
            onClick={() => setTab("url")}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
              tab === "url"
                ? "bg-shield-600 text-white shadow"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Paste Spec URL
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
          {tab === "upload" ? (
            <UploadZone onFileSelect={setFile} selectedFile={file} />
          ) : (
            <div>
              <label className="block text-sm font-medium text-slate-700">
                OpenAPI / Swagger spec URL
              </label>
              <input
                type="url"
                value={specUrl}
                onChange={(e) => setSpecUrl(e.target.value)}
                placeholder="https://petstore.swagger.io/v2/swagger.json"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-shield-500 focus:outline-none focus:ring-1 focus:ring-shield-500"
              />
            </div>
          )}

          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700">
              Base URL for live scanning (optional)
            </label>
            <input
              type="url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.example.com"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-shield-500 focus:outline-none focus:ring-1 focus:ring-shield-500"
            />
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          {loading && (
            <div className="mt-4">
              <LoadingBar progress={progress} />
              <p className="mt-2 text-center text-sm text-slate-600">
                {LOADING_STEPS[loadingStep]}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-shield-600 py-3 font-semibold text-white shadow-md transition hover:bg-shield-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Analyzing..." : "Analyze API Security"}
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Try: https://petstore.swagger.io/v2/swagger.json
        </p>
      </div>
    </main>
  );
}

function LoadingBar({ progress }: { progress: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-200">
      <div
        className="h-full rounded-full bg-shield-500 transition-all duration-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
