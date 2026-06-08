import React, { useState } from "react";
import { Part } from "../../mock/dummyData";

interface EditableRecordFormProps {
  selectedPart: Part;
  onCancel: () => void;
  onSave: (updatedPart: Part) => void;
}

const EditableRecordForm: React.FC<EditableRecordFormProps> = ({
  selectedPart,
  onCancel,
  onSave,
}) => {
  const [formData, setFormData] = useState<Part>(selectedPart);

  const handleChange = (field: keyof Part, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <>
      {/* Desktop Devices */}
      <div className="mb-6 p-4 border border-gray-300 rounded-md bg-white shadow-sm  md:!block !hidden">
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
                  <th className="px-4 py-2 text-left font-medium text-[#C29B6C] w-[180px]">
                    Lot number
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-[#C29B6C] w-[150px]">
                    Date of manufacturer
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-[#C29B6C] w-[150px]">
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
                  <th className="px-4 py-2 text-left font-medium text-[#C29B6C] w-[120px]">
                    Internal PN
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-4 py-2">
                    <input
                      type="text"
                      value={formData.uniqueId || ""}
                      readOnly
                      className="w-full p-1 border border-gray-300 rounded-sm bg-gray-100"
                    />
                  </td>
                  <td className="border px-4 py-2">
                    <input
                      type="text"
                      value={formData.partNumber || ""}
                      readOnly
                      className="w-full p-1 border border-gray-300 rounded-sm bg-gray-100"
                    />
                  </td>
                  <td className="border px-4 py-2">
                    <input
                      type="number"
                      value={formData.quantity || ""}
                      onChange={(e) =>
                        handleChange("quantity", parseInt(e.target.value))
                      }
                      className="w-full p-1 border border-gray-300 rounded-sm"
                    />
                  </td>
                  <td className="border px-4 py-2">
                    <input
                      type="text"
                      value={
                        formData.lotNumber ? formData.lotNumber.join(", ") : ""
                      }
                      onChange={(e) =>
                        handleChange(
                          "lotNumber",
                          e.target.value.split(",").map((item) => item.trim())
                        )
                      }
                      className="w-full p-1 border border-gray-300 rounded-sm"
                    />
                  </td>
                  <td className="border px-4 py-2">
                    <input
                      type="date"
                      value={formData.manufactureDate || ""}
                      onChange={(e) =>
                        handleChange("manufactureDate", e.target.value)
                      }
                      className="w-full p-1 border border-gray-300 rounded-sm"
                    />
                  </td>
                  <td className="border px-4 py-2">
                    <input
                      type="date"
                      value={
                        formData.dateOfReceipt
                          ? new Date(formData.dateOfReceipt)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        handleChange("dateOfReceipt", e.target.value)
                      }
                      className="w-full p-1 border border-gray-300 rounded-sm"
                    />
                  </td>
                  <td className="border px-4 py-2">
                    <input
                      type="text"
                      value={formData.receiptNumber || ""}
                      onChange={(e) =>
                        handleChange("receiptNumber", e.target.value)
                      }
                      className="w-full p-1 border border-gray-300 rounded-sm"
                    />
                  </td>
                  <td className="border px-4 py-2">
                    <input
                      type="text"
                      value={formData.manufacturer || ""}
                      onChange={(e) =>
                        handleChange("manufacturer", e.target.value)
                      }
                      className="w-full p-1 border border-gray-300 rounded-sm"
                    />
                  </td>
                  <td className="border px-4 py-2">
                    <input
                      type="text"
                      value={formData.description || ""}
                      onChange={(e) =>
                        handleChange("description", e.target.value)
                      }
                      className="w-full p-1 border border-gray-300 rounded-sm"
                    />
                  </td>
                  <td className="border px-4 py-2">
                    <input
                      type="text"
                      value={formData.partLocation || ""}
                      readOnly
                      className="w-full p-1 border border-gray-300 rounded-sm bg-gray-100"
                    />
                  </td>
                  <td className="border px-4 py-2">
                    <input
                      type="text"
                      value={formData.internalPartNo || ""}
                      readOnly
                      className="w-full p-1 border border-gray-300 rounded-sm bg-gray-100"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button
            className="bg-gray-700 text-white px-4 py-2 rounded-sm text-sm mr-2"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="bg-primary text-white px-4 py-2 rounded-sm text-sm"
            onClick={handleSubmit}
          >
            Save
          </button>
        </div>
      </div>

      {/* Mobile Devices */}
      <div className="md:hidden block mb-6 p-2 border border-gray-300 rounded-md bg-white shadow-sm max-h-[500px] overflow-y-auto">
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b ">
              <th className="text-left text-xs text-[#C29B6C] py-2 align-top w-1/3">
                Part number
              </th>
              <td className="py-2 text-xs w-2/3">
                <input
                  type="text"
                  value={formData.partNumber || ""}
                  readOnly
                  className="w-full p-1 border border-gray-300 rounded-sm bg-gray-100"
                />
              </td>
            </tr>

            <tr className="border-b">
              <th className="text-left text-xs text-[#C29B6C] py-2 align-top">
                Quantity
              </th>
              <td className="py-2 text-xs">
                <input
                  type="number"
                  value={formData.quantity || ""}
                  onChange={(e) =>
                    handleChange("quantity", parseInt(e.target.value))
                  }
                  className="w-full p-1 border border-gray-300 rounded-sm"
                />
              </td>
            </tr>

            <tr className="border-b">
              <th className="text-left text-xs text-[#C29B6C] py-2 align-top">
                Lot number
              </th>
              <td className="py-2 text-xs">
                <input
                  type="text"
                  value={
                    formData.lotNumber ? formData.lotNumber.join(", ") : ""
                  }
                  onChange={(e) =>
                    handleChange(
                      "lotNumber",
                      e.target.value.split(",").map((item) => item.trim())
                    )
                  }
                  className="w-full p-1 border border-gray-300 rounded-sm"
                />
              </td>
            </tr>

            <tr className="border-b">
              <th className="text-left text-xs text-[#C29B6C] py-2 align-top">
                Date of manufacturer
              </th>
              <td className="py-2 text-xs">
                <input
                  type="date"
                  value={formData.manufactureDate || ""}
                  onChange={(e) =>
                    handleChange("manufactureDate", e.target.value)
                  }
                  className="w-full p-1 border border-gray-300 rounded-sm"
                />
              </td>
            </tr>

            <tr className="border-b">
              <th className="text-left text-xs text-[#C29B6C] py-2 align-top">
                Date of receipt
              </th>
              <td className="py-2 text-xs">
                <input
                  type="date"
                  value={
                    formData.dateOfReceipt
                      ? new Date(formData.dateOfReceipt)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    handleChange("dateOfReceipt", e.target.value)
                  }
                  className="w-full p-1 border border-gray-300 rounded-sm"
                />
              </td>
            </tr>

            <tr className="border-b">
              <th className="text-left text-xs text-[#C29B6C] py-2 align-top">
                Receipt number
              </th>
              <td className="py-2 text-xs">
                <input
                  type="text"
                  value={formData.receiptNumber || ""}
                  onChange={(e) =>
                    handleChange("receiptNumber", e.target.value)
                  }
                  className="w-full p-1 border border-gray-300 rounded-sm"
                />
              </td>
            </tr>

            <tr className="border-b">
              <th className="text-left text-xs text-[#C29B6C] py-2 align-top">
                Manufacturer
              </th>
              <td className="py-2 text-xs">
                <input
                  type="text"
                  value={formData.manufacturer || ""}
                  onChange={(e) => handleChange("manufacturer", e.target.value)}
                  className="w-full p-1 border border-gray-300 rounded-sm"
                />
              </td>
            </tr>

            <tr className="border-b">
              <th className="text-left text-xs text-[#C29B6C] py-2 align-top">
                Part description
              </th>
              <td className="py-2 text-xs">
                <input
                  type="text"
                  value={formData.description || ""}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="w-full p-1 border border-gray-300 rounded-sm"
                />
              </td>
            </tr>

            <tr className="border-b ">
              <th className="text-left text-xs text-[#C29B6C] py-2 align-top">
                Part location
              </th>
              <td className="py-2 text-xs">
                <input
                  type="text"
                  value={formData.partLocation || ""}
                  readOnly
                  className="w-full p-1 border border-gray-300 rounded-sm bg-gray-100"
                />
              </td>
            </tr>

            <tr className="border-b">
              <th className="text-left text-xs text-[#C29B6C] py-2 align-top">
                Internal PN
              </th>
              <td className="py-2 text-xs">
                <input
                  type="text"
                  value={formData.internalPartNo || ""}
                  readOnly
                  className="w-full p-1 border border-gray-300 rounded-sm bg-gray-100"
                />
              </td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-end mt-4 gap-2">
          <button
            className="bg-gray-700 text-white px-4 py-2 rounded-sm text-sm"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="bg-primary text-white px-4 py-2 rounded-sm text-sm"
            onClick={handleSubmit}
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
};

export default EditableRecordForm;
