import React, { useEffect } from "react";
import { usePrinterStore } from "../../utils/printerService";

const PrinterStatus: React.FC = () => {
  const { isConnected, connectPrinter, autoConnectPrinter } = usePrinterStore();

  useEffect(() => {
    // Try to auto-connect to the printer when component mounts
    const tryAutoConnect = async () => {
      try {
        await autoConnectPrinter();
      } catch (error) {
        console.error("Auto-connect failed:", error);
      }
    };

    tryAutoConnect();
  }, [autoConnectPrinter]);

  return (
    <div className="flex items-center relative">
      <button
        onClick={connectPrinter}
        className="text-xs flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors focus:outline-none"
      >
        {isConnected ? (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-green-500"
            >
              <path d="M6 9V2h12v7"></path>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <path d="M6 14h12v8H6z"></path>
            </svg>
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-red-500"
            >
              <path d="M6 9V2h12v7"></path>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <path d="M6 14h12v8H6z"></path>
              <line
                x1="3"
                y1="3"
                x2="21"
                y2="21"
                className="text-red-500"
              ></line>
            </svg>
          </>
        )}
      </button>

      {/* {showTooltip && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-gray-800 text-white text-xs rounded-md  z-50 w-max">
          {status}
        </div>
      )} */}
    </div>
  );
};

export default PrinterStatus;
