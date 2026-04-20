import { useLocation } from "react-router-dom";

export default function CollageEditorPage() {
    const location = useLocation();
    const videoUrl = location.state?.videoUrl;

    console.log("Video URL:", videoUrl);

    return (
  <div className="flex flex-col items-center justify-center">
    <h2>Collage Editor</h2>
    {videoUrl ? (
      <div className="flex flex-col items-center">
        <h3>Generated Video:</h3>
        <video
          src={videoUrl}
          controls
          className="p-10 w-full max-w-2xl h-auto rounded-lg"
          onError={(e) => console.error("Video error:", e)}
          onLoadStart={() => console.log("Video load start")}
          onCanPlay={() => console.log("Video can play")}
        />
        <p>Video URL: {videoUrl}</p>
      </div>
    ) : (
      <p>No video available.</p>
    )}
  </div>
);
}