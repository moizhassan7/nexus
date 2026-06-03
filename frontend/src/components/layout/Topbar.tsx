import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Topbar({ title }: { title: string }) {
  const { user, logout } = useAuth();
  return (
    <header className="flex items-center justify-between border-b border-white/10 bg-surface-card/50 px-6 py-4 backdrop-blur">
      <h1 className="text-xl font-semibold text-white">{title}</h1>
      <div className="flex items-center gap-4">
        <Link to="/scan/new" className="btn-primary hidden text-sm sm:inline-flex">
          New Scan
        </Link>
        <div className="text-right">
          <p className="text-sm font-medium text-white">{user?.name}</p>
          <p className="text-xs text-slate-500">{user?.email}</p>
        </div>
        <button type="button" onClick={logout} className="btn-ghost text-sm">
          Logout
        </button>
      </div>
    </header>
  );
}
