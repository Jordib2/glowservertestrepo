import { useEffect, useState } from "react";
import { API_URL } from "../../../shared/services/api";
import { downloadVideo } from "../../../shared/services/videoService";

interface VideoItem {
  id: number;
  collage_id: number;
  video_path: string;
  school_name: string;
  class_name: string;
}

const VIDEOS_PER_PAGE = 4;

export default function StudentCollagesPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    setLoading(true);
    fetch(`${API_URL}/api/student-collages`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setVideos(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.ceil(videos.length / VIDEOS_PER_PAGE);
  const startIdx = (currentPage - 1) * VIDEOS_PER_PAGE;
  const paginatedVideos = videos.slice(startIdx, startIdx + VIDEOS_PER_PAGE);

  return (
    <div className="mt-5 flex flex-col items-center flex-1 pb-24 px-4">
      <h1 className="text-2xl md:text-4xl font-serif text-center mb-10 text-white">
        My Collages
      </h1>

      {loading ? (
        <p className="text-center text-white">Loading...</p>
      ) : videos.length === 0 ? (
        <p className="text-center text-white">Your work has not been featured in any collages yet.</p>
      ) : (
        <>
          <div className="grid gap-6 max-w-4xl mx-auto w-full">
            {paginatedVideos.map((video) => (
              <div
                key={video.id}
                className="rounded-[15px] border-2 border-white/20 backdrop-blur-xl p-3"
                style={{ backgroundColor: "rgba(94, 30, 149, 0.2)" }}
              >
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
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex gap-2 items-center justify-center flex-wrap">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-white rounded-[20px] text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #5E1E95 0%, #C594EF 100%)" }}
              >
                Previous
              </button>
              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-[12px] text-sm font-semibold transition ${
                      currentPage === page ? "text-white" : "text-white/70 hover:text-white"
                    }`}
                    style={{
                      background: currentPage === page ? "linear-gradient(135deg, #5E1E95 0%, #C594EF 100%)" : "transparent",
                      border: currentPage === page ? "none" : "1px solid rgba(255, 255, 255, 0.2)"
                    }}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-white rounded-[20px] text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #5E1E95 0%, #C594EF 100%)" }}
              >
                Next
              </button>
              <span className="text-white/70 text-sm ml-4">
                Page {currentPage} of {totalPages}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}