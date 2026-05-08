import { useNavigate, useLocation } from "react-router-dom";

export default function CollageEditorPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const videoUrl = location.state?.videoUrl;

  return (
    <div className="flex flex-col items-center justify-center">
      <h2>Collage Editor</h2>

      {videoUrl ? (
        <div className="flex flex-col items-center">
          <h3>Generated Video:</h3>

          <video
            src={videoUrl}
            controls
            className="p-10 w-full max-w-2xl h-auto rounded-lg"
          />

          {/* 🔥 GO TO YOUR PAGE */}
          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() =>
              navigate("/review-export-collage", {
                state: { videoUrl }
              })
            }
          >
            Review & Export
          </button>
        </div>
      ) : (
        <p>No video available.</p>
      )}
    </div>
  );
}