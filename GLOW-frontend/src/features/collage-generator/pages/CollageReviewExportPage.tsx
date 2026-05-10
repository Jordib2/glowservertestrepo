import { useLocation } from "react-router-dom";
import { downloadVideo } from "../../../shared/services/videoService";

export default function CollageReviewExportPage() {
  const location = useLocation();
  const videoUrl = location.state?.videoUrl;

  const handleDownload = async () => {
    if (!videoUrl) return;

    try {
      await downloadVideo(videoUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h2>Review and export your collage</h2>

      {videoUrl ? (
        <>
          <video
            src={videoUrl}
            controls
            className="p-10 w-full max-w-2xl"
          />

          <div className="flex gap-4">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Download Video
            </button>
          </div>
        </>
      ) : (
        <p>No video available.</p>
      )}
    </div>
  );
}