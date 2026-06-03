import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface Props {
  title: string;
  description: string;
  to: string;
  icon: string;
}

export default function ScanTypeCard({ title, description, to, icon }: Props) {
  return (
    <Link to={to}>
      <motion.div
        whileHover={{ y: -4 }}
        className="glass group h-full rounded-xl p-6 transition hover:border-orange-500/30"
      >
        <span className="text-3xl">{icon}</span>
        <h3 className="mt-4 text-lg font-semibold text-white group-hover:text-orange-500">
          {title}
        </h3>
        <p className="mt-2 text-sm text-slate-400">{description}</p>
      </motion.div>
    </Link>
  );
}
