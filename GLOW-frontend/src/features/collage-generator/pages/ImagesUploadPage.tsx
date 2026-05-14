import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateVideo } from "../../../shared/services/videoService";
import backgroundImage from "../../../assets/background.png";
import cameraImage from "../../../assets/camera.png";
import profileImage from "../../../assets/profilepic.png";
import CameraCapture from "../../../shared/components/CameraCapture";

interface ImageItem {
  file: File;
  preview: string;
  id: string;
  approved: boolean;
  showReviewModal: boolean;
}

export default function ImagesUploadPage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateMessage, setGenerateMessage] = useState<string | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const navigate = useNavigate();

  const addImageFile = (file: File) => {
    const reader = new FileReader();

    reader.onload = () => {
      const newImage: ImageItem = {
        file,
        preview: reader.result as string,
        id: Date.now().toString() + Math.random(),
        approved: false,
        showReviewModal: false,
      };
      setImages((prev) => [...prev, newImage]);
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(addImageFile);
    event.target.value = "";
  };

  const handleCameraCapture = (file: File) => {
    addImageFile(file);
    setIsCameraOpen(false);
  };

  const openGallery = () => {
    galleryInputRef.current?.click();
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const openReview = (id: string) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, showReviewModal: true } : img))
    );
  };

  const closeReview = (id: string) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, showReviewModal: false } : img))
    );
  };

  const approveImage = (id: string) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, approved: true, showReviewModal: false } : img
      )
    );
  };

  const rejectImage = (id: string) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, approved: false, showReviewModal: false } : img
      )
    );
  };

  const allApproved = images.length > 0 && images.every((img) => img.approved);

  const handleGenerate = async () => {
    if (!allApproved) return;

    setIsGenerating(true);
    setGenerateMessage("Creating collage...");

    try {
      const formData = new FormData();

      images.forEach((image) => {
        formData.append("images", image.file);
      });

      const video_url = await generateVideo(formData);

      setGenerateMessage(`Video generated and stored successfully.`);
      navigate("/collage-editor", { state: { videoUrl: video_url } });

    } catch (error) {
      setGenerateMessage("Failed to generate video. Try again." + error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center p-4 md:p-8"
      style={{ backgroundImage: `url(${backgroundImage})` }}>

      <div className="w-full px-4 md:px-8">
        <div className="flex items-center justify-between mb-3">
          <button className="text-white text-2xl md:text-4xl w-12 h-12 md:w-16 md:h-16 flex items-center justify-center">
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
      <h1 className="text-2xl md:text-4xl font-serif text-center mb-10 text-white">Upload Student Work</h1>
      <div className="max-w-md mx-auto bg-white/90 backdrop-blur-xl rounded-[28px] border border-white/40 shadow-[0_25px_60px_-30px_rgba(0,0,0,0.6)] p-6 text-center">

        <div className="flex justify-center mb-4">
          <button
            type="button"
            onClick={() => setIsCameraOpen(true)}
            className="w-28 h-28 md:w-32 md:h-32 rounded-[24px] bg-slate-100 flex items-center justify-center shadow-sm hover:bg-slate-200 transition"
          >
            <img
              src={cameraImage}
              alt="Camera icon"
              className="w-16 h-16 md:w-20 md:h-20 object-contain"
            />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsCameraOpen(true)}
          className="text-lg md:text-xl font-semibold text-slate-700 mb-2 hover:text-purple-800 transition"
        >
          Tap to take a photo
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-slate-300" />
          <span className="text-xs uppercase tracking-[0.2em] text-slate-400">or</span>
          <div className="h-px flex-1 bg-slate-300" />
        </div>

        <button
          type="button"
          onClick={openGallery}
          className="inline-flex items-center justify-center px-8 py-3 bg-slate-100 text-slate-800 font-semibold rounded-full shadow-lg shadow-slate-300/80 hover:bg-slate-300 transition"
        >
          Upload from Gallery
        </button>
      </div>

      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={handleFileChange}
      />


      {images.length > 0 && (
        <div className="mt-8">
          <h5 className="text-lg md:text-xl font-bold text-white mb-6">Your images ({images.length})</h5>
          {images.map((image) => (
            <div
              key={image.id}
              className="p-4 md:p-5 mb-4 md:mb-5 border rounded-lg bg-white shadow-md"
            >
              <div className="p-4 md:p-5 flex justify-center">
                <img
                  src={image.preview}
                  alt={image.file.name}
                  className="h-24 md:h-32 w-auto rounded-lg"
                />
              </div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <p className="font-bold text-sm md:text-base">
                    {image.file.name}
                  </p>
                  {image.approved ? (
                    <span className="text-green-700 text-xs md:text-lg font-bold">
                      ✓ Approved
                    </span>
                  ) : (
                    <span className="text-purple-700 text-sm md:text-lg font-bold">
                      ⏳ Pending review
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openReview(image.id)}
                    className="px-3 py-1 md:px-4 md:py-2 text-white rounded-[20px] text-sm md:text-base font-semibold hover:opacity-90 transition"
                    style={{
                      background: "linear-gradient(135deg, #5E1E95 0%, #C594EF 100%)"
                    }}
                  >
                    Review
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(image.id)}
                    className="px-3 py-1 md:px-4 md:py-2 bg-red-600 text-white rounded-[20px] hover:bg-red-700 text-sm md:text-base font-semibold transition"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {image.showReviewModal && (
                <div className="mt-4 p-6 rounded-[20px] border border-white/30 backdrop-blur-lg" style={{ backgroundColor: "#EBD3FF" }}>
                  <h4 className="text-lg font-bold mb-4 text-gray-800">Quality Checklist</h4>
                  <ul className="list-none pl-0 space-y-2">
                    <li className="font-medium text-gray-800">☐ Good lighting (bright, even, no harsh shadows)</li>
                    <li className="font-medium text-gray-800">☐ High contrast (black shape on white background)</li>
                    <li className="font-medium text-gray-800">☐ Clean edges (sharp, well-defined)</li>
                    <li className="font-medium text-gray-800">☐ Clear silhouette (recognizable, properly centered)</li>
                    <li className="font-medium text-gray-800">☐ No obstructions (nothing cut off or hidden)</li>
                  </ul>
                  <div className="flex gap-2 mt-6 justify-between items-center">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => approveImage(image.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-[15px] hover:bg-green-700 text-sm md:text-base font-semibold transition"
                      >
                        ✓ Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => rejectImage(image.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-[15px] hover:bg-red-700 text-sm md:text-base font-semibold transition"
                      >
                        ✗ Reject
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => closeReview(image.id)}
                      className="px-4 py-2 text-white rounded-[15px] text-sm md:text-base font-semibold transition hover:opacity-90"
                      style={{
                        background: "linear-gradient(135deg, #5E1E95 0%, #C594EF 100%)"
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {allApproved && (
            <div style={{ marginTop: "2rem", textAlign: "center" }}>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                style={{
                  padding: "1.25rem 3rem",
                  background: "linear-gradient(135deg, #5E1E95 0%, #C594EF 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "20px",
                  cursor: isGenerating ? "not-allowed" : "pointer",
                  fontSize: "1.25rem",
                  fontWeight: "600",
                  transition: "opacity 0.2s",
                  opacity: isGenerating ? 0.7 : 1,
                }}
              >
                {isGenerating ? "Generating..." : "Start the magic!"}
              </button>
              <h5 style={{ marginTop: "2rem", color: "white", fontSize: "1rem", fontWeight: "500" }}>Clicking this button will generate a collage video.</h5>
              {generateMessage && (
                <p style={{ marginTop: "1rem", color: "#155724" }}>
                  {generateMessage}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <CameraCapture
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
}