import profileImage from "../../../assets/profilepic.png"; 
import { useLogout } from "../../../shared/components/Logout";

export default function TeacherProfilePage() {

  const user = sessionStorage.getItem("user");
  const teacherName = user ? JSON.parse(user).name : "Teacher Name";

  const handleLogout = useLogout();

  return (
      <div className="mt-5 flex flex-col items-center flex-1 pb-24">
        <h1 className="text-white text-3xl font-serif mb-10 tracking-wide">
          Profile
        </h1>

        <div className="flex flex-col items-center w-full max-w-sm relative">
          {/* Profile Picture */}
          <div className="w-48 h-56 rounded-[50%] overflow-hidden mb-6 relative z-10">
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
  );
}