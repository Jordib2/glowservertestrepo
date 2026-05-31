import { API_URL } from "./api";

export async function generateVideo(
  images: FormData,
  onProgress: (frame: number, total: number) => void
): Promise<string> {
  
  const res = await fetch(`${API_URL}/api/generate-video`, {
    method: "POST",
    body: images,
  });

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
          resolve(parsed.video_url);
        } else if (parsed.error) {
          es.close();
          reject(new Error(parsed.error));
        } else if (parsed.frame !== undefined) {
          onProgress(parsed.frame, parsed.total);
        }
      } catch {
        // ignore malformed messages
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