import { useNavigate } from "react-router-dom";
import backgroundImage from "../../../assets/background.png";
import profileImage from "../../../assets/profilepic.png"; 

export default function TeacherProfilePage() {
  const navigate = useNavigate();

  // Placeholder data for the name of the teacher
  const teacherName = "Mrs. Katerina Borisova";

  const handleLogout = () => {
    // logout logic not applied yet
    console.log("User logged out");
    navigate("/user-role-selection"); 
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center p-4 md:p-8 flex flex-col"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="w-full px-4 md:px-8">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => navigate(-1)}
            className="text-white text-2xl md:text-4xl w-12 h-12 md:w-16 md:h-16 flex items-center justify-center hover:opacity-80 transition"
          >
            ←
          </button>

          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white overflow-hidden shadow-sm">
            <img
              src={profileImage}
              alt="Profile icon"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="border-b border-white opacity-70 mb-8" />

      <div className="flex flex-col items-center flex-1 pb-24">
        <h1 className="text-white text-3xl font-serif mb-10 tracking-wide">
          Profile
        </h1>

        <div className="flex flex-col items-center w-full max-w-sm relative">
          {/* Profile Picture */}
          <div className="w-48 h-56 rounded-[50%] bg-slate-300 overflow-hidden border-2 border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)] mb-6 relative z-10">
            <img 
              src={profileImage} 
              alt="Teacher Profile" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Teacher Name */}
          <h2 className="text-white text-2xl font-serif tracking-wide text-center">
            {teacherName}
          </h2>
        </div>

        <div className="flex-1"></div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="mt-12 px-10 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-sans text-sm tracking-wider uppercase hover:bg-white/20 transition-all shadow-lg active:scale-95"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}