import { useNavigate } from "react-router-dom";
import buttonBg from "../../../assets/buttonBg.png";

export default function StudentHomePage() {
  const navigate = useNavigate();

  return (
      <div className="mt-5 max-w-md mx-auto px-4 md:px-6 pt-4 pb-36 flex flex-col items-center">
        <h1 className="text-white text-3xl font-serif mb-10 tracking-wide text-center">
          Student Dashboard
        </h1>

        <div className="w-full grid gap-8">
          <button
            type="button"
            onClick={() => navigate("/student-cutout")}
            className="w-full h-44 rounded-[26px] bg-cover bg-center shadow-lg transition-transform hover:scale-[1.02] relative group"
            style={{ backgroundImage: `url(${buttonBg})` }}
          >
            <div className="absolute bottom-4 right-4 bg-indigo-950/50 backdrop-blur-md border border-white/20 rounded-[20px] px-5 py-2.5 shadow-md">
              <span className="text-white text-base font-medium font-sans">
                See Cutout Preview
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate("/student-collages")}
            className="w-full h-44 rounded-[26px] bg-cover bg-center shadow-lg transition-transform hover:scale-[1.02] relative group"
            style={{ backgroundImage: `url(${buttonBg})` }}
          >
            <div className="absolute bottom-4 right-4 bg-indigo-950/50 backdrop-blur-md border border-white/20 rounded-[20px] px-5 py-2.5 shadow-md">
              <span className="text-white text-base font-medium font-sans">
                View My Collages
              </span>
            </div>
          </button>
        </div>
      </div>
  );
}