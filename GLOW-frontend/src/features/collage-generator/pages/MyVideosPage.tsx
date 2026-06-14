import { useEffect, useState } from "react";
import { getSchools } from "../../../shared/services/schoolService";
import type { School } from "../../../shared/types/School";
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

export function MyVideosPage() {
  const [allVideos, setAllVideos] = useState<VideoItem[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [loadingClasses, setLoadingClasses] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch schools on mount
  useEffect(() => {
    getSchools()
      .then(data => setSchools(data))
      .catch(console.error);
  }, []);

  // Fetch all videos on mount
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    fetch(`${API_URL}/api/my-videos`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setAllVideos(data || []);
        setFilteredVideos(data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Fetch classes when school changes
  useEffect(() => {
    if (!selectedSchool) {
      setClasses([]);
      setSelectedClass("");
      return;
    }
    const token = sessionStorage.getItem("token");
    setLoadingClasses(true);
    fetch(`${API_URL}/api/my-classes?school_name=${encodeURIComponent(selectedSchool)}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setClasses(data.classes || []);
        setSelectedClass("");
      })
      .catch(console.error)
      .finally(() => setLoadingClasses(false));
  }, [selectedSchool]);

  // Apply filters when school or class changes
  useEffect(() => {
    let filtered = allVideos;
    if (selectedSchool) {
      filtered = filtered.filter(v => v.school_name === selectedSchool);
    }
    if (selectedClass) {
      filtered = filtered.filter(v => v.class_name === selectedClass);
    }
    setFilteredVideos(filtered);
    setCurrentPage(1);
  }, [selectedSchool, selectedClass, allVideos]);

  const handleClearFilters = () => {
    setSelectedSchool("");
    setSelectedClass("");
    setCurrentPage(1);
  };

  const handleDelete = async (videoId: number) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;

    const token = sessionStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/videos/${videoId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setAllVideos(prev => prev.filter(v => v.id !== videoId));
        setFilteredVideos(prev => prev.filter(v => v.id !== videoId));
      } else {
        alert("Failed to delete video");
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredVideos.length / VIDEOS_PER_PAGE);
  const startIdx = (currentPage - 1) * VIDEOS_PER_PAGE;
  const paginatedVideos = filteredVideos.slice(startIdx, startIdx + VIDEOS_PER_PAGE);

  return (
    <div className="mt-5 flex flex-col items-center flex-1 pb-24 px-4">
      <h1 className="text-2xl md:text-4xl font-serif text-center mb-10 text-white">
        My Exported Videos
      </h1>

      {/* Filter Section */}
      <div className="w-full max-w-2xl mb-8 space-y-4">
        {/* School dropdown */}
        <div className="flex flex-col items-center">
          <label className="block text-white/80 text-center text-xs tracking-widest mb-3 font-sans font-medium uppercase">
            Filter by school
          </label>
          <div className="relative w-full max-w-xs group cursor-pointer">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-300 group-hover:bg-white/15"></div>
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="relative w-full appearance-none bg-transparent text-white font-serif text-sm md:text-base text-center pl-6 pr-12 py-3 outline-none cursor-pointer z-10"
            >
              <option value="">All schools</option>
              {schools.map((s) => (
                <option key={s.id} value={s.school_name} className="text-slate-900 bg-white">
                  {s.school_name}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-10 w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white backdrop-blur-md transition-transform duration-300 group-hover:translate-y-[1px]">
              <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Class dropdown */}
        <div className="flex flex-col items-center">
          <label className="block text-white/80 text-center text-xs tracking-widest mb-3 font-sans font-medium uppercase">
            Filter by class
          </label>
          {!selectedSchool ? (
            <p className="text-white/50 text-sm italic">Select a school first</p>
          ) : loadingClasses ? (
            <p className="text-white/50 text-sm">Loading classes…</p>
          ) : classes.length === 0 ? (
            <p className="text-white/50 text-sm">No classes found</p>
          ) : (
            <div className="relative w-full max-w-xs group cursor-pointer">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-300 group-hover:bg-white/15"></div>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="relative w-full appearance-none bg-transparent text-white font-serif text-sm md:text-base text-center pl-6 pr-12 py-3 outline-none cursor-pointer z-10"
              >
                <option value="">All classes</option>
                {classes.map((cls) => (
                  <option key={cls} value={cls} className="text-slate-900 bg-white">
                    {cls}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-10 w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white backdrop-blur-md transition-transform duration-300 group-hover:translate-y-[1px]">
                <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Clear filters button */}
        {(selectedSchool || selectedClass) && (
          <div className="flex justify-center">
            <button
              onClick={handleClearFilters}
              className="px-6 py-2 text-white rounded-[20px] text-sm font-semibold hover:opacity-90 transition bg-red-600 hover:bg-red-700"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Videos Section */}
      {loading ? (
        <p className="text-center text-white">Loading...</p>
      ) : filteredVideos.length === 0 ? (
        <p className="text-center text-white">No videos exported yet.</p>
      ) : (
        <>
          <div className="grid gap-6 max-w-4xl mx-auto w-full">
            {paginatedVideos.map((video) => (
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

          {/* Pagination */}
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
                      currentPage === page
                        ? "text-white"
                        : "text-white/70 hover:text-white"
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