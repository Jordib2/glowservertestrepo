import { API_URL } from "./api";

export async function generateVideo(
  images: FormData,
  onProgress: (frame: number, total: number) => void
): Promise<{ video_url: string; video_id: number }> {
  
  const res = await fetch(`${API_URL}/api/generate-video`, {
    headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
    method: "POST",
    body: images,
  });

  if (res.status === 401) {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    window.location.href = "/user-role-selection";
    return { video_url: "", video_id: 0 };
  }

  if (!res.ok) throw new Error("Failed to start video generation");

  const data = await res.json();
  const job_id = data.job_id;

  return new Promise((resolve, reject) => {
    const es = new EventSource(`${API_URL}/api/generate-video/progress/${job_id}`);

    es.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data);
        if (parsed.done) {
          es.close();
          resolve({
            video_url: parsed.video_url,
            video_id: parsed.video_id,   // <-- deze stond er vroeger niet, nu wel
          });
        } else if (parsed.error) {
          es.close();
          reject(new Error(parsed.error));
        } else if (parsed.frame !== undefined) {
          onProgress(parsed.frame, parsed.total);
        }
      } catch {
        console.error("Failed to parse SSE message:", e.data);
      }
    };

    es.onerror = () => {
      es.close();
      reject(new Error("SSE connection lost"));
    };
  });
}

export async function downloadVideo(videoUrl: string): Promise<void> {
  const response = await fetch(videoUrl);
  if (!response.ok) throw new Error("Failed to download video");

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "collage-video.mp4";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}