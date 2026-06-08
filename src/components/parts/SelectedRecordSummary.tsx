import React from "react";
import { Part } from "../../mock/dummyData";

interface SelectedRecordSummaryProps {
  selectedPart: Part;
  onEditClick: () => void;
}

const SelectedRecordSummary: React.FC<SelectedRecordSummaryProps> = ({
  selectedPart,
  // onEditClick,
}) => {
  if (!selectedPart) return null;

  return (
    <>
      {/* Desktop Devices */}
      <div className="mb-6 p-4 border border-gray-300 rounded-md bg-white shadow-sm hidden md:block">
        <div className="overflow-x-auto" style={{ width: "100%" }}>
          <div style={{ minWidth: "1200px" }}>
            <table className="w-full text-sm table-fixed">
              <thead>
                <tr className="bg-primary/20">
                  <th className="px-4 py-2 text-left font-medium text-[#C29B6C] w-[120px]">
                    Unique ID
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-[#C29B6C] w-[120px]">
                    Part number
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-[#C29B6C] w-[100px]">
                    Quantity
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-[#C29B6C] w-[190px]">
                    Lot number
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-[#C29B6C] w-[150px]">
                    Date of manufacturer
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-[#C29B6C] w-[130px]">
                    Date of receipt
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-[#C29B6C] w-[130px]">
                    Receipt number
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-[#C29B6C] w-[120px]">
                    Manufacturer
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-[#C29B6C] w-[120px]">
                    Part description
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-[#C29B6C] w-[120px]">
                    Part location
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-[#C29B6C] w-[100px]">
                    Internal PN
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-4 py-2">
                    {selectedPart.uniqueId || "N/A"}
                  </td>
                  <td className="border px-4 py-2">
                    {selectedPart.partNumber || "N/A"}
                  </td>
                  <td className="border px-4 py-2">
                    {selectedPart.quantity || "N/A"}
                  </td>
                  <td className="border px-4 py-2">
                    {selectedPart.lotNumber && selectedPart.lotNumber.length > 0
                      ? selectedPart.lotNumber.join(", ")
                      : "N/A"}
                  </td>
                  <td className="border px-4 py-2">
                    {selectedPart.manufactureDate
                      ? new Date(
                          selectedPart.manufactureDate
                        ).toLocaleDateString()
                      : selectedPart.mfgDate
                      ? new Date(selectedPart.mfgDate).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="border px-4 py-2">
                    {selectedPart.dateOfReceipt
                      ? new Date(
                          selectedPart.dateOfReceipt
                        ).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="border px-4 py-2">
                    {selectedPart.receiptNumber || "N/A"}
                  </td>
                  <td className="border px-4 py-2">
                    {selectedPart.manufacturer || "N/A"}
                  </td>
                  <td className="border px-4 py-2">
                    {selectedPart.description || "N/A"}
                  </td>
                  <td className="border px-4 py-2">
                    {selectedPart.partLocation || "N/A"}
                  </td>
                  <td className="border px-4 py-2">
                    {selectedPart.internalPartNo || "N/A"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mobile Devices */}
      <div className="md:hidden mb-6 p-2 border border-gray-300 rounded-md bg-white shadow-sm max-h-[400px] overflow-y-auto">
        <table className="w-full text-sm">
          <tbody>
            <tr>
              <th className="text-left text-xs text-[#C29B6C] py-2">
                Part number
              </th>
              <td className="py-2 text-xs">
                {selectedPart.partNumber || "N/A"}
              </td>
            </tr>
            <tr>
              <th className="text-left text-[#C29B6C] text-xs py-2">
                Quantity
              </th>
              <td className="py-2 text-xs">{selectedPart.quantity || "N/A"}</td>
            </tr>
            <tr>
              <th className="text-left text-xs text-[#C29B6C] py-2">
                Lot number
              </th>
              <td className="py-2 text-xs">
                {selectedPart.lotNumber?.length > 0
                  ? selectedPart.lotNumber.join(", ")
                  : "N/A"}
              </td>
            </tr>
            <tr>
              <th className="text-left text-xs text-[#C29B6C] py-2">
                Date of manufacturer
              </th>
              <td className="py-2 text-xs">
                {selectedPart.manufactureDate || selectedPart.mfgDate || "N/A"}
              </td>
            </tr>
            <tr>
              <th className="text-left text-xs text-[#C29B6C] py-2">
                Date of receipt
              </th>
              <td className="py-2 text-xs">
                {selectedPart.dateOfReceipt
                  ? new Date(selectedPart.dateOfReceipt).toLocaleDateString()
                  : "N/A"}
              </td>
            </tr>
            <tr>
              <th className="text-left text-xs text-[#C29B6C] py-2">
                Receipt number
              </th>
              <td className="py-2 text-xs">
                {selectedPart.receiptNumber || "N/A"}
              </td>
            </tr>
            <tr>
              <th className="text-left text-xs text-[#C29B6C] py-2">
                Manufacturer
              </th>
              <td className="py-2 text-xs">
                {selectedPart.manufacturer || "N/A"}
              </td>
            </tr>
            <tr>
              <th className="text-left text-xs text-[#C29B6C] py-2">
                Part description
              </th>
              <td className="py-2 text-xs">
                {selectedPart.description || "N/A"}
              </td>
            </tr>
            <tr>
              <th className="text-left text-xs text-[#C29B6C] py-2">
                Part location
              </th>
              <td className="py-2 text-xs">
                {selectedPart.partLocation || "N/A"}
              </td>
            </tr>
            <tr>
              <th className="text-left text-xs text-[#C29B6C] py-2">
                Internal PN
              </th>
              <td className="py-2 text-xs">
                {selectedPart.internalPartNo || "N/A"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default SelectedRecordSummary;
