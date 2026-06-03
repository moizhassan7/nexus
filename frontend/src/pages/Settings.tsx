import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { getAiStatus } from "../services/settingsService";
import type { AiStatus } from "../types";

export default function Settings() {
  const { user } = useAuth();
  const [aiStatus, setAiStatus] = useState<AiStatus | null>(null);
  const [aiLoading, setAiLoading] = useState(true);

  useEffect(() => {
    getAiStatus()
      .then(setAiStatus)
      .catch(() =>
        setAiStatus({ ai_enabled: false, provider: "none", model: null })
      )
      .finally(() => setAiLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="glass rounded-xl p-6">
        <h3 className="font-semibold text-white">Profile</h3>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between border-b border-white/5 pb-2">
            <dt className="text-slate-400">Name</dt>
            <dd>{user?.name}</dd>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <dt className="text-slate-400">Email</dt>
            <dd>{user?.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-400">Member since</dt>
            <dd>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}</dd>
          </div>
        </dl>
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="font-semibold text-white">AI Enhancement</h3>
        {aiLoading ? (
          <div className="mt-4 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <dt className="text-slate-400">Status</dt>
              <dd className={aiStatus?.ai_enabled ? "text-violet-300" : "text-slate-400"}>
                {aiStatus?.ai_enabled ? "Enabled" : "Disabled (rule-based only)"}
              </dd>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <dt className="text-slate-400">Provider</dt>
              <dd className="capitalize">{aiStatus?.provider ?? "none"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Model</dt>
              <dd className="font-mono text-xs">{aiStatus?.model ?? "—"}</dd>
            </div>
          </dl>
        )}
        <p className="mt-4 text-sm leading-relaxed text-slate-400">
          Optional Groq AI can enrich the top severity findings with clearer explanations.
          Scans work fully without AI when no API key is configured on the server.
        </p>
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="font-semibold text-white">Security Disclaimer</h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Nexus performs automated static and passive analysis only. Results may include false
          positives. This tool does not replace professional penetration testing or compliance
          audits. Use findings as guidance for manual review and remediation.
        </p>
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="font-semibold text-white">API Configuration</h3>
        <p className="mt-2 text-sm text-slate-400">
          Backend URL:{" "}
          <code className="text-purple-400">
            {import.meta.env.VITE_API_URL || "(proxy /api)"}
          </code>
        </p>
      </div>
    </div>
  );
}
