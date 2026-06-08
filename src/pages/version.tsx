import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const VersionPage = () => {
  const version = __APP_VERSION__;
  const lastMergeDate = __LAST_MERGE_DATE__;
  const [count, setCount] = useState(0);

  // Animation for counting up to the version number
  useEffect(() => {
    const versionNumber = parseFloat(version) || 1.0;
    const duration = 2000; // 2 seconds
    const steps = 50;
    const increment = versionNumber / steps;
    let current = 0;

    const timer = setInterval(() => {
      if (current < versionNumber) {
        current += increment;
        setCount(Math.min(current, versionNumber));
      } else {
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [version]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center mb-8"
        >
          <div className="relative w-32 h-32 bg-primary/5 rounded-full flex items-center justify-center">
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-primary/20"
              style={{
                borderRadius: "100%",
              }}
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            <span className="text-4xl font-bold text-primary">
              {count.toFixed(1)}
            </span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-center text-gray-800 mb-8"
        >
          Version Information
        </motion.h1>

        <div className="space-y-6">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="p-4 bg-gray-50 rounded-lg"
          >
            <h2 className="text-sm uppercase text-gray-500 mb-1">
              Current Version
            </h2>
            <p className="text-2xl font-semibold text-primary">{version}</p>
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="p-4 bg-gray-50 rounded-lg"
          >
            <h2 className="text-sm uppercase text-gray-500 mb-1">
              Released on
            </h2>
            <p className="text-2xl font-semibold text-gray-700">
              {lastMergeDate}
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center text-sm text-gray-500"
          >
            <p>Build information and deployment details</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default VersionPage;
