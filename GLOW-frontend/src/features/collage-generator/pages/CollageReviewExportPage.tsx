import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { downloadVideo } from "../../../shared/services/videoService";
import { getSchools } from "../../../shared/services/schoolService";
import type { School } from "../../../shared/types/School";
import { API_URL } from "../../../shared/services/api";

export default function CollageReviewExportPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const videoUrl = location.state?.videoUrl;
  const videoId = location.state?.videoId;

  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [className, setClassName] = useState("");

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

  const handleExport = async () => {
    if (!selectedSchool || !className) {
      alert("Please select a school and enter a class name");
      return;
    }
    const token = sessionStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/export-info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          video_id: videoId,
          school_name: selectedSchool,
          class_name: className
        })
      });
      if (res.ok) {
        alert("Exported to GLOW!");
        navigate("/my-videos");
      } else {
        alert("Export failed");
      }
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  return (
    <div className="mt-10 w-full px-4 md:px-8">
      <h1 className="text-2xl md:text-4xl font-serif text-center mb-10 text-white">
        Review and export your collage
      </h1>

      {videoUrl ? (
        <div className="max-w-3xl mx-auto">
          <video src={videoUrl} controls className="w-full max-w-xl mx-auto h-auto rounded-lg mb-4" />

          <div className="flex justify-end mb-6">
            <button
              onClick={handleDownload}
              className="px-6 py-3 text-white rounded-[20px] text-base md:text-lg font-semibold hover:opacity-90 transition"
              style={{ background: "linear-gradient(135deg, #5E1E95 0%, #C594EF 100%)" }}
            >
              Download Video
            </button>
          </div>

          <div
            className="rounded-[28px] border border-[#4c1f82] backdrop-blur-xl p-6 mb-6"
            style={{ backgroundColor: "rgba(94, 30, 149, 0.2)" }}
          >
            <div className="grid gap-4 md:grid-cols-[1fr_2fr] items-center mb-4">
              <label className="text-white font-semibold text-sm md:text-base">Choose your school:</label>
              <select
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
                className="w-full rounded-[20px] border border-[#4c1f82] bg-white/90 px-4 py-3 text-slate-800 shadow-sm focus:border-purple-500 focus:outline-none"
              >
                <option value="">Select a school</option>
                {schools.map((school) => {
                  const label = school.school_name || String(school.id || "School");
                  return (
                    <option key={school.id || label} value={label}>{label}</option>
                  );
                })}
              </select>
            </div>

            <div className="flex flex-col gap-2 mb-4">
              <label className="text-white font-semibold text-sm md:text-base">Class name</label>
              <input
                type="text"
                placeholder="Enter class"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full rounded-[20px] border border-[#4c1f82] bg-white/90 px-4 py-3 text-slate-800 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleExport}
              className="px-8 py-3 text-white rounded-[20px] text-base md:text-lg font-semibold hover:opacity-90 transition"
              style={{ background: "linear-gradient(135deg, #5E1E95 0%, #C594EF 100%)" }}
            >
              Export to GLOW
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center text-slate-700">No video available.</p>
      )}

      <button
          onClick={() => navigate("/teacher-profile")}
          className="mt-12 mb-10  px-10 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-sans text-sm tracking-wider uppercase hover:bg-white/20 transition-all shadow-lg active:scale-95"
        >
          Back to Home
        </button>
    </div>
  );
}