import React, { useState, useRef, useEffect } from "react";
import { Camera, RotateCcw } from "lucide-react";
import { toast } from "react-fox-toast";

const CAMERA_CONFIG = {
  dimensions: { width: 1920, height: 1080 },
  shouldDownloadCapture: false,
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

  useEffect(() => {
    if (!capturedImage && !disabled) startCamera();
    return () => {
      if (videoStream) videoStream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    if (cameraActive && videoStream && videoRef.current) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream, cameraActive]);

  useEffect(() => {
    return () => {
      if (videoStream) videoStream.getTracks().forEach((t) => t.stop());
    };
  }, [videoStream]);

  useEffect(() => {
    if (!cameraActive || !isDev || !videoRef.current) return;
    let animationId: number;
    const calculateFPS = (currentTime: number) => {
      frameCountRef.current++;
      if (lastTimeRef.current === 0) lastTimeRef.current = currentTime;
      const elapsed = currentTime - lastTimeRef.current;
      if (elapsed >= 1000) {
        setFrameRate(Math.round((frameCountRef.current * 1000) / elapsed));
        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }
      animationId = requestAnimationFrame(calculateFPS);
    };
    animationId = requestAnimationFrame(calculateFPS);
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      frameCountRef.current = 0;
      lastTimeRef.current = 0;
      setFrameRate(0);
    };
  }, [cameraActive, isDev]);

  const startCamera = async () => {
    if (disabled) return;
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: CAMERA_CONFIG.dimensions.width },
          height: { ideal: CAMERA_CONFIG.dimensions.height },
          frameRate: { ideal: 30, max: 30 },
          facingMode: "environment",
        },
      });
      setVideoStream(stream);
      setCameraPermission("granted");
      setCameraActive(true);
    } catch {
      setCameraPermission("denied");
      setCameraActive(false);
    } finally {
      setIsCapturing(false);
    }
  };

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
      const originalCanvas = document.createElement("canvas");
      const scaledCanvas = canvasRef.current;
      originalCanvas.width = video.videoWidth;
      originalCanvas.height = video.videoHeight;
      scaledCanvas.width = CAMERA_CONFIG.dimensions.width;
      scaledCanvas.height = CAMERA_CONFIG.dimensions.height;
      const originalCtx = originalCanvas.getContext("2d");
      const scaledCtx = scaledCanvas.getContext("2d");
      if (originalCtx && scaledCtx) {
        originalCtx.filter = "grayscale(1)";
        scaledCtx.filter = "grayscale(1)";
        scaledCtx.imageSmoothingEnabled = false;
        originalCtx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const originalDataUrl = originalCanvas.toDataURL("image/png", 1.0);
        const aspectRatio = video.videoWidth / video.videoHeight;
        let drawWidth = scaledCanvas.width;
        let drawHeight = scaledCanvas.height;
        let offsetX = 0;
        let offsetY = 0;
        if (aspectRatio > scaledCanvas.width / scaledCanvas.height) {
          drawHeight = scaledCanvas.width / aspectRatio;
          offsetY = (scaledCanvas.height - drawHeight) / 2;
        } else {
          drawWidth = scaledCanvas.height * aspectRatio;
          offsetX = (scaledCanvas.width - drawWidth) / 2;
        }
        scaledCtx.clearRect(0, 0, scaledCanvas.width, scaledCanvas.height);
        scaledCtx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
        const scaledDataUrl = scaledCanvas.toDataURL("image/png", 1.0);
        setCapturedImage(scaledDataUrl);
        if (CAMERA_CONFIG.shouldDownloadCapture) {
          const dl = (href: string, name: string) => {
            const a = document.createElement("a");
            a.href = href;
            a.download = name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          };
          dl(originalDataUrl, `capture-original-${video.videoWidth}x${video.videoHeight}-${Date.now()}.png`);
          dl(scaledDataUrl, `capture-scaled-1920x1080-${Date.now()}.png`);
        }
        const base64Data = scaledDataUrl.split(",")[1] || null;
        if (onCapture) onCapture(scaledDataUrl, base64Data);
      }
      if (videoStream) {
        videoStream.getTracks().forEach((t) => t.stop());
        setVideoStream(null);
        setCameraActive(false);
      }
    }
    setIsCapturing(false);
  };

  const handleReset = () => {
    if (disabled) return;
    setCapturedImage(null);
    setCameraActive(false);
    setCameraPermission("not-requested");
    if (videoStream) {
      videoStream.getTracks().forEach((t) => t.stop());
      setVideoStream(null);
    }
    if (onCapture) onCapture("", null);
    startCamera();
  };

  useEffect(() => {
    if (capturedImage && onCapture) {
      const timer = setTimeout(() => handleReset(), 500);
      return () => clearTimeout(timer);
    }
  }, [capturedImage]);

  const canCapture = !disabled && !isCapturing && hasReceiptNumber;

  return (
    <div
      className={`relative w-full h-70 md:h-100 rounded-xl border border-gray-200 overflow-hidden bg-[#f8f9fa] ${className || ""}`}
    >
      {/* Live feed or captured image */}
      {cameraActive ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-contain"
          style={{ filter: "grayscale(1)" }}
        />
      ) : capturedImage ? (
        <img
          src={capturedImage}
          alt="Captured"
          className="absolute inset-0 w-full h-full object-contain"
          style={{ filter: "grayscale(1)" }}
        />
      ) : (
        /* Empty / idle state */
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          {/* Scan frame */}
          <div className="relative h-24 w-40 md:h-32 md:w-56">
            <span className="absolute top-0 left-0 h-5 w-5 border-t-2 border-l-2 border-[#434a52] rounded-tl-sm" />
            <span className="absolute top-0 right-0 h-5 w-5 border-t-2 border-r-2 border-[#434a52] rounded-tr-sm" />
            <span className="absolute bottom-0 left-0 h-5 w-5 border-b-2 border-l-2 border-[#434a52] rounded-bl-sm" />
            <span className="absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2 border-[#434a52] rounded-br-sm" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Camera size={28} className="text-[#434a52]/40" />
            </div>
          </div>
          <p className="text-xs text-gray-400">
            {cameraPermission === "denied"
              ? "Camera access denied — check browser permissions"
              : "Waiting for camera feed"}
          </p>
        </div>
      )}

      {/* Camera indicator badge */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-2.5 py-1.5 shadow-sm">
        <Camera size={13} className="text-[#434a52]" />
        <span className="text-xs font-medium text-[#434a52]">Live</span>
        {cameraActive && (
          <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
        )}
      </div>

      {/* Dev FPS counter */}
      {isDev && cameraActive && (
        <div className="absolute top-3 left-24 z-10 bg-green-500/80 text-white rounded-lg px-2 py-1 text-xs font-mono">
          {frameRate} FPS
        </div>
      )}

      {/* Receipt number warning */}
      {!hasReceiptNumber && cameraActive && (
        <div className="absolute top-3 right-3 z-10 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
          <p className="text-xs text-amber-700 font-medium">Enter receipt number first</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="absolute bottom-4 right-4 z-10 flex gap-2">
        <button
          onClick={handleReset}
          disabled={disabled || isCapturing}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium border border-gray-300 bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <RotateCcw size={12} />
          Reset
        </button>
        <button
          onClick={handleCameraCapture}
          disabled={!canCapture}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[#434a52] text-white hover:bg-[#676e6e] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Camera size={13} />
          {isCapturing ? "Processing..." : "Capture"}
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraCapture;
