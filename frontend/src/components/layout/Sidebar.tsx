import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  PlusCircle, 
  Code2, 
  Hexagon, 
  History, 
  FileText, 
  Settings 
} from "lucide-react";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/scan/new", label: "New Scan", icon: PlusCircle },
  { to: "/scan/code", label: "Code Scanner", icon: Code2 },
  { to: "/scan/api", label: "API Scanner", icon: Hexagon },
  { to: "/history", label: "Scan History", icon: History },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="glass hidden w-56 shrink-0 flex-col border-r border-white/10 md:flex">
      <div className="border-b border-white/10 p-5">
        <NavLink to="/dashboard" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black overflow-hidden shadow-[0_0_10px_rgba(255,106,0,0.3)]">
            <img src="/logo.png" alt="Nexus Logo" className="h-full w-full object-cover mix-blend-lighten" />
          </div>
          <div>
            <p className="font-bold text-white">Nexus</p>
            <p className="text-[10px] text-slate-500">API Platform</p>
          </div>
        </NavLink>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  isActive
                    ? "bg-orange-500/15 text-orange-500"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon className="h-5 w-5 opacity-70" />
              {link.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
