import { useState } from "react";
import type { Issue } from "../types";
import SeverityBadge from "./SeverityBadge";

export default function IssueCard({ issue }: { issue: Issue }) {
  const [open, setOpen] = useState(false);
  
  // Severity color mapping for a subtle left border glow
  const borderColors: Record<string, string> = {
    Critical: "border-l-red-500",
    High: "border-l-red-500",
    Medium: "border-l-orange-500",
    Low: "border-l-sky-500",
    Info: "border-l-purple-500",
  };
  const borderGlow = borderColors[issue.severity] || "border-l-white/10";

  return (
    <article className={`glass rounded-xl border border-white/5 border-l-4 ${borderGlow} bg-black/40 backdrop-blur-md p-6 transition-all hover:border-r-white/20 hover:bg-black/60 shadow-lg`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <SeverityBadge severity={issue.severity} />
            <span
              className={`rounded-md px-2 py-0.5 text-xs ${
                issue.ai_enhanced === true
                  ? "bg-violet-500/15 text-violet-300"
                  : "bg-white/5 text-slate-500"
              }`}
            >
              {issue.ai_enhanced === true
                ? "Enhanced by Groq AI"
                : "Rule-based recommendation"}
            </span>
            <span className="text-xs text-slate-500">{issue.category}</span>
            {issue.line_number && (
              <span className="font-mono text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                L{issue.line_number}
              </span>
            )}
          </div>
          <h4 className="mt-4 text-xl font-bold text-white tracking-tight leading-snug">{issue.title}</h4>
        </div>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors bg-purple-500/10 hover:bg-purple-500/20 px-4 py-2 rounded-lg border border-purple-500/20"
        >
          {open ? "Less Details" : "View Details"}
        </button>
      </div>
      <p className="mt-4 text-sm text-slate-300 leading-relaxed">{issue.description}</p>
      {issue.developer_friendly_summary && (
        <div className="mt-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-orange-500/5 p-4 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-orange-500"></div>
          <h5 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">Developer Summary</h5>
          <p className="text-sm text-slate-200 leading-relaxed">
            {issue.developer_friendly_summary}
          </p>
        </div>
      )}
      {open && (
        <div className="mt-6 space-y-5 border-t border-white/10 pt-6 text-sm">
          <div>
            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Risk Explanation</h5>
            <p className="text-slate-300 leading-relaxed">{issue.risk_explanation}</p>
          </div>
          {issue.evidence && (
            <div>
              <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Evidence / Context</h5>
              <div className="relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/50 to-transparent"></div>
                <pre className="overflow-x-auto rounded-lg bg-black/60 p-4 font-mono text-xs text-red-300 border border-white/5 shadow-inner leading-relaxed">
                  {issue.evidence}
                </pre>
              </div>
            </div>
          )}
          <div>
            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Recommendation</h5>
            <p className="text-slate-300 leading-relaxed">{issue.recommendation}</p>
          </div>
          {issue.secure_example && (
            <div>
              <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Secure Code Example</h5>
              <div className="relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/50 to-transparent"></div>
                <pre className="overflow-x-auto rounded-lg bg-[#0A0A0A] p-4 font-mono text-xs text-emerald-400 border border-white/5 shadow-inner leading-relaxed">
                  {issue.secure_example}
                </pre>
              </div>
            </div>
          )}
          {issue.owasp_category && (
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
              <span className="text-xs font-medium text-slate-400">OWASP Category:</span>
              <span className="text-xs font-bold text-white">{issue.owasp_category}</span>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
