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