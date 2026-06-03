import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/50 backdrop-blur-xl py-12 sm:py-16 mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-1 flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-purple-600 shadow-[0_0_15px_rgba(255,106,0,0.5)]">
                <ShieldAlert className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">Nexus</span>
            </Link>
            <p className="text-sm text-zinc-500 mt-2">
              The AI-native API Platform for securing your modern web architecture.
            </p>
            <p className="text-xs text-zinc-600 mt-4">
              &copy; {new Date().getFullYear()} Nexus Inc. All rights reserved.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Product</h3>
            <ul className="flex flex-col gap-3 text-sm text-zinc-400">
              <li><Link to="/scan/api" className="hover:text-orange-400 transition-colors">API Scanner</Link></li>
              <li><Link to="/" className="hover:text-orange-400 transition-colors">Platform</Link></li>
              <li><Link to="/pricing" className="hover:text-orange-400 transition-colors">Pricing</Link></li>
              <li><Link to="/enterprise" className="hover:text-orange-400 transition-colors">Enterprise</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Use Cases</h3>
            <ul className="flex flex-col gap-3 text-sm text-zinc-400">
              <li><Link to="/" className="hover:text-orange-400 transition-colors">Developers</Link></li>
              <li><Link to="/" className="hover:text-orange-400 transition-colors">QA Teams</Link></li>
              <li><Link to="/" className="hover:text-orange-400 transition-colors">Security Teams</Link></li>
              <li><Link to="/" className="hover:text-orange-400 transition-colors">Compliance</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Resources</h3>
            <ul className="flex flex-col gap-3 text-sm text-zinc-400">
              <li><Link to="/" className="hover:text-orange-400 transition-colors">Documentation</Link></li>
              <li><Link to="/" className="hover:text-orange-400 transition-colors">Blog</Link></li>
              <li><Link to="/" className="hover:text-orange-400 transition-colors">Community</Link></li>
              <li><Link to="/" className="hover:text-orange-400 transition-colors">Status</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Company</h3>
            <ul className="flex flex-col gap-3 text-sm text-zinc-400">
              <li><Link to="/about" className="hover:text-orange-400 transition-colors">About Us</Link></li>
              <li><Link to="/" className="hover:text-orange-400 transition-colors">Careers</Link></li>
              <li><Link to="/" className="hover:text-orange-400 transition-colors">Contact</Link></li>
              <li><Link to="/" className="hover:text-orange-400 transition-colors">Privacy & Terms</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
