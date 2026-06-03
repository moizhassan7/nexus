import { api } from "./api";

export async function downloadReport(scanId: number, projectName: string): Promise<void> {
  const { data } = await api.get(`/api/reports/${scanId}/pdf`, { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([data], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `vulnlens-${projectName.replace(/\s+/g, "-")}-${scanId}.pdf`;
  link.click();
  window.URL.revokeObjectURL(url);
}
