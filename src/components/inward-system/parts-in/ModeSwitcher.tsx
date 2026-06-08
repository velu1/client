import { useState, useEffect } from "react";
import { Sparkles, PenLine } from "lucide-react";
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

  useEffect(() => {
    const savedMode = localStorage.getItem("partsInMode") as "ai" | "manual" | null;
    if (savedMode && savedMode !== currentMode) onModeChange(savedMode);
  }, []);

  const handleToggle = () => {
    const next = currentMode === "ai" ? "manual" : "ai";
    setPendingMode(next);
    setShowDialog(true);
  };

  const handleConfirm = () => {
    if (pendingMode) {
      localStorage.setItem("partsInMode", pendingMode);
      onModeChange(pendingMode);
    }
    setPendingMode(null);
    setShowDialog(false);
  };

  const isManual = currentMode === "manual";

  return (
    <>
      <div className="flex items-center gap-3">
        {/* AI label */}
        <div className={`flex items-center gap-1.5 transition-opacity ${isManual ? "opacity-35" : "opacity-100"}`}>
          <Sparkles size={13} className="text-[#434a52]" />
          <span className={`text-sm font-semibold ${!isManual ? "text-[#434a52]" : "text-gray-400"}`}>
            AI Capture
          </span>
        </div>

        {/* Toggle pill */}
        <button
          onClick={handleToggle}
          className="relative h-6 w-11 rounded-full transition-colors duration-300 focus:outline-none"
          style={{ background: isManual ? "#434a52" : "#c8cdd2" }}
          aria-label="Switch mode"
        >
          <span
            className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-300"
            style={{ transform: isManual ? "translateX(22px)" : "translateX(4px)" }}
          />
        </button>

        {/* Manual label */}
        <div className={`flex items-center gap-1.5 transition-opacity ${!isManual ? "opacity-35" : "opacity-100"}`}>
          <PenLine size={13} className="text-[#434a52]" />
          <span className={`text-sm font-semibold ${isManual ? "text-[#434a52]" : "text-gray-400"}`}>
            Manual
          </span>
        </div>
      </div>

      {showDialog && (
        <DialogComponent
          isOpen={showDialog}
          onClose={() => { setPendingMode(null); setShowDialog(false); }}
          title="Switch mode"
          subtitle={
            pendingMode === "manual"
              ? "Are you sure you want to switch to manual entry?"
              : "Are you sure you want to switch to AI capture?"
          }
          cancelButtonText="Cancel"
          saveButtonText="Switch"
          onSave={handleConfirm}
        />
      )}
    </>
  );
};

export default ModeSwitcher;
