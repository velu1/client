import { useEffect, useState } from "react";
import { usePrinterStore } from "../../../utils/printerService";

interface QrCodePreviewProps {
  isOpen: boolean;
  onClose: () => void;
}

const QrCodePreview = ({ isOpen, onClose }: QrCodePreviewProps) => {
  const { qrPreviewData, setQrPreviewData } = usePrinterStore();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [delimiter, setDelimiter] = useState<string>("|"); // Default delimiter

  useEffect(() => {
    if (qrPreviewData) {
      // Generate QR code using a public API service - fixed size 150x150
      const encodedData = encodeURIComponent(qrPreviewData);
      setQrCodeUrl(
        `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodedData}`
      );

      // Try to detect the delimiter from the content
      const possibleDelimiters = ["|", ",", ";", ":", "-"];
      for (const d of possibleDelimiters) {
        if (qrPreviewData.includes(d)) {
          setDelimiter(d);
          break;
        }
      }
    }
  }, [qrPreviewData]);

  const handleClose = () => {
    setQrPreviewData(null);
    setQrCodeUrl("");
    onClose();
  };

  if (!isOpen || !qrPreviewData) return null;

  // Check if content appears to be delimited
  const hasDelimitedContent = qrPreviewData.includes(delimiter);
  const delimitedItems = hasDelimitedContent
    ? qrPreviewData.split(delimiter)
    : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              QR Code Preview
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                Fixed Size: 150×150
              </span>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* QR Code Image */}
          <div className="flex justify-center border p-2 rounded bg-white">
            {qrCodeUrl && (
              <img
                src={qrCodeUrl}
                alt="QR Code Preview"
                className="w-[150px] h-[150px] object-contain"
              />
            )}
          </div>

          {/* Content Text */}
          <div className="text-sm text-gray-600">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">QR Code Content:</h4>
              <span className="text-xs text-gray-500">
                {qrPreviewData.length} characters
              </span>
            </div>
            <div className="bg-gray-100 p-3 rounded border break-all text-xs font-mono">
              {qrPreviewData}
            </div>
          </div>

          {/* Delimited Content Visualization */}
          {hasDelimitedContent && (
            <div className="text-sm text-gray-600">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Delimited Content:</h4>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                  Delimiter: "{delimiter}"
                </span>
              </div>
              <div className="space-y-1">
                {delimitedItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="bg-green-100 text-green-800 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs">
                      {index + 1}
                    </span>
                    <span className="font-mono text-xs bg-gray-50 px-2 py-1 rounded w-full truncate">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center pt-2">
            <button
              onClick={handleClose}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrCodePreview;
