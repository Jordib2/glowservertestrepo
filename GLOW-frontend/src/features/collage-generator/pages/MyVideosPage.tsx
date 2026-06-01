import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../../../assets/background.png";
import profileImage from "../../../assets/profilepic.png";
import { API_URL } from "../../../shared/services/api";

interface VideoItem {
  id: number;
  collage_id: number;
  video_path: string;
  school_name: string;
  class_name: string;
}

export function MyVideosPage() {
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-cover bg-center p-4 md:p-8" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="w-full px-4 md:px-8">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigate("/image-upload")} className="text-white text-2xl md:text-4xl w-12 h-12 md:w-16 md:h-16 flex items-center justify-center">
            ←
          </button>
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white overflow-hidden">
            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
      <div className="border-b border-white opacity-70 mb-8" />
      <h1 className="text-2xl md:text-4xl font-serif text-center mb-10 text-white">My Exported Videos</h1>

      {loading ? (
        <p className="text-center text-white">Loading...</p>
      ) : videos.length === 0 ? (
        <p className="text-center text-white">No videos exported yet.</p>
      ) : (
        <div className="grid gap-6 max-w-4xl mx-auto">
          {videos.map((video) => (
            <div key={video.id} className="rounded-[28px] border border-[#4c1f82] backdrop-blur-xl p-6" style={{ backgroundColor: "rgba(94, 30, 149, 0.2)" }}>
              <video src={video.video_path} controls className="w-full rounded-lg mb-4" />
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