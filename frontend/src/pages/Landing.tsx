import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Zap, Lock, PlayCircle, Cpu } from "lucide-react";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";

export default function Landing() {
  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden selection:bg-orange-500/30 selection:text-white">
      {/* Postman inspired glowing background orbs */}
      <div className="pointer-events-none fixed left-0 top-0 -z-10 h-full w-full overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/20 blur-[120px]"></div>
        <div className="absolute right-1/4 top-1/2 h-[500px] w-[500px] -translate-y-1/2 translate-x-1/3 rounded-full bg-orange-600/10 blur-[150px]"></div>
      </div>
      
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 sm:pt-32 sm:pb-40 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-sm font-medium mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              Introducing Nexus API Scanner v2.0
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white mb-6">
              The AI-native <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                Code & API Security Platform
              </span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-zinc-400 leading-relaxed">
              Instantly build, test, and secure your code and APIs. The complete toolchain for modern development teams to discover vulnerabilities before they reach production.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Link 
                to="/scan/api" 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-4 text-base font-bold text-white shadow-[0_0_30px_rgba(255,106,0,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,106,0,0.6)]"
              >
                Start API Scan <ArrowRight className="h-5 w-5" />
              </Link>
              <Link 
                to="/scan/code" 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-base font-bold text-white transition-colors hover:bg-white/10"
              >
                <Cpu className="h-5 w-5" /> Start Code Scan
              </Link>
            </div>
          </motion.div>

          {/* Hero App Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20 relative mx-auto max-w-5xl"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10 top-1/2"></div>
            <div className="rounded-xl border border-white/10 bg-black/50 shadow-2xl overflow-hidden backdrop-blur-xl">
              <div className="flex items-center border-b border-white/10 bg-white/5 px-4 py-3 gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <div className="ml-4 flex-1 text-center text-xs text-zinc-500 font-mono">nexus-scan --target api.production.com</div>
              </div>
              <div className="p-6 sm:p-10 font-mono text-sm text-left relative">
                <div className="absolute top-0 right-0 p-4 opacity-50"><ShieldCheck className="h-24 w-24 text-zinc-800" /></div>
                <p className="text-emerald-400 mb-2">❯ Initializing AI-driven vulnerability analysis...</p>
                <p className="text-zinc-400 mb-2">❯ Target: https://api.production.com</p>
                <p className="text-zinc-400 mb-4">❯ Engine: Nexus Core v2.4</p>
                <div className="space-y-2 mb-6">
                  <p className="text-sky-400">[*] Discovering endpoints... 142 found</p>
                  <p className="text-amber-400">[*] Injecting payload variations... 4,203 tested</p>
                  <p className="text-red-400">[-] Vulnerability Detected: SQL Injection in /api/v1/users?id=</p>
                </div>
                <p className="text-emerald-400 animate-pulse">_</p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Trusted By */}
        <section className="border-y border-white/5 bg-white/[0.01] py-10">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm font-medium text-zinc-500 mb-8 uppercase tracking-widest">Trusted by innovative teams worldwide</p>
            <div className="flex flex-wrap justify-center items-center gap-12 sm:gap-20 opacity-50 hover:opacity-100 transition-all duration-500 mix-blend-screen">
              <img src="/logos/acme_logo.png" alt="Acme Corp" className="object-contain h-10 w-auto grayscale" />
              <img src="/logos/globaltech_logo.png" alt="GlobalTech" className="object-contain h-10 w-auto grayscale" />
              <img src="/logos/devcloud_logo.png" alt="DevCloud" className="object-contain h-10 w-auto grayscale" />
              <img src="/logos/finsecure_logo.png" alt="FinSecure" className="object-contain h-10 w-auto grayscale" />
              <img src="/logos/healthapi_logo.png" alt="HealthAPI" className="object-contain h-10 w-auto grayscale" />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 sm:py-32 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">Built for the modern web</h2>
              <p className="text-zinc-400 text-lg">Nexus is designed to seamlessly integrate into your workflow, providing unparalleled insight and security for your architecture.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-purple-500/20 blur-3xl group-hover:bg-purple-500/30 transition-all"></div>
                <Cpu className="h-10 w-10 text-purple-400 mb-6" />
                <h3 className="text-xl font-bold text-white mb-3">AI-Powered Scanning</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">Our proprietary AI engine learns from your API structure to generate intelligent payloads, discovering edge-case vulnerabilities traditional scanners miss.</p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-500/20 blur-3xl group-hover:bg-orange-500/30 transition-all"></div>
                <Zap className="h-10 w-10 text-orange-400 mb-6" />
                <h3 className="text-xl font-bold text-white mb-3">Lightning Fast</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">Built on a highly concurrent architecture, Nexus can scan massive API surfaces in minutes, not hours. Real-time feedback keeps you moving.</p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/20 blur-3xl group-hover:bg-emerald-500/30 transition-all"></div>
                <Lock className="h-10 w-10 text-emerald-400 mb-6" />
                <h3 className="text-xl font-bold text-white mb-3">Enterprise Security</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">Designed with zero-trust principles. Comprehensive reporting, RBAC, and strict compliance standards built-in for enterprise teams.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-orange-900/20"></div>
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl sm:text-6xl font-bold text-white mb-6">Ready to secure your code & APIs?</h2>
            <p className="text-xl text-zinc-400 mb-10">Join thousands of developers building secure applications with Nexus.</p>
            <Link 
              to="/dashboard" 
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-bold text-black shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.5)]"
            >
              Go to Dashboard <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
