export interface StatusResponse {
  status: string;
}

export interface DBTimeResponse {
  time: string;
}

export const API_URL =
  window.location.hostname === "localhost"
    ? "http://127.0.0.1:8000"
    : "https://glow2026.duckdns.org";

export async function getStatus(): Promise<StatusResponse> {
  const res = await fetch(`${API_URL}/api`);
  if (!res.ok) throw new Error("Failed to fetch status");
  return res.json();
}

export async function getDBTime(): Promise<DBTimeResponse> {
  const res = await fetch(`${API_URL}/api/db`);
  if (!res.ok) throw new Error("Failed to fetch DB time");
  return res.json();
}
