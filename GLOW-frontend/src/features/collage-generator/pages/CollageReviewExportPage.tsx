import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { downloadVideo } from "../../../shared/services/videoService";
import { getSchools } from "../../../shared/services/schoolService";
import type { School } from "../../../shared/types/School";
import backgroundImage from "../../../assets/background.png";
import profileImage from "../../../assets/profilepic.png";

export default function CollageReviewExportPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const videoUrl = location.state?.videoUrl;

  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>("");

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const schoolList = await getSchools();
        setSchools(schoolList);
      } catch (error) {
        console.error("Error fetching schools:", error);
      }
    };
    fetchSchools();
  }, []);

  const handleDownload = async () => {
    if (!videoUrl) return;

    try {
      await downloadVideo(videoUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center p-4 md:p-8"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
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

      <h1 className="text-2xl md:text-4xl font-serif text-center mb-10 text-white">
        Review and export your collage
      </h1>

      {videoUrl ? (
        <div className="max-w-3xl mx-auto">
          <video
            src={videoUrl}
            controls
            className="w-full max-w-xl mx-auto h-auto rounded-lg mb-4"
          />

          <div className="flex justify-end mb-6">
            <button
              onClick={handleDownload}
              className="px-6 py-3 text-white rounded-[20px] text-base md:text-lg font-semibold hover:opacity-90 transition"
              style={{
                background: "linear-gradient(135deg, #5E1E95 0%, #C594EF 100%)"
              }}
            >
              Download Video
            </button>
          </div>

          <div
            className="rounded-[28px] border border-[#4c1f82] backdrop-blur-xl p-6 mb-6"
            style={{ backgroundColor: "rgba(94, 30, 149, 0.2)" }}
          >
            <div className="grid gap-4 md:grid-cols-[1fr_2fr] items-center mb-4">
              <label className="text-white font-semibold text-sm md:text-base">
                Choose your school:
              </label>
              <select
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
                className="w-full rounded-[20px] border border-[#4c1f82] bg-white/90 px-4 py-3 text-slate-800 shadow-sm focus:border-purple-500 focus:outline-none"
              >
                <option value="">Select a school</option>
                {schools.map((school) => {
                  const label =
                    school.school_name ||
                    String(school.id || "School");
                  return (
                    <option key={school.id || label} value={label}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-white font-semibold text-sm md:text-base">
                  Class name
                </label>
                <input
                  type="text"
                  placeholder="Enter class"
                  className="w-full rounded-[20px] border border-[#4c1f82] bg-white/90 px-4 py-3 text-slate-800 focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-white font-semibold text-sm md:text-base">
                  Teacher name
                </label>
                <input
                  type="text"
                  placeholder="Enter teacher"
                  className="w-full rounded-[20px] border border-[#4c1f82] bg-white/90 px-4 py-3 text-slate-800 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              className="px-8 py-3 text-white rounded-[20px] text-base md:text-lg font-semibold hover:opacity-90 transition"
              style={{
                background: "linear-gradient(135deg, #5E1E95 0%, #C594EF 100%)"
              }}
            >
              Export to GLOW
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center text-slate-700">No video available.</p>
      )}
    </div>
  );
}