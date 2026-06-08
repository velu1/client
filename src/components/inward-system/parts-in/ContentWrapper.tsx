import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ContentWrapperProps {
  mode: "ai" | "manual";
  aiContent: React.ReactNode;
  manualContent: React.ReactNode;
}

const ContentWrapper: React.FC<ContentWrapperProps> = ({
  mode,
  aiContent,
  manualContent,
}) => {
  return (
    <div className="relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ x: mode === "ai" ? -300 : 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: mode === "ai" ? 300 : -300, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
            mass: 0.9,
          }}
          className="w-full"
        >
          {mode === "ai" ? aiContent : manualContent}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ContentWrapper;
