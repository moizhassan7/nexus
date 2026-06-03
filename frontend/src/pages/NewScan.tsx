import ScanTypeCard from "../components/ScanTypeCard";

export default function NewScan() {
  return (
    <div>
      <p className="mb-8 text-slate-400">Choose a scan type to analyze your project.</p>
      <div className="grid gap-6 md:grid-cols-2">
        <ScanTypeCard
          title="Code Scanner"
          description="Static analysis for secrets, injection, crypto, CORS, cookies, and 15 security rules."
          to="/scan/code"
          icon="</>"
        />
        <ScanTypeCard
          title="API Scanner"
          description="Passive GET-only check: HTTPS, security headers, CORS, and cookie flags."
          to="/scan/api"
          icon="⬡"
        />
      </div>
    </div>
  );
}
