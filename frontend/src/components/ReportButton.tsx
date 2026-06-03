import { useState } from "react";
import { downloadReport } from "../services/reportService";
import LoadingSpinner from "./LoadingSpinner";

interface Props {
  scanId: number;
  projectName: string;
}

export default function ReportButton({ scanId, projectName }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      await downloadReport(scanId, projectName);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button type="button" onClick={handleDownload} disabled={loading} className="btn-ghost flex items-center gap-2">
      {loading ? <LoadingSpinner size="sm" /> : "📄"}
      Download PDF Report
    </button>
  );
}
