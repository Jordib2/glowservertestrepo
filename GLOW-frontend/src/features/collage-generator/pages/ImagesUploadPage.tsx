import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateVideo } from "../../../shared/services/videoService";

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
  const navigate = useNavigate();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
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
    });

    event.target.value = "";
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
    setGenerateMessage("Failed to generate video. Try again.");
  } finally {
    setIsGenerating(false);
  }
};

  return (
    <div className="mb-5">
      <h2>Begin your story</h2>
      <p className="mt-5">Upload the images you want to use for your collage.</p>

      <div style={{ marginBottom: "1.5rem" }}>
        <button
          type="button"
          onClick={openGallery}
          className="mt-7 bg-gray-100 border p-2 rounded"
        >
          Upload a cutout
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
        <div style={{ marginTop: "2rem" }}>
          <h3>Your images ({images.length})</h3>
          {images.map((image) => (
            <div
              key={image.id}
              className="p-5 mb-5 border rounded-lg"
            >
              <div className="p-5 flex justify-center">
                <img
                  src={image.preview}
                  alt={image.file.name}
                  className="h-30 w-auto rounded-lg"
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <p style={{ margin: 0 }}>
                    <strong>{image.file.name}</strong>
                  </p>
                  {image.approved ? (
                    <span style={{ color: "#28a745", fontSize: "0.9rem" }}>
                      ✓ Approved
                    </span>
                  ) : (
                    <span style={{ color: "#ffc107", fontSize: "0.9rem" }}>
                      ⏳ Pending review
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => openReview(image.id)}
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "#7700ff",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Review
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(image.id)}
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>

              {image.showReviewModal && (
                <div
                  style={{
                    marginTop: "1rem",
                    padding: "1rem",
                    backgroundColor: "#f0f8ff",
                    borderRadius: "8px",
                    border: "1px solid #b0d4ff",
                  }}
                >
                  <h4>Quality Checklist</h4>
                  <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
                    <li style={{ marginBottom: "0.5rem" }}>
                      ☐ Good lighting (bright, even, no harsh shadows)
                    </li>
                    <li style={{ marginBottom: "0.5rem" }}>
                      ☐ High contrast (black shape on white background)
                    </li>
                    <li style={{ marginBottom: "0.5rem" }}>
                      ☐ Clean edges (sharp, well-defined)
                    </li>
                    <li style={{ marginBottom: "0.5rem" }}>
                      ☐ Clear silhouette (recognizable, properly centered)
                    </li>
                    <li style={{ marginBottom: "1rem" }}>
                      ☐ No obstructions (nothing cut off or hidden)
                    </li>
                  </ul>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      type="button"
                      onClick={() => approveImage(image.id)}
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      ✓ Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => rejectImage(image.id)}
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      ✗ Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => closeReview(image.id)}
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
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
                  padding: "0.75rem 2rem",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: isGenerating ? "not-allowed" : "pointer",
                  fontSize: "1rem",
                }}
              >
                {isGenerating ? "Generating..." : "Start the magic!"}
              </button>
              <h5>Clicking this button will generate a collage video.</h5>
              {generateMessage && (
                <p style={{ marginTop: "1rem", color: "#155724" }}>
                  {generateMessage}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}