import { useEffect, useRef, useState } from "react";

interface CameraCaptureProps {
    isOpen : boolean;
    onClose: () => void;
    onCapture: (file:File) => void;
}

export default function CameraCapture({
    isOpen,
    onClose,
    onCapture
}: CameraCaptureProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        const startCamera = async () => {
            try {
                setError(null);

                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment" },
                    audio: false
                });
                streamRef.current = stream;

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                setError("Camera accesss denied. Please allow camera permissions");
            }
        };

        startCamera();

        return () => {
            stopCamera();
        };
    }, [isOpen]);

    const stopCamera = () => {
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    };

    const handleClose = () => {
        stopCamera();
        onClose();
    };

    const takePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if(!video || !canvas) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext("2d");
        if (!context) return;

        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(blob => {
            if(!blob) return;

            const file = new File([blob], `camera-photo-${Date.now()}.jpg`, { type: "image/jpeg" });

            onCapture(file);
            handleClose();
        }, 
        "image/jpeg",
        0.95);
    };

    if (!isOpen) return null;

    return (
        
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-[28px] p-4 shadow-2xl">
                <h2 className="text-xl font-bold text-slate-800 mb-4 text-center">
                    Take a photo
                </h2>

                {error ? (
                    <div className="p-4 text-center text-red-700 font-semibold">
                        {error}
                    </div>
                ) : (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full rounded-[20px] bg-black aspect-[3/4] object-cover"
                    />
                )}

                <canvas ref={canvasRef} className="hidden" />

                <div className="flex gap-3 mt-5">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="flex-1 px-4 py-3 rounded-[18px] bg-slate-200 text-slate-800 font-semibold"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={takePhoto}
                        disabled={!!error}
                        className="flex-1 px-4 py-3 rounded-[18px] text-white font-semibold disabled:opacity-50"
                        style={{
                            background: "linear-gradient(135deg, #5E1E95 0%, #C594EF 100%)",
                        }}
                    >
                        Capture
                    </button>
                </div>
            </div>
        </div>
    );
}