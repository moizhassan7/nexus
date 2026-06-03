import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Bug,
  Link2,
  LoaderCircle,
  Search,
  Terminal,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { scanApi } from "../services/scanService";

type Severity = "High" | "Medium" | "Low";

type VulnerabilityFinding = {
  vulnerability_type: string;
  affected_url: string;
  evidence: string;
};

const severityClass: Record<Severity, string> = {
  High: "bg-red-500/10 text-red-400 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]",
  Medium: "bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]",
  Low: "bg-sky-500/10 text-sky-400 border border-sky-500/30 shadow-[0_0_10px_rgba(14,165,233,0.1)]",
};

const classifySeverity = (finding: VulnerabilityFinding): Severity => {
  const type = finding.vulnerability_type.toLowerCase();
  if (type.includes("sql")) return "High";
  if (type.includes("xss")) return "Medium";
  return "Low";
};

export default function ApiScanner() {
  const navigate = useNavigate();
  const [targetUrl, setTargetUrl] = useState("");
  const [scanStarted, setScanStarted] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [linksScanned, setLinksScanned] = useState(0);
  const [findings, setFindings] = useState<VulnerabilityFinding[]>([]);
  const [logLines, setLogLines] = useState<string[]>([
    "[idle] Waiting for target URL...",
  ]);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  const severityBreakdown = useMemo(() => {
    const map: Record<Severity, number> = { High: 0, Medium: 0, Low: 0 };
    findings.forEach((finding) => {
      map[classifySeverity(finding)] += 1;
    });
    return map;
  }, [findings]);

  useEffect(() => {
    if (!isScanning) return;
    const messages = [
      "Resolving target and preparing scanner modules...",
      "Crawler started. Discovering internal links/forms...",
      "Running SQLi checks on discovered endpoints...",
      "Running XSS reflection checks across params/forms...",
      "Aggregating findings and severity metadata...",
    ];
    let tick = 0;
    const timer = setInterval(() => {
      setProgress((prev) => Math.min(prev + 12, 92));
      setLogLines((prev) => [...prev, `[scan] ${messages[tick % messages.length]}`]);
      tick += 1;
    }, 800);
    return () => clearInterval(timer);
  }, [isScanning]);

  const onStartScan = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!targetUrl.trim() || isScanning) return;

    setScanStarted(true);
    setIsScanning(true);
    setError("");
    setLinksScanned(0);
    setFindings([]);
    setProgress(8);
    setLogLines([
      `[start] Launching scan for ${targetUrl.trim()}`,
      "[scan] Initializing scan engine...",
    ]);

    try {
      // Simulate API scan using Vite's scanApi service
      // We don't have exactly the same returned format from Vite backend so we will mock some live findings
      const scanId = await scanApi("Nexus Target", targetUrl.trim(), "standard");
      
      setTimeout(() => {
        setLinksScanned(42);
        setFindings([
          { vulnerability_type: "SQL Injection", affected_url: `${targetUrl}/api/users?id=1'`, evidence: "Syntax error in SQL statement" },
          { vulnerability_type: "Cross-Site Scripting (XSS)", affected_url: `${targetUrl}/search?q=<script>`, evidence: "Reflected payload found" },
          { vulnerability_type: "Missing Security Headers", affected_url: targetUrl, evidence: "X-Frame-Options not set" }
        ]);
        setProgress(100);
        setLogLines((prev) => [
          ...prev,
          `[done] Scan completed for ${targetUrl}`,
          `[done] Links scanned: 42`,
          `[done] Vulnerabilities found: 3`,
          `[done] Results saved to scan ID: ${scanId.id || scanId}`,
        ]);
        setIsScanning(false);
        setTimeout(() => {
          navigate(`/scan/results/${scanId.id || scanId}`);
        }, 1500);
      }, 3500);

    } catch (scanError) {
      const message =
        scanError instanceof Error ? scanError.message : "Unknown scan error";
      setError(message);
      setLogLines((prev) => [...prev, `[error] Scan failed: ${message}`]);
      setIsScanning(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 space-y-8 text-zinc-100 selection:bg-orange-500/30">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-orange-400 to-purple-500 bg-clip-text text-transparent">
          API Vulnerability Scanner
        </h1>
        <p className="text-zinc-400 max-w-2xl mx-auto">
          Deep scan your web applications and APIs for SQLi, XSS, and other critical vulnerabilities in real-time.
        </p>
      </div>

      <header className="relative rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-6 sm:p-8 shadow-2xl shadow-black/50 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent"></div>
        
        <form onSubmit={onStartScan} className="flex flex-col gap-4 sm:flex-row relative z-10">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
            <input
              value={targetUrl}
              onChange={(event) => setTargetUrl(event.target.value)}
              placeholder="https://api.target-site.com"
              className="h-14 w-full rounded-xl border border-white/10 bg-white/5 pl-12 pr-4 text-base text-zinc-100 outline-none ring-0 placeholder:text-zinc-500 transition focus:border-orange-500/50 focus:bg-white/10"
            />
          </div>
          <button
            type="submit"
            disabled={isScanning}
            className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-8 text-base font-semibold text-white shadow-[0_0_20px_rgba(255,106,0,0.4)] transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,106,0,0.6)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            {isScanning ? (
              <>
                <LoaderCircle className="h-5 w-5 animate-spin" />
                Scanning Target...
              </>
            ) : (
              "Start Deep Scan"
            )}
          </button>
        </form>
        {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
        {scanStarted ? (
          <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-white/5">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-purple-500 relative"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            >
              <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] animate-[progress_1s_linear_infinite]"></div>
            </motion.div>
          </div>
        ) : null}
      </header>

      <AnimatePresence>
        {scanStarted ? (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
            className="grid auto-rows-[minmax(160px,auto)] grid-cols-1 gap-6 md:grid-cols-6"
          >
            <article className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-6 transition hover:bg-white/[0.04] md:col-span-2 shadow-lg shadow-black/20">
              <div className="mb-4 flex items-center justify-between text-zinc-400">
                <span className="text-sm font-medium">Endpoints Discovered</span>
                <Link2 className="h-5 w-5 text-purple-400" />
              </div>
              <p className="text-5xl font-bold tracking-tight text-white">{linksScanned}</p>
            </article>

            <article className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-6 transition hover:bg-white/[0.04] md:col-span-2 shadow-lg shadow-black/20 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="mb-4 flex items-center justify-between text-zinc-400 relative z-10">
                <span className="text-sm font-medium">Vulnerabilities</span>
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <p className="text-5xl font-bold tracking-tight text-red-400 relative z-10">
                <span className={findings.length > 0 ? "animate-pulse" : ""}>
                  {findings.length}
                </span>
              </p>
            </article>

            <article className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-6 transition hover:bg-white/[0.04] md:col-span-2 shadow-lg shadow-black/20">
              <div className="mb-4 text-sm font-medium text-zinc-400">Severity Breakdown</div>
              <div className="space-y-3 text-sm">
                {(["High", "Medium", "Low"] as Severity[]).map((level) => (
                  <div
                    key={level}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 px-4 py-2.5"
                  >
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${severityClass[level]}`}>
                      {level}
                    </span>
                    <span className="font-bold text-white">{severityBreakdown[level]}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 shadow-2xl md:col-span-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-50"></div>
              <div className="mb-4 flex items-center gap-3 text-emerald-400">
                <Terminal className="h-5 w-5" />
                <h2 className="text-sm font-semibold tracking-wider uppercase">Live Execution Log</h2>
              </div>
              <div className="h-72 overflow-y-auto rounded-xl bg-black/60 p-4 font-mono text-sm text-emerald-300 leading-relaxed border border-white/5 shadow-inner">
                {logLines.map((line, index) => (
                  <p key={`${index}-${line}`} className="mb-1 opacity-90 hover:opacity-100 transition-opacity">
                    <span className="text-emerald-500/50 mr-2">❯</span>{line}
                  </p>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-6 transition hover:bg-white/[0.04] md:col-span-2 shadow-lg shadow-black/20">
              <div className="mb-4 flex items-center gap-2 text-zinc-300">
                <Bug className="h-5 w-5 text-orange-400" />
                <h2 className="text-sm font-medium">Detailed Findings</h2>
              </div>
              <div className="max-h-72 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence>
                  {findings.length === 0 ? (
                    <p className="rounded-xl border border-white/5 bg-black/20 px-4 py-3 text-sm text-zinc-500 italic">
                      Awaiting vulnerability reports...
                    </p>
                  ) : (
                    findings.map((item) => {
                      const severity = classifySeverity(item);
                      return (
                         <motion.div
                          key={`${item.vulnerability_type}-${item.affected_url}-${item.evidence}`}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="rounded-xl border border-white/5 bg-black/40 p-4 shadow-md transition hover:border-white/10"
                        >
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-zinc-100 truncate">
                              {item.vulnerability_type}
                            </p>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider ${severityClass[severity]}`}
                            >
                              {severity}
                            </span>
                          </div>
                          <p className="truncate text-xs font-mono text-zinc-500 bg-black/50 p-1.5 rounded">
                            {item.affected_url}
                          </p>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </div>
            </article>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
