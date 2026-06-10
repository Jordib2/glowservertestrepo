import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { API_URL } from "../../../shared/services/api";
import { downloadVideo } from "../../../shared/services/videoService";

interface VideoItem {
  id: number;
  collage_id: number;
  video_path: string;
  school_name: string;
  class_name: string;
}

export function MyVideosPage() {
  const location = useLocation();
  // Get the selected school / class from the previous page (TeacherDiscoveryPage)
  const schoolName = (location.state as any)?.schoolName || "";
  const className = (location.state as any)?.className || "";

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    // Build query string with optional filters
    const params = new URLSearchParams();
    if (schoolName) params.append("school_name", schoolName);
    if (className) params.append("class_name", className);
    const query = params.toString();

    fetch(`${API_URL}/api/my-videos${query ? "?" + query : ""}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setVideos(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [schoolName, className]);   // re‑fetch when school/class change

  const handleDelete = async (videoId: number) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;

    const token = sessionStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/videos/${videoId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setVideos(prev => prev.filter(v => v.id !== videoId));
      } else {
        alert("Failed to delete video");
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  return (
    <div className="mt-5 flex flex-col items-center flex-1 pb-24">
      <h1 className="text-2xl md:text-4xl font-serif text-center mb-10 text-white">
        My Exported Videos
        {schoolName && ` – ${schoolName}`}
        {className && ` (${className})`}
      </h1>

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
              <div className="flex gap-3 mt-4 justify-end">
                <button
                  onClick={() => downloadVideo(video.video_path)}
                  className="px-4 py-2 text-white rounded-[20px] text-sm font-semibold hover:opacity-90 transition"
                  style={{ background: "linear-gradient(135deg, #5E1E95 0%, #C594EF 100%)" }}
                >
                  Download
                </button>
                <button
                  onClick={() => handleDelete(video.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-[20px] text-sm font-semibold hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}