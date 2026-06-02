import { useState } from "react";
import { useNavigate } from "react-router-dom";
import buttonBg from "../../../assets/buttonBg.png";

const classOptions = [
  "5E Class",
  "4A Class",
  "6B Class",
  "3C Class"
];

export default function TeacherDiscoveryPage() {
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState<string>("5E Class");

  const handleViewWork = () => {
    if (!selectedClass) return;
    navigate("/my-videos", {
      state: { selectedClass }
    });
  };

  const handleUploadWork = () => {
    if (!selectedClass) return;
    navigate("/image-upload", {
      state: { selectedClass }
    });
  };

  return (
      
      <div className="mt-5 max-w-md mx-auto px-4 md:px-6 pt-4 pb-36 flex flex-col items-center">
        
        <div className="w-full mb-8 flex flex-col items-center">
          <label className="block text-white/80 text-center text-xs tracking-widest mb-3 font-sans font-medium uppercase">
            Select a class
          </label>

          <div className="relative w-full max-w-xs group cursor-pointer">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-300 group-hover:bg-white/15"></div>

            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="relative w-full appearance-none bg-transparent text-white font-serif text-xl text-center pl-6 pr-12 py-4 outline-none cursor-pointer z-10"
            >
              {classOptions.map((className) => (
                <option key={className} value={className} className="text-slate-900 bg-white">
                  {className}
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

        <div className="w-full grid gap-8">
          <button
            type="button"
            onClick={handleViewWork}
            disabled={!selectedClass}
            className="w-full h-44 rounded-[26px] bg-cover bg-center shadow-lg transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 relative group"
            style={{
              backgroundImage: `url(${buttonBg})`
            }}
          >
            <div className="absolute bottom-4 right-4 bg-indigo-950/50 backdrop-blur-md border border-white/20 rounded-[20px] px-5 py-2.5 shadow-md">
              <span className="text-white text-base font-medium font-sans">
                View your class story
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={handleUploadWork}
            disabled={!selectedClass}
            className="w-full h-44 rounded-[26px] bg-cover bg-center shadow-lg transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 relative group"
            style={{
              backgroundImage: `url(${buttonBg})`
            }}
          >
            <div className="absolute bottom-4 right-4 bg-indigo-950/50 backdrop-blur-md border border-white/20 rounded-[20px] px-5 py-2.5 shadow-md">
              <span className="text-white text-base font-medium font-sans">
                Upload Student Work
              </span>
            </div>
          </button>
        </div>
      </div>
  );
}