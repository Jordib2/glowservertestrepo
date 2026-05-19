import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateVideo } from "../../../shared/services/videoService";
import backgroundImage from "../../../assets/background.png";
import cameraImage from "../../../assets/camera.png";
import profileImage from "../../../assets/profilepic.png";
import CameraCapture from "../../../shared/components/CameraCapture";
import { validateCutout } from "../../../shared/lib/validateCutout";
import type { ValidationResult } from "../../../shared/lib/validateCutout";

interface ImageItem {
  file: File;
  preview: string;
  id: string;
  validating: boolean;
  validationResult: ValidationResult | null;
}

export default function ImagesUploadPage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateMessage, setGenerateMessage] = useState<string | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const replaceGalleryInputRef = useRef<HTMLInputElement | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  // track which image id is being replaced, null means adding new
  const [replaceTargetId, setReplaceTargetId] = useState<string | null>(null);
  const navigate = useNavigate();

  const processFile = async (file: File, idToReplace?: string) => {
    const reader = new FileReader();

    reader.onload = async () => {
      const id = idToReplace ?? (Date.now().toString() + Math.random());

      const newImage: ImageItem = {
        file,
        preview: reader.result as string,
        id,
        validating: true,
        validationResult: null,
      };

      if (idToReplace) {
        setImages((prev) =>
          prev.map((img) => (img.id === idToReplace ? newImage : img))
        );
      } else {
        setImages((prev) => [...prev, newImage]);
      }

      const result = await validateCutout(file);

      setImages((prev) =>
        prev.map((img) =>
          img.id === id ? { ...img, validating: false, validationResult: result } : img
        )
      );
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => processFile(file));
    event.target.value = "";
  };

  const handleReplaceFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !replaceTargetId) return;
    processFile(file, replaceTargetId);
    setReplaceTargetId(null);
    event.target.value = "";
  };

  const handleCameraCapture = (file: File) => {
    if (replaceTargetId) {
      processFile(file, replaceTargetId);
      setReplaceTargetId(null);
    } else {
      processFile(file);
    }
    setIsCameraOpen(false);
  };

  const openReplaceFlow = (id: string) => {
    setReplaceTargetId(id);
    setTimeout(() => replaceGalleryInputRef.current?.click(), 50);
  };

  const openReplaceCameraFlow = (id: string) => {
    setReplaceTargetId(id);
    setIsCameraOpen(true);
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const allValid =
    images.length > 0 &&
    images.every((img) => !img.validating && img.validationResult?.isValid === true);

  const handleGenerate = async () => {
    if (!allValid) return;
    setIsGenerating(true);
    setGenerateMessage("Creating collage...");
    try {
      const formData = new FormData();
      images.forEach((image) => formData.append("images", image.file));
      const video_url = await generateVideo(formData);
      setGenerateMessage("Video generated and stored successfully.");
      navigate("/collage-editor", { state: { videoUrl: video_url } });
    } catch (error) {
      setGenerateMessage("Failed to generate video. Try again." + error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center p-4 md:p-8"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="w-full px-4 md:px-8">
        <div className="flex items-center justify-between mb-3">
          <button className="text-white text-2xl md:text-4xl w-12 h-12 md:w-16 md:h-16 flex items-center justify-center">
            ←
          </button>
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white overflow-hidden">
            <img src={profileImage} alt="Profile icon" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      <div className="border-b border-white opacity-70 mb-8" />
      <h1 className="text-2xl md:text-4xl font-serif text-center mb-10 text-white">
        Upload Student Work
      </h1>

      <div className="max-w-md mx-auto bg-white/90 backdrop-blur-xl rounded-[28px] border border-white/40 shadow-[0_25px_60px_-30px_rgba(0,0,0,0.6)] p-6 text-center">
        <div className="flex justify-center mb-4">
          <button
            type="button"
            onClick={() => { setReplaceTargetId(null); setIsCameraOpen(true); }}
            className="w-28 h-28 md:w-32 md:h-32 rounded-[24px] bg-slate-100 flex items-center justify-center shadow-sm hover:bg-slate-200 transition"
          >
            <img src={cameraImage} alt="Camera icon" className="w-16 h-16 md:w-20 md:h-20 object-contain" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => { setReplaceTargetId(null); setIsCameraOpen(true); }}
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
          onClick={() => { setReplaceTargetId(null); galleryInputRef.current?.click(); }}
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
      <input
        ref={replaceGalleryInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleReplaceFileChange}
      />

      {images.length > 0 && (
        <div className="mt-8 max-w-md mx-auto">
          <h5 className="text-lg md:text-xl font-bold text-white mb-6">
            Your images ({images.length})
          </h5>

          {images.map((image) => (
            <div
              key={image.id}
              className="p-4 md:p-5 mb-4 md:mb-5 border rounded-[20px] bg-white shadow-md"
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={image.preview}
                  alt={image.file.name}
                  className="h-20 w-20 object-cover rounded-lg flex-shrink-0"
                />
                <p className="font-bold text-md md:text-base text-slate-700 break-all">
                  {image.file.name}
                </p>
              </div>

              {image.validating && (
                <div className="flex items-center gap-2 mb-4 text-slate-500 text-sm">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Checking image quality...
                </div>
              )}

              {!image.validating && image.validationResult && (
                <div
                  className="rounded-[14px] p-4 mb-4"
                  style={{
                    backgroundColor: image.validationResult.isValid ? "#d1fae5" : "#fef3c7",
                    border: `1px solid ${image.validationResult.isValid ? "#6ee7b7" : "#fcd34d"}`,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="font-bold text-sm"
                      style={{ color: image.validationResult.isValid ? "#065f46" : "#92400e" }}
                    >
                      {image.validationResult.isValid 
                        ? "✓ Image looks good!"
                        : "⚠ Image needs attention"}
                    </span>
                    
                  </div>

                  {/* issues + advice */}
                  {image.validationResult.issues.length > 0 && (
                    <ul className="space-y-1 mt-2">
                      {image.validationResult.issues.map((issue, i) => (
                        <li key={i} className="text-xs text-amber-900 flex items-start gap-1">
                          <span className="mt-0.5">•</span>
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                </div>
              )}

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => openReplaceCameraFlow(image.id)}
                  className="px-3 py-1 md:px-4 md:py-2 text-white rounded-[20px] text-sm font-semibold hover:opacity-90 transition"
                  style={{ background: "linear-gradient(135deg, #5E1E95 0%, #C594EF 100%)" }}
                >
                  📷 Replace
                </button>
                <button
                  type="button"
                  onClick={() => openReplaceFlow(image.id)}
                  className="px-3 py-1 md:px-4 md:py-2 bg-slate-200 text-slate-800 rounded-[20px] text-sm font-semibold hover:bg-slate-300 transition"
                >
                  🖼 From Gallery
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(image.id)}
                  className="px-3 py-1 md:px-4 md:py-2 bg-red-600 text-white rounded-[20px] hover:bg-red-700 text-sm font-semibold transition"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          {/* generate button — only when all pass */}
          {allValid && (
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-12 py-5 text-white text-xl font-semibold rounded-[20px] transition"
                style={{
                  background: "linear-gradient(135deg, #5E1E95 0%, #C594EF 100%)",
                  opacity: isGenerating ? 0.7 : 1,
                  cursor: isGenerating ? "not-allowed" : "pointer",
                }}
              >
                {isGenerating ? "Generating..." : "Start the magic!"}
              </button>
              <p className="mt-4 text-white text-sm font-medium">
                Clicking this button will generate a collage video.
              </p>
              {generateMessage && (
                <p className="mt-3 text-green-200 font-medium">{generateMessage}</p>
              )}
            </div>
          )}

          {!allValid && images.some((img) => img.validationResult && !img.validationResult.isValid) && (
            <p className="text-center text-white/80 text-sm mt-4">
              Fix or replace the flagged images to continue.
            </p>
          )}
        </div>
      )}

      <CameraCapture
        isOpen={isCameraOpen}
        onClose={() => { setIsCameraOpen(false); setReplaceTargetId(null); }}
        onCapture={handleCameraCapture}
      />
    </div>
  );
}