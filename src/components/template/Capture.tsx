import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-fox-toast";

// Camera configuration constants
const CAMERA_CONFIG = {
  dimensions: {
    width: 1920,
    height: 1080,
  },
  shouldDownloadCapture: false, // Set to true to enable auto-download of captured images
} as const;

interface CameraCaptureProps {
  onCapture?: (dataUrl: string, base64Data: string | null) => void;
  disabled?: boolean;
  className?: string;
  isTrial?: boolean;
}

const Capture: React.FC<CameraCaptureProps> = ({
  onCapture,
  disabled = false,
  className,
  isTrial,
}) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<
    "not-requested" | "granted" | "denied"
  >("not-requested");
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Auto start camera when component mounts
  useEffect(() => {
    if (!capturedImage && !disabled) {
      startCamera();
    }

    // Cleanup on unmount
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Assign stream to video element when stream or cameraActive changes
  useEffect(() => {
    if (cameraActive && videoStream && videoRef.current) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream, cameraActive]);

  // Cleanup video stream on unmount
  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [videoStream]);

  // Request camera permission and start stream
  const startCamera = async () => {
    if (disabled) return;

    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: CAMERA_CONFIG.dimensions.width },
          height: { ideal: CAMERA_CONFIG.dimensions.height },
          facingMode: "environment", // Use back camera if available
        },
      });
      setVideoStream(stream);
      setCameraPermission("granted");
      setCameraActive(true);
    } catch (err: any) {
      setCameraPermission("denied");
      setCameraActive(false);
    } finally {
      setIsCapturing(false);
    }
  };

  // Handle Capture button
  const handleCameraCapture = async () => {
    if (disabled) return;

    if (cameraPermission !== "granted") {
      toast.error("Please enable the camera to capture.")
      await startCamera();
      return;
    }

    setIsCapturing(true);
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Set canvas size to match video dimensions for full resolution
      canvas.width = CAMERA_CONFIG.dimensions.width;
      canvas.height = CAMERA_CONFIG.dimensions.height;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Disable image smoothing for sharper image
        ctx.imageSmoothingEnabled = false;
        ctx.filter = "grayscale(1)";

        // Draw the video to match canvas dimensions (preserving aspect ratio)
        const aspectRatio = video.videoWidth / video.videoHeight;
        let drawWidth = canvas.width;
        let drawHeight = canvas.height;
        let offsetX = 0;
        let offsetY = 0;

        // Ensure we maintain aspect ratio and center the image
        if (aspectRatio > canvas.width / canvas.height) {
          // Video is wider
          drawHeight = canvas.width / aspectRatio;
          offsetY = (canvas.height - drawHeight) / 2;
        } else {
          // Video is taller
          drawWidth = canvas.height * aspectRatio;
          offsetX = (canvas.width - drawWidth) / 2;
        }

        ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);

        // Use PNG format for better quality
        const dataUrl = canvas.toDataURL("image/png", 1.0);
        setCapturedImage(dataUrl);

        // Handle auto-download if enabled
        if (CAMERA_CONFIG.shouldDownloadCapture) {
          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = `capture-${new Date().getTime()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        const base64Data = dataUrl.split(",")[1] || null;

        if (onCapture) onCapture(dataUrl, base64Data);
      }
      // Stop camera after capture
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
        setVideoStream(null);
        setCameraActive(false);
      }
    }
    setIsCapturing(false);
  };

  // Handle Reset
  const handleReset = () => {
    if (disabled) return;

    setCapturedImage(null);
    setCameraActive(false);
    setCameraPermission("not-requested");
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop());
      setVideoStream(null);
    }
    if (onCapture) onCapture("", null);

    // Restart camera after reset
    startCamera();
  };

  // Auto-reset after successful capture
  useEffect(() => {
    if (capturedImage && onCapture) {
      // Wait a brief moment to ensure the capture is processed
      const timer = setTimeout(() => {
        handleReset();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [capturedImage]);

  return (
    <div
      className={`relative w-full h-70 md:h-100 rounded-md border overflow-hidden flex items-center justify-center bg-gray-50 ${
        className || ""
      }`}
    >
      {/* Camera Preview or Captured Image */}
      {cameraActive ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-[85%] object-contain filter grayscale"
          style={{ filter: "grayscale(1)" }}
        />
      ) : capturedImage ? (
        <img
          src={capturedImage}
          alt="Captured"
          className="absolute inset-0 w-full h-full object-contain filter grayscale"
          style={{ filter: "grayscale(1)" }}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#676e6e"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
            <circle cx="12" cy="13" r="3" />
          </svg>
          <span className="mt-2 text-sm">Camera preview will appear here</span>
        </div>
      )}
      {/* Overlay layers */}
      <div className="absolute inset-0 pointer-events-none" />
      {/* Camera Icon */}
      <div className="absolute top-3 left-3 z-10 bg-[#676e6e]/20 rounded-md p-1.5">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#676e6e"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
          <circle cx="12" cy="13" r="3" />
        </svg>
      </div>

      {/* Receipt Number Warning */}
      {/* {!hasReceiptNumber && cameraActive && (
        <div className="absolute top-3 right-3 z-10 bg-red-50 rounded-md p-2 text-red-600 text-sm">
          Please enter receipt number first
        </div>
      )} */}

      {/* Action Buttons */}
      <div className="absolute bottom-2 right-4 z-10 flex gap-2">
        {!isTrial && (
          <button
            className={`${
              disabled || !capturedImage
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50"
            } border px-4 md:px-7 py-2 rounded border-gray-300 transition`}
            onClick={handleReset}
            disabled={disabled}
          >
            Reset
          </button>
        )}
        <button
          className={`${
            disabled
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#676e6e] hover:bg-[#b68849]"
          } text-white px-4 md:px-7 py-2 rounded transition`}
          onClick={handleCameraCapture}
          disabled={disabled || isCapturing}
        >
          {isCapturing ? "Processing..." : cameraActive ? "Capture" : "Capture"}
        </button>
      </div>
      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default Capture;
