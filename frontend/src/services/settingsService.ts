import { api } from "./api";
import type { AiStatus } from "../types";

export async function getAiStatus(): Promise<AiStatus> {
  const { data } = await api.get<AiStatus>("/api/settings/ai-status");
  return data;
}
