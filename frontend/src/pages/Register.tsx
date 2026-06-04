import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { Eye, EyeOff, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const criteria = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "At least one uppercase letter", met: /[A-Z]/.test(password) },
    { label: "At least one lowercase letter", met: /[a-z]/.test(password) },
    { label: "At least one number (0-9)", met: /[0-9]/.test(password) },
    { label: "At least one special character (e.g. !@#$%)", met: /[^A-Za-z0-9]/.test(password) },
  ];

  const strengthScore = criteria.filter((c) => c.met).length;

  const getStrengthText = () => {
    if (!password) return "None";
    if (strengthScore <= 2) return "Weak";
    if (strengthScore === 3) return "Medium";
    if (strengthScore === 4) return "Good";
    return "Strong";
  };

  const getStrengthColor = () => {
    if (!password) return "text-slate-500";
    if (strengthScore <= 2) return "text-red-400";
    if (strengthScore === 3) return "text-yellow-400";
    if (strengthScore === 4) return "text-blue-400";
    return "text-emerald-400";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (strengthScore < 4) {
      setError("Password is too weak. Please meet at least 4 criteria.");
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/dashboard");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        "Registration failed";
      setError(typeof msg === "string" ? msg : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass w-full max-w-md rounded-2xl p-8">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-orange-500">
          ← Nexus
        </Link>
        <h1 className="text-2xl font-bold">Create account</h1>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}
          <div>
            <label className="mb-1 block text-sm text-slate-400">Name</label>
            <input className="input-field" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Email</label>
            <input
              type="email"
              className="input-field"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="input-field pr-10"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Enter a strong password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password strength indicators */}
            {password && (
              <div className="mt-2.5 space-y-1.5">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((index) => {
                    let barColor = "bg-zinc-800";
                    if (index <= strengthScore) {
                      if (strengthScore <= 2) barColor = "bg-red-500";
                      else if (strengthScore === 3) barColor = "bg-yellow-500";
                      else if (strengthScore === 4) barColor = "bg-blue-500";
                      else barColor = "bg-emerald-500";
                    }
                    return (
                      <div
                        key={index}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${barColor}`}
                      />
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Strength:</span>
                  <span className={`font-semibold ${getStrengthColor()}`}>
                    {getStrengthText()}
                  </span>
                </div>
              </div>
            )}

            {/* Password requirements list */}
            <AnimatePresence>
              {(isFocused || password.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-3 overflow-hidden rounded-xl bg-white/5 border border-white/5 p-3.5 space-y-2"
                >
                  <p className="text-xs font-semibold text-slate-400 mb-1">
                    Password requirements:
                  </p>
                  <div className="space-y-1.5">
                    {criteria.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        {item.met ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <div className="h-3.5 w-3.5 rounded-full border border-slate-600 flex items-center justify-center text-[8px] text-slate-500 shrink-0">
                            •
                          </div>
                        )}
                        <span
                          className={`transition-colors duration-200 ${
                            item.met ? "text-slate-300" : "text-slate-500"
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button type="submit" disabled={loading} className="btn-primary flex w-full justify-center gap-2">
            {loading && <LoadingSpinner size="sm" />}
            Register
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">
          Have an account?{" "}
          <Link to="/login" className="text-orange-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

