import { useNavigate, useLocation } from "react-router-dom";
import { downloadVideo } from "../../../shared/services/videoService";

export default function CollageEditorPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const videoUrl = location.state?.videoUrl;

  const handleDownload = () => {
    if (videoUrl) {
      downloadVideo(videoUrl);
    }
  };

  return (
    <div className="mt-20 w-full px-4 md:px-8">
      {/* Title */}
      <h1 className="text-2xl md:text-4xl font-serif text-center mb-10 text-white">
        Your Tale Awakens
      </h1>

      {videoUrl ? (
        <div className="flex flex-col items-center w-full max-w-3xl mx-auto">
          <video
            src={videoUrl}
            controls
            className="w-full max-w-xl mx-auto h-auto rounded-lg mb-8 shadow-lg"
          />

          <div className="flex gap-4 mb-6 justify-center w-full">
            <button
              onClick={handleDownload}
              className="px-6 py-3 text-white rounded-[20px] text-base md:text-lg font-semibold hover:opacity-90 transition"
              style={{
                background: "linear-gradient(135deg, #5E1E95 0%, #C594EF 100%)"
              }}
            >
              Download
            </button>

            <button
              onClick={() => navigate("/my-videos")}
              className="px-6 py-3 text-white rounded-[20px] text-base md:text-lg font-semibold hover:opacity-90 transition"
              style={{
                background: "linear-gradient(135deg, #5E1E95 0%, #C594EF 100%)"
              }}
            >
              Go to Library
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center text-white">No video available.</p>
      )}

      <button
        onClick={() => navigate("/teacher-profile")}
        className="mt-12 px-10 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-sans text-sm tracking-wider uppercase hover:bg-white/20 transition-all shadow-lg active:scale-95"
      >
        Back to Home
      </button>
    </div>
  );
}
