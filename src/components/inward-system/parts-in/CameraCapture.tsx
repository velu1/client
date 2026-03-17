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
  hasReceiptNumber?: boolean;
  isDev?: boolean;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  disabled = false,
  className,
  hasReceiptNumber = false,
  isDev = false,
}) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<
    "not-requested" | "granted" | "denied"
  >("not-requested");
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [frameRate, setFrameRate] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameCountRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

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

  // Frame rate calculation when camera is active and isDev is true
  useEffect(() => {
    if (!cameraActive || !isDev || !videoRef.current) return;

    let animationId: number;

    const calculateFPS = (currentTime: number) => {
      frameCountRef.current++;

      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
      }

      const elapsed = currentTime - lastTimeRef.current;

      // Update FPS every second
      if (elapsed >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / elapsed);
        setFrameRate(fps);
        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }

      animationId = requestAnimationFrame(calculateFPS);
    };

    animationId = requestAnimationFrame(calculateFPS);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      frameCountRef.current = 0;
      lastTimeRef.current = 0;
      setFrameRate(0);
    };
  }, [cameraActive, isDev]);

  // Request camera permission and start stream
  const startCamera = async () => {
    if (disabled) return;

    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: CAMERA_CONFIG.dimensions.width },
          height: { ideal: CAMERA_CONFIG.dimensions.height },
          frameRate: { ideal: 30, max: 30 }, // Fixed to 30 FPS
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
    if (disabled || !hasReceiptNumber) return;

    if (cameraPermission !== "granted") {
      toast.error("Please enable the camera to capture.");
      await startCamera();
      return;
    }

    setIsCapturing(true);
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;

      // 1. Create two canvases - one for original resolution, one for scaled
      const originalCanvas = document.createElement("canvas");
      const scaledCanvas = canvasRef.current;

      // Set original canvas to the exact video dimensions
      originalCanvas.width = video.videoWidth;
      originalCanvas.height = video.videoHeight;

      // Set scaled canvas to the fixed 1920x1080 dimensions
      scaledCanvas.width = CAMERA_CONFIG.dimensions.width;
      scaledCanvas.height = CAMERA_CONFIG.dimensions.height;

      // Get contexts for both canvases
      const originalCtx = originalCanvas.getContext("2d");
      const scaledCtx = scaledCanvas.getContext("2d");

      if (originalCtx && scaledCtx) {
        // Apply grayscale filter to both
        originalCtx.filter = "grayscale(1)";
        scaledCtx.filter = "grayscale(1)";
        scaledCtx.imageSmoothingEnabled = false;

        // Draw full resolution image to original canvas
        originalCtx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

        // Get the full-resolution image data
        const originalDataUrl = originalCanvas.toDataURL("image/png", 1.0);

        // Draw scaled version to the scaled canvas (preserving aspect ratio)
        const aspectRatio = video.videoWidth / video.videoHeight;
        let drawWidth = scaledCanvas.width;
        let drawHeight = scaledCanvas.height;
        let offsetX = 0;
        let offsetY = 0;

        // Ensure we maintain aspect ratio and center the image
        if (aspectRatio > scaledCanvas.width / scaledCanvas.height) {
          // Video is wider
          drawHeight = scaledCanvas.width / aspectRatio;
          offsetY = (scaledCanvas.height - drawHeight) / 2;
        } else {
          // Video is taller
          drawWidth = scaledCanvas.height * aspectRatio;
          offsetX = (scaledCanvas.width - drawWidth) / 2;
        }

        // Clear the canvas and draw the scaled image
        scaledCtx.clearRect(0, 0, scaledCanvas.width, scaledCanvas.height);
        scaledCtx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);

        // Get the scaled image data
        const scaledDataUrl = scaledCanvas.toDataURL("image/png", 1.0);

        // Set the captured image preview to the scaled version
        setCapturedImage(scaledDataUrl);

        // Handle auto-download if enabled - download BOTH images
        if (CAMERA_CONFIG.shouldDownloadCapture) {
          // Download original full-resolution image
          const originalLink = document.createElement("a");
          originalLink.href = originalDataUrl;
          originalLink.download = `capture-original-${video.videoWidth}x${
            video.videoHeight
          }-${new Date().getTime()}.png`;
          document.body.appendChild(originalLink);
          originalLink.click();
          document.body.removeChild(originalLink);

          // Download scaled image
          const scaledLink = document.createElement("a");
          scaledLink.href = scaledDataUrl;
          scaledLink.download = `capture-scaled-1920x1080-${new Date().getTime()}.png`;
          document.body.appendChild(scaledLink);
          scaledLink.click();
          document.body.removeChild(scaledLink);
        }

        // Always send the scaled version to the callback
        const base64Data = scaledDataUrl.split(",")[1] || null;
        if (onCapture) onCapture(scaledDataUrl, base64Data);
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
          className="absolute inset-0 w-full h-full object-contain filter grayscale"
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

      {/* Frame Rate Display (Dev Mode) */}
      {isDev && cameraActive && (
        <div className="absolute top-3 left-16 z-10 bg-green-500/80 text-white rounded-md px-2 py-1 text-sm font-mono">
          {frameRate} FPS
        </div>
      )}

      {/* Receipt Number Warning */}
      {!hasReceiptNumber && cameraActive && (
        <div className="absolute top-3 right-3 z-10 bg-red-50 rounded-md p-2 text-red-600 text-sm">
          Please enter receipt number first
        </div>
      )}

      {/* Action Buttons */}
      <div className="absolute bottom-4 right-4 z-10 flex gap-2">
        <button
          className={`${
            disabled || !hasReceiptNumber
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#676e6e] hover:bg-[#b68849]"
          } text-white px-4 md:px-7 py-2 rounded transition`}
          onClick={handleCameraCapture}
          disabled={disabled || isCapturing || !hasReceiptNumber}
        >
          {isCapturing ? "Processing..." : cameraActive ? "Capture" : "Capture"}
        </button>
        <button
          className={`${
            disabled || !capturedImage
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gray-50"
          } border px-4 md:px-7 py-2 rounded border-gray-300 transition`}
          onClick={handleReset}
          disabled={disabled || !capturedImage || isCapturing}
        >
          Reset
        </button>
      </div>
      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraCapture;
