const colors: Record<string, string> = {
  Critical: "bg-red-100 text-red-800 border border-red-300",
  High: "bg-orange-100 text-orange-800 border border-orange-300",
  Medium: "bg-yellow-100 text-yellow-800 border border-yellow-300",
  Low: "bg-blue-100 text-blue-800 border border-blue-300",
};

interface SeverityBadgeProps {
  severity: string;
}

export default function SeverityBadge({ severity }: SeverityBadgeProps) {
  const colorClass = colors[severity] ?? "bg-gray-100 text-gray-800 border border-gray-300";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorClass}`}
    >
      {severity}
    </span>
  );
}
