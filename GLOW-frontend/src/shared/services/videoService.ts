import { API_URL } from "./api";

export async function generateVideo(images: FormData): Promise<string> {
    const res = await fetch(`${API_URL}/api/generate-video`, {
        method: "POST",
        body: images,
    });

    if (!res.ok) {
        throw new Error("Failed to generate video");
    }

    const data = await res.json();
    return data.video_url;
}

export async function downloadVideo(videoUrl: string): Promise<void> {
    const response = await fetch(videoUrl);

    if (!response.ok) {
        throw new Error("Failed to download video");
    }

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