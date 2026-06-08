import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { usePrinterStore } from "../../../utils/printerService";

const PartsInDetailPage = () => {
  const { id } = useParams();
  const { isConnected, status, printLabel, connectPrinter, printDebugGrid } =
    usePrinterStore();

  const [labelData, setLabelData] = useState({
    uid: id ? `QIK${id}` : "QIK1000006",
    grn: "QIK1",
    batch: "010072362",
    ipin: "601007-2362",
    copies: 1,
  });

  // Update UID when id changes
  useEffect(() => {
    if (id) {
      setLabelData((prev) => ({
        ...prev,
        uid: `QIK${id}`,
      }));
    }
  }, [id]);

  const handlePrintLabel = async () => {
    if (!isConnected) {
      const connected = await connectPrinter();
      if (!connected) return;
    }
    await printLabel(labelData);
  };

  const handleDebugPrint = async () => {
    if (!isConnected) {
      const connected = await connectPrinter();
      if (!connected) return;
    }
    await printDebugGrid();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Parts In Detail Page
      </h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <p className="text-lg mb-4">
          ID: <span className="font-medium">{id}</span>
        </p>

        {/* Additional part details would go here */}
      </div>

      {/* Label Print Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Print Label
        </h2>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Status:{" "}
            <span
              className={`font-medium ${
                isConnected ? "text-green-600" : "text-red-600"
              }`}
            >
              {status}
            </span>
          </p>
        </div>

        {/* Label Preview */}
        <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
          <h3 className="text-md font-semibold mb-3">
            Label Preview (5cm x 2.5cm)
          </h3>
          <div className="mb-2 text-xs text-blue-600">
            Printable Area: 350 dots width × 200 dots height
          </div>
          <div
            className="bg-white border border-gray-300 rounded-md p-2"
            style={{ width: "280px", height: "160px", position: "relative" }}
          >
            {/* UID moved one step lower */}
            <div className="absolute top-6 left-3 text-sm font-bold">
              UID: {labelData.uid}
            </div>

            {/* QR Code moved down */}
            <div className="absolute left-3 top-16 w-16 h-16 bg-gray-200 flex items-center justify-center text-xs border">
              QR
            </div>

            {/* Right side information - all in sequence including I-PIN */}
            <div className="absolute left-24 top-16 text-xs space-y-2">
              <div>GRN: {labelData.grn}</div>
              <div>Batch: {labelData.batch}</div>
              <div>I-PIN: {labelData.ipin}</div>
            </div>

            {/* Coordinate reference */}
            <div className="absolute bottom-1 right-1 text-xs text-gray-400">
              350×200
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            * Perfect layout: UID(15,35), QR(15,65), All text on right(170,65+)
            - GRN, Batch, I-PIN in sequence
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              UID
            </label>
            <input
              type="text"
              value={labelData.uid}
              onChange={(e) =>
                setLabelData({ ...labelData, uid: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GRN
            </label>
            <input
              type="text"
              value={labelData.grn}
              onChange={(e) =>
                setLabelData({ ...labelData, grn: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Batch
            </label>
            <input
              type="text"
              value={labelData.batch}
              onChange={(e) =>
                setLabelData({ ...labelData, batch: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              I-PIN
            </label>
            <input
              type="text"
              value={labelData.ipin}
              onChange={(e) =>
                setLabelData({ ...labelData, ipin: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Copies
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={labelData.copies}
              onChange={(e) =>
                setLabelData({
                  ...labelData,
                  copies: parseInt(e.target.value) || 1,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={connectPrinter}
            className={`px-4 py-2 rounded-md ${
              isConnected
                ? "bg-gray-200 text-gray-700"
                : "bg-blue-600 text-white hover:bg-blue-700"
            } transition-colors`}
            disabled={isConnected}
          >
            {isConnected ? "Connected" : "Connect Printer"}
          </button>

          <button
            onClick={handleDebugPrint}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
            disabled={!isConnected}
          >
            Print Debug Grid
          </button>

          <button
            onClick={handlePrintLabel}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors"
            disabled={!isConnected}
          >
            Print Label
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartsInDetailPage;
