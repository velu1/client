import React from "react";

interface PrinterConfigPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  printerConfig: any;
  labelData: any;
  qrContent: string;
}

const PrinterConfigPreview: React.FC<PrinterConfigPreviewProps> = ({
  isOpen,
  onClose,
  printerConfig,
  labelData,
  qrContent,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Printer Config & Label Data Preview
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                🔧 Development Mode
              </span>
              <span className="text-xs text-gray-500">
                Environment: {process.env.NODE_ENV || "development"}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Printer Configuration Section */}
          <div className="space-y-4">
            <div>
              <h4 className="text-md font-semibold text-primary mb-3">
                Printer Configuration
              </h4>
              <div className="bg-gray-50 p-4 rounded border">
                {printerConfig ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Status:</span>
                      <span className="text-green-600">✓ Config Loaded</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Print Type:</span>
                      <span className="text-blue-600">
                        {printerConfig.printType || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Delimiter:</span>
                      <span className="bg-yellow-100 px-2 py-1 rounded text-sm">
                        "{printerConfig.delimiter || "N/A"}"
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Invoice Mode:</span>
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          printerConfig.invoice
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {printerConfig.invoice ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Audit:</span>
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          printerConfig.audit
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {printerConfig.audit ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-red-600 font-medium">
                    ❌ Printer Config is NULL
                  </div>
                )}
              </div>
            </div>

            {/* Priority Configuration */}
            {printerConfig?.priority && (
              <div>
                <h4 className="text-md font-semibold text-primary mb-3">
                  Priority Configuration
                </h4>
                <div className="bg-gray-50 p-4 rounded border">
                  <div className="space-y-2">
                    {printerConfig.priority
                      .sort(
                        (a: any, b: any) =>
                          parseInt(a.priority) - parseInt(b.priority)
                      )
                      .map((item: any, index: number) => (
                        <div
                          key={item._id || index}
                          className="flex justify-between items-center"
                        >
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                            Priority {item.priority}
                          </span>
                          <span className="font-medium">{item.value}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Label Data Section */}
          <div className="space-y-4">
            <div>
              <h4 className="text-md font-semibold text-primary mb-3">
                Label Data
              </h4>
              <div className="bg-gray-50 p-4 rounded border">
                <div className="space-y-2">
                  {Object.entries(labelData).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="font-medium capitalize">{key}:</span>
                      <span className="text-gray-700 break-all max-w-48">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Generated QR Content */}
            <div>
              <h4 className="text-md font-semibold text-primary mb-3">
                Generated QR Content
              </h4>
              <div className="bg-gray-50 p-4 rounded border">
                <div className="font-mono text-sm bg-white p-3 rounded border break-all">
                  {qrContent || "No QR content generated"}
                </div>

                {/* QR Preview with Size Constraints */}
                {qrContent && (
                  <div className="mt-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-gray-600">
                        QR Preview:
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                        Fixed Size
                      </span>
                    </div>
                    <div className="border rounded p-2 flex justify-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                          qrContent
                        )}`}
                        alt="QR Preview"
                        className="w-[150px] h-[150px] object-contain"
                      />
                    </div>
                  </div>
                )}

                {/* Delimited Content Visualization */}
                {qrContent &&
                  qrContent.includes(printerConfig?.delimiter || "|") && (
                    <div className="mt-3">
                      <div className="text-xs font-medium text-gray-600 mb-2">
                        Content by Priority (Delimited):
                      </div>
                      <div className="space-y-1 text-xs">
                        {qrContent
                          .split(printerConfig?.delimiter || "|")
                          .map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <span className="bg-green-100 text-green-800 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                                {index + 1}
                              </span>
                              <span className="font-mono bg-gray-100 px-2 py-1 rounded w-full truncate">
                                {item}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Raw Config Data */}
            {printerConfig && (
              <div>
                <h4 className="text-md font-semibold text-primary mb-3">
                  Raw Config Data (JSON)
                </h4>
                <div className="bg-gray-50 p-4 rounded border">
                  <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
                    {JSON.stringify(printerConfig, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrinterConfigPreview;
