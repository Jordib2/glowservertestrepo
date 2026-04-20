import { useLocation } from "react-router-dom";

export default function CollageEditorPage() {
    const location = useLocation();
    const videoUrl = location.state?.videoUrl;

    return (
        <div>
            <h2>Collage Editor</h2>
            
            {videoUrl ? (
                <div>
                    <h3>Generated Video:</h3>
                    <video 
                    src={videoUrl}
                    controls
                    className="w-50 h-auto"
                    />
                </div>
            ) : (
                <p>No video available.</p>
            )}
        </div>
    );
}