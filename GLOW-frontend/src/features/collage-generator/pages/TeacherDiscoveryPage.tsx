import { useNavigate } from "react-router-dom";
import buttonBg from "../../../assets/buttonBg.png";

export default function TeacherDiscoveryPage() {
  const navigate = useNavigate();

  const handleUploadWork = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      navigate("/guidebook");
    } else {
      navigate("/image-upload");
    }
  };


  return (
    <div className="mt-5 max-w-md mx-auto px-4 md:px-6 pt-4 pb-36 flex flex-col items-center">
      <h1 className="text-3xl md:text-5xl font-serif text-center mb-6 text-white">Create New Tales</h1>
      <div className="w-full grid gap-8">

        <button
          type="button"
          onClick={handleUploadWork}
          className="w-full h-44 rounded-[26px] bg-cover bg-center shadow-lg transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 relative group"
          style={{ backgroundImage: `url(${buttonBg})` }}
        >
          <div className="absolute bottom-4 right-4 bg-indigo-950/50 backdrop-blur-md border border-white/20 rounded-[20px] px-5 py-2.5 shadow-md">
            <span className="text-white text-base font-medium font-sans">
              Upload Student Artwork
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}