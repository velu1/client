import React, { useState, useRef, useEffect } from "react";
import { Button } from "../../ui/button";

interface CameraPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64: string | null) => void;
  hasReceiptNumber: boolean;
}

const CameraPopup: React.FC<CameraPopupProps> = ({
  isOpen,
  onClose,
  onCapture,
  hasReceiptNumber = false,
}) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<
    "not-requested" | "granted" | "denied"
  >("not-requested");
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Start camera when popup opens
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      // Clean up camera when popup closes
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
        setVideoStream(null);
        setCameraActive(false);
      }
    }
  }, [isOpen]);

  // Assign stream to video element when stream changes
  useEffect(() => {
    if (videoStream && videoRef.current) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);

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
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 720 },
          height: { ideal: 480 },
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
  const handleCaptureClick = () => {
    if (!hasReceiptNumber) return;

    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Set canvas dimensions to match video but maintain aspect ratio
      const aspectRatio = video.videoWidth / video.videoHeight;
      const targetHeight = 320; // Target height for the image
      const targetWidth = Math.round(targetHeight * aspectRatio);

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Apply grayscale filter
        ctx.filter = "grayscale(1)";
        ctx.drawImage(video, 0, 0, targetWidth, targetHeight);

        // Get base64 data (with data URL prefix for proper formatting)
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        const base64Data = dataUrl.split(",")[1] || null;

        // Send captured data back
        onCapture(base64Data);

        // Close popup
        onClose();
      }
    }
  };

  // Handle Back button
  const handleBack = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Simple blurred background overlay */}
      <div className="absolute inset-0 backdrop-blur-sm bg-white/30"></div>

      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl overflow-hidden relative z-10">
        {/* Camera feed area - simplified */}
        <div className="relative">
          {cameraActive ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-[300px] object-contain filter grayscale"
              style={{ filter: "grayscale(1)" }}
            />
          ) : (
            <div className="w-full h-[300px] flex items-center justify-center bg-gray-50">
              {cameraPermission === "denied" ? (
                <div className="text-center text-gray-800 p-4 rounded-lg">
                  <p>Camera access denied.</p>
                  <p className="text-sm">
                    Please allow camera access in your browser settings.
                  </p>
                </div>
              ) : (
                <div className="text-center text-gray-800 p-4 rounded-lg">
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
                    className="mx-auto mb-2"
                  >
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                    <circle cx="12" cy="13" r="3" />
                  </svg>
                  <span>Initializing camera...</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Information text */}
        <div className="p-4 border-t border-b">
          <div className="flex items-center text-gray-700">
            <div className="bg-amber-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm font-bold">
              i
            </div>
            <p>
              Position the component for the camera to capture the image and
              continue.
            </p>
            {!hasReceiptNumber && (
              <div className="ml-auto px-3 py-1 bg-red-50 text-red-600 text-sm rounded">
                Please enter receipt number first
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="p-4 flex justify-between">
          <Button
            onClick={handleBack}
            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-8 py-1 rounded-sm"
          >
            Back
          </Button>
          <Button
            onClick={handleCaptureClick}
            className={`${
              hasReceiptNumber
                ? "bg-[#676e6e] hover:bg-[#676e6e]/90 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            } px-8 py-1 rounded-sm transition-colors`}
            disabled={!cameraActive || isCapturing || !hasReceiptNumber}
          >
            Continue
          </Button>
        </div>

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default CameraPopup;
