const styles: Record<string, string> = {
  Critical: "bg-red-500/20 text-red-400 border-red-500/30",
  High: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Info: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

export default function SeverityBadge({ severity }: { severity: string }) {
  return (
    <span
      className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${styles[severity] ?? styles.Info}`}
    >
      {severity}
    </span>
  );
}
