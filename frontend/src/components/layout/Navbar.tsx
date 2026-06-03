import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black hover:scale-110 transition-all overflow-hidden">
              <img src="/logo.png" alt="Nexus Logo" className="h-full w-full object-cover mix-blend-lighten" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">Nexus</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
            <Link to="/" className="hover:text-white transition-colors">Product</Link>
            <Link to="/about" className="hover:text-white transition-colors">About</Link>
            <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link to="/scan/api" className="hover:text-white transition-colors">Scanner</Link>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link to="/contact" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Contact Sales
          </Link>
          <Link to="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link
            to="/scan/api"
            className="rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-2 text-sm font-semibold text-white shadow-[0_0_15px_rgba(255,106,0,0.3)] transition-all hover:shadow-[0_0_25px_rgba(255,106,0,0.5)] hover:scale-105"
          >
            Start free trial
          </Link>
        </div>

        <button
          className="md:hidden text-zinc-400 hover:text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/5 bg-black/90 backdrop-blur-xl"
          >
            <div className="flex flex-col px-4 py-4 space-y-4">
              <Link to="/" className="text-sm font-medium text-zinc-400 hover:text-white" onClick={() => setIsOpen(false)}>Product</Link>
              <Link to="/about" className="text-sm font-medium text-zinc-400 hover:text-white" onClick={() => setIsOpen(false)}>About</Link>
              <Link to="/pricing" className="text-sm font-medium text-zinc-400 hover:text-white" onClick={() => setIsOpen(false)}>Pricing</Link>
              <Link to="/scan/api" className="text-sm font-medium text-zinc-400 hover:text-white" onClick={() => setIsOpen(false)}>Scanner</Link>
              <hr className="border-white/5" />
              <Link to="/login" className="text-sm font-medium text-zinc-400 hover:text-white" onClick={() => setIsOpen(false)}>Sign In</Link>
              <Link
                to="/scan/api"
                className="inline-block rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-2 text-center text-sm font-semibold text-white"
                onClick={() => setIsOpen(false)}
              >
                Start free trial
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
