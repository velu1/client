import React, { useState, useEffect } from "react";
import star from "../../../assets/newIcons/inverdSystem/star.svg";
import DialogComponent from "../../common/DialogComponent";

interface ModeSwitcherProps {
  currentMode: "ai" | "manual";
  onModeChange: (mode: "ai" | "manual") => void;
}

const ModeSwitcher: React.FC<ModeSwitcherProps> = ({
  currentMode,
  onModeChange,
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const [pendingMode, setPendingMode] = useState<"ai" | "manual" | null>(null);

  // Initialize from localStorage when component mounts
  useEffect(() => {
    const savedMode = localStorage.getItem("partsInMode") as
      | "ai"
      | "manual"
      | null;
    if (savedMode && savedMode !== currentMode) {
      onModeChange(savedMode);
    }
  }, []);

  const handleModeClick = (mode: "ai" | "manual") => {
    if (mode !== currentMode) {
      setPendingMode(mode); // store what user clicked
      setShowDialog(true); // open confirmation dialog
    }
  };

  const handleConfirm = () => {
    if (pendingMode) {
      // Save to localStorage
      localStorage.setItem("partsInMode", pendingMode);
      onModeChange(pendingMode);
    }
    setPendingMode(null);
    setShowDialog(false);
  };

  const handleCancel = () => {
    setPendingMode(null);
    setShowDialog(false);
  };

  return (
    <div className="flex w-full rounded-md bg-[#c1c1c1] px-2 p-1">
      {/* Confirmation Dialog */}
      {showDialog && (
        <DialogComponent
          isOpen={showDialog}
          onClose={handleCancel}
          title="Confirmation"
          subtitle={
            pendingMode === "manual"
              ? "Are you sure you want to switch to manual capture"
              : "Are you sure you want to switch to AI capture"
          }
          cancelButtonText="No"
          saveButtonText="Yes"
          onSave={handleConfirm}
        />
      )}

      {/* AI Button */}
      <button
        onClick={() => handleModeClick("ai")}
        className={`w-1/2 text-[11px] md:text-sm py-2 flex justify-center items-center gap-3 rounded-sm transition-all duration-200 ${
          currentMode === "ai"
            ? "bg-primary text-white font-medium"
            : "text-primary"
        }`}
      >
        AI Capture mode <img src={star} alt="img" className="h-5 w-5" />
      </button>

      {/* Manual Button */}
      <button
        onClick={() => handleModeClick("manual")}
        className={`w-1/2 text-[11px] md:text-sm py-2 rounded-md text-center transition-all duration-200 ${
          currentMode === "manual"
            ? "bg-primary text-white font-medium"
            : "text-primary"
        }`}
      >
        Manual mode
      </button>
    </div>
  );
};

export default ModeSwitcher;
