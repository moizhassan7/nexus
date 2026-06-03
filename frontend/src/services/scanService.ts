import type { Scan } from "../types";
import { api } from "./api";

export async function scanCode(project_name: string, language: string, code: string): Promise<Scan> {
  const { data } = await api.post<Scan>("/api/scans/code", { project_name, language, code });
  return data;
}

export async function scanApi(
  project_name: string,
  url: string,
  scan_depth: string
): Promise<Scan> {
  const { data } = await api.post<Scan>("/api/scans/api", { project_name, url, scan_depth });
  return data;
}

export async function listScans(): Promise<Scan[]> {
  const { data } = await api.get<Scan[]>("/api/scans");
  return data;
}

export async function getScan(id: number): Promise<Scan> {
  const { data } = await api.get<Scan>(`/api/scans/${id}`);
  return data;
}

export async function deleteScan(id: number): Promise<void> {
  await api.delete(`/api/scans/${id}`);
}
