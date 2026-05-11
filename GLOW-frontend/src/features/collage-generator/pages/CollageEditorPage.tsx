import { useNavigate, useLocation } from "react-router-dom";
import backgroundImage from "../../../assets/background.png";
import profileImage from "../../../assets/profilepic.png";

export default function CollageEditorPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const videoUrl = location.state?.videoUrl;

  return (
    <div className="min-h-screen bg-cover bg-center p-4 md:p-8" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="w-full px-4 md:px-8">
        <div className="flex items-center justify-between mb-3">
          <button 
            onClick={() => navigate(-1)}
            className="text-white text-2xl md:text-4xl w-12 h-12 md:w-16 md:h-16 flex items-center justify-center"
          >
            ←
          </button>

          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white overflow-hidden">
            <img
              src={profileImage}
              alt="Profile icon"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
      <div className="border-b border-white opacity-70 mb-8" />

      {/* Title */}
      <h1 className="text-2xl md:text-4xl font-serif text-center mb-10 text-white">Generated Story</h1>

      {videoUrl ? (
        <div className="flex flex-col items-center w-full max-w-3xl mx-auto">
          <video
            src={videoUrl}
            controls
            className="w-full max-w-xl mx-auto h-auto rounded-lg mb-8"
          />

          
          <div className="flex gap-4 mb-6 justify-center w-full">
            <button
              onClick={() =>
                navigate("/review-export-collage", {
                  state: { videoUrl }
                })
              }
              className="px-6 py-3 text-white rounded-[20px] text-base md:text-lg font-semibold hover:opacity-90 transition"
              style={{
                background: "linear-gradient(135deg, #5E1E95 0%, #C594EF 100%)"
              }}
            >
              Export Video
            </button>
            <button
              className="px-6 py-3 text-white rounded-[20px] text-base md:text-lg font-semibold hover:opacity-90 transition"
              style={{
                background: "linear-gradient(135deg, #5E1E95 0%, #C594EF 100%)"
              }}
            >
              Save to History
            </button>
          </div>

          
        </div>
      ) : (
        <p className="text-center text-white">No video available.</p>
      )}
    </div>
  );
}