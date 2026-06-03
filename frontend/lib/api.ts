const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Vulnerability {
  rule_id: string;
  rule_name: string;
  endpoint: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  description: string;
  fix: string;
}

export interface AnalysisResult {
  analysis_id: string;
  spec_title: string;
  total_endpoints: number;
  total_vulnerabilities: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  vulnerabilities: Vulnerability[];
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail = "Request failed";
    try {
      const body = (await response.json()) as { detail?: string };
      detail = body.detail ?? detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  return response.json() as Promise<T>;
}

export async function analyzeSpec(
  file: File,
  baseUrl?: string
): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append("file", file);
  if (baseUrl) {
    formData.append("base_url", baseUrl);
  }
  const response = await fetch(`${BASE}/analyze/spec`, {
    method: "POST",
    body: formData,
  });
  return handleResponse<AnalysisResult>(response);
}

export async function analyzeUrl(
  specUrl: string,
  baseUrl?: string
): Promise<AnalysisResult> {
  const response = await fetch(`${BASE}/analyze/url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      spec_url: specUrl,
      base_url: baseUrl || null,
    }),
  });
  return handleResponse<AnalysisResult>(response);
}

export async function getResult(id: string): Promise<AnalysisResult> {
  const response = await fetch(`${BASE}/result/${id}`);
  return handleResponse<AnalysisResult>(response);
}
