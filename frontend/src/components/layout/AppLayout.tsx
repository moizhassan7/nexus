import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/scan/new": "New Scan",
  "/scan/code": "Code Scanner",
  "/scan/api": "API Scanner",
  "/history": "Scan History",
  "/settings": "Settings",
  "/reports": "Reports",
};

export default function AppLayout() {
  const { pathname } = useLocation();
  const base = pathname.split("/").slice(0, 2).join("/") || pathname;
  const title =
    pathname.startsWith("/scan/results")
      ? "Scan Results"
      : titles[pathname] ?? titles[base] ?? "Nexus";

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar title={title} />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
