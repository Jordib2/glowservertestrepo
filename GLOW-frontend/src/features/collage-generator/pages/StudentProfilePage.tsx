import { useNavigate } from "react-router-dom";
import profileImage from "../../../assets/profilepic.png"; 
import { logout } from "../../../shared/services/accountService";

export default function StudentProfilePage() {
  const navigate = useNavigate();
  const user = sessionStorage.getItem("user");
  const studentName = user ? JSON.parse(user).name : "Student Name";

  const handleLogout = async () => {
      await logout();
      navigate("/user-role-selection");
  };

  return (
      <div className="mt-5 flex flex-col items-center flex-1 pb-24">
        <h1 className="text-white text-3xl font-serif mb-10 tracking-wide">
          Profile
        </h1>

        <div className="flex flex-col items-center w-full max-w-sm relative">
          {/* Profile Picture */}
          <div className="w-48 h-56 rounded-[50%] overflow-hidden mb-6 relative z-10 bg-white/10 backdrop-blur-sm border border-white/10">
            <img 
              src={profileImage} 
              alt="Student Profile" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Student Name & Hardcoded Class */}
          <h2 className="text-white text-2xl font-serif tracking-wide text-center mb-3">
            {studentName}
          </h2>
          <p className="text-white/80 font-sans text-sm tracking-widest uppercase bg-white/10 px-5 py-2 rounded-full border border-white/20">
            5E Class
          </p>
        </div>
        
        <button
          onClick={handleLogout}
          className="mt-12 px-10 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-sans text-sm tracking-wider uppercase hover:bg-white/20 transition-all shadow-lg active:scale-95"
        >
          Log Out
        </button>
      </div>
  );
}