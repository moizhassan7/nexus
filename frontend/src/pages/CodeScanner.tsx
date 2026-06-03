import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CodeInput from "../components/CodeInput";
import LoadingSpinner from "../components/LoadingSpinner";
import { scanCode } from "../services/scanService";

const SAMPLE_VULN = `// Example vulnerable snippet
const apiKey = "sk-live-abc123secretkey999";
const JWT_SECRET = "weak";
const password = "admin123";
const query = "SELECT * FROM users WHERE id = " + userId;
eval(userInput);
localStorage.setItem("authToken", token);
`;

const LANGUAGES = ["javascript", "typescript", "python", "java", "php", "go"];

export default function CodeScanner() {
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(SAMPLE_VULN);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const scan = await scanCode(projectName, language, code);
      navigate(`/scan/results/${scan.id}`);
    } catch {
      setError("Scan failed. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleScan} className="mx-auto max-w-4xl space-y-6">
      {error && <p className="text-red-400">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-slate-400">Project Name</label>
          <input
            className="input-field"
            required
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="my-app"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-400">Language</label>
          <select
            className="input-field"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>
      <CodeInput value={code} onChange={setCode} language={language} />
      <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
        {loading && <LoadingSpinner size="sm" />}
        Run Code Scan
      </button>
    </form>
  );
}
