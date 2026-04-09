// src/shared/services/api.ts

export interface StatusResponse {
  status: string;
}

export interface DBTimeResponse {
  time: string;
}

const API_URL = "https://glow2026.duckdns.org";

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

export async function createCollage(collageId: number): Promise<{ id: number }> {
  const res = await fetch(
    `${API_URL}/api/collages?collage_id=${collageId}`,
    { method: "POST" }
  );

  if (!res.ok) throw new Error("Failed to create collage");
  return res.json();
}

export async function getCollages(): Promise<any[]> {
  const res = await fetch(`${API_URL}/api/collages`);
  if (!res.ok) throw new Error("Failed to fetch collages");
  return res.json();
}

export async function createVideo(collageId: number): Promise<{ id: number }> {
  const res = await fetch(
    `${API_URL}/api/videos?collage_id=${collageId}`,
    { method: "POST" }
  );

  if (!res.ok) throw new Error("Failed to create video");
  return res.json();
}

export async function getVideos(collageId: number): Promise<any[]> {
  const res = await fetch(`${API_URL}/api/videos/${collageId}`);
  if (!res.ok) throw new Error("Failed to fetch videos");
  return res.json();
}
