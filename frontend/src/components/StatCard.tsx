import { motion } from "framer-motion";

interface Props {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "emerald" | "cyan";
}

export default function StatCard({ label, value, sub, accent = "emerald" }: Props) {
  const accentClass = accent === "cyan" ? "from-purple-400/20" : "from-orange-500/20";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass rounded-xl p-5 bg-gradient-to-br ${accentClass} to-transparent`}
    >
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-bold text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </motion.div>
  );
}
