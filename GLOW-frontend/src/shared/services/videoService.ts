import { API_URL } from "./api";

export async function generateVideo(images: FormData): Promise<{ videoUrl: string }> {
    const res = await fetch(`${API_URL}/api/generate-video`, {
        method: "POST",
        body: images,
    });

    if (!res.ok) {
        throw new Error("Failed to generate video");
    }

    const data = await res.json();
    return { videoUrl: data.video_url };
}