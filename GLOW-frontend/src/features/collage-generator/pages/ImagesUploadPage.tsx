import { useRef, useState } from "react";

export default function ImagesUploadPage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const galleryInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        if (!file) {
            setSelectedFile(null);
            setPreviewUrl(null);
            return;
        }

        setSelectedFile(file);

        const reader = new FileReader();
        reader.onload = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const openGallery = () => {
        galleryInputRef.current?.click();
    };

    return (
        <div>
            <h2>Upload your images</h2>
            <p>Here you can upload the images you want to use for your collage.</p>

            <div style={{ marginBottom: "1.5rem" }}>
                <button type="button" onClick={openGallery} style={{ padding: "0.75rem 1rem" }}>
                    Upload a cutout
                </button>
            </div>

            <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
            />

            {previewUrl && (
                <div style={{ marginTop: "1.5rem" }}>
                    <h3>Preview</h3>
                    <img
                        src={previewUrl}
                        alt="Selected preview"
                        style={{ maxWidth: "100%", height: "auto", borderRadius: "8px" }}
                    />
                </div>
            )}

            {selectedFile && (
                <div style={{ marginTop: "1rem" }}>
                    <p>
                        Selected file: <strong>{selectedFile.name}</strong>
                    </p>
                </div>
            )}
        </div>
    );
}
