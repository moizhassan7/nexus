import type { DashboardSummary } from "../types";
import { api } from "./api";

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await api.get<DashboardSummary>("/api/dashboard/summary");
  return data;
}
