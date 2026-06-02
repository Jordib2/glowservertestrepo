import { useLocation, useNavigate } from "react-router-dom";

export default function BottomNavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Helper to determine if a tab is active
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-50">
      <div 
        className="flex items-center justify-between px-8 py-3 rounded-[32px] shadow-2xl backdrop-blur-md"
        style={{
          background: "linear-gradient(90deg, rgba(162,112,236,0.85) 0%, rgba(118,52,212,0.85) 50%, rgba(162,112,236,0.85) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.2)"
        }}
      >
        {/* History Button */}
        <button 
          onClick={() => navigate("/review-export-collage")} 
          className={`flex flex-col items-center gap-1 transition-opacity ${isActive("/review-export-collage") ? "opacity-100" : "opacity-60 hover:opacity-100"}`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span className="text-white text-[10px] font-sans tracking-wide">history</span>
        </button>

        {/* Home Button */}
        <button 
          onClick={() => navigate("/teacher_discovery")} 
          className={`flex flex-col items-center gap-1 transition-opacity ${isActive("/teacher_discovery") ? "opacity-100" : "opacity-60 hover:opacity-100"}`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span className="text-white text-[10px] font-sans tracking-wide">home</span>
        </button>

        {/* Profile Button */}
        <button 
          onClick={() => navigate("/teacher-profile")} 
          className={`flex flex-col items-center gap-1 transition-opacity ${isActive("/teacher-profile") ? "opacity-100" : "opacity-60 hover:opacity-100"}`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span className="text-white text-[10px] font-sans tracking-wide">profile</span>
        </button>
      </div>
    </div>
  );
}