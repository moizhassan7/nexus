export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface Issue {
  id: number;
  title: string;
  severity: string;
  category: string;
  owasp_category: string | null;
  description: string;
  risk_explanation: string;
  evidence: string | null;
  affected_source: string | null;
  line_number: number | null;
  recommendation: string;
  secure_example: string | null;
  developer_friendly_summary: string | null;
  ai_enhanced?: boolean;
  ai_provider: string | null;
}

export interface AiStatus {
  ai_enabled: boolean;
  provider: string;
  model: string | null;
}

export interface Scan {
  id: number;
  project_name: string;
  scan_type: string;
  language: string | null;
  target_url: string | null;
  score: number;
  risk_level: string;
  created_at: string;
  issues?: Issue[];
  issue_count?: number;
}

export interface DashboardSummary {
  total_scans: number;
  average_score: number;
  risk_distribution: Record<string, number>;
  severity_counts: Record<string, number>;
  recent_scans: {
    id: number;
    project_name: string;
    scan_type: string;
    score: number;
    risk_level: string;
    created_at: string;
  }[];
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}
