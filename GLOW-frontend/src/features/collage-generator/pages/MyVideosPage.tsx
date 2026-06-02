import { useEffect, useState } from "react";
import { API_URL } from "../../../shared/services/api";

interface VideoItem {
  id: number;
  collage_id: number;
  video_path: string;
  school_name: string;
  class_name: string;
}

export function MyVideosPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    fetch(`${API_URL}/api/my-videos`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setVideos(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mt-5 flex flex-col items-center flex-1 pb-24">
      <h1 className="text-2xl md:text-4xl font-serif text-center mb-10 text-white">My Exported Videos</h1>

      {loading ? (
        <p className="text-center text-white">Loading...</p>
      ) : videos.length === 0 ? (
        <p className="text-center text-white">No videos exported yet.</p>
      ) : (
        <div className="grid gap-6 max-w-4xl mx-auto p-5">
          {videos.map((video) => (
            <div key={video.id} className="rounded-[15px] border-2 border-white/20 backdrop-blur-xl p-3" style={{ backgroundColor: "rgba(94, 30, 149, 0.2)" }}>
              <video src={video.video_path} controls className="w-full rounded-lg mb-3" />
              <div className="text-white space-y-1">
                <p><span className="font-semibold">School:</span> {video.school_name}</p>
                <p><span className="font-semibold">Class:</span> {video.class_name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
  );
}