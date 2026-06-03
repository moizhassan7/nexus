const styles: Record<string, string> = {
  Low: "text-orange-500 border-orange-500/40 bg-orange-500/10",
  Medium: "text-yellow-400 border-yellow-500/40 bg-yellow-500/10",
  High: "text-orange-400 border-orange-500/40 bg-orange-500/10",
  Critical: "text-red-400 border-red-500/40 bg-red-500/10",
};

export default function RiskBadge({ level }: { level: string }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${styles[level] ?? styles.Low}`}
    >
      {level} Risk
    </span>
  );
}
