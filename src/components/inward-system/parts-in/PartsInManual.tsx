import { useState, useEffect, useRef } from "react";

import {
  TextField,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Select,
  CircularProgress,
} from "@mui/material";
import { Button } from "../../ui/button";
import axios from "../../../api/axios";
import { toast } from "react-fox-toast";
import CameraPopup from "./CameraPopup";
import { usePrinterStore } from "../../../utils/printerService";
import PrinterConfigPreview from "./PrinterConfigPreview";
import { resolveQRContent } from "../../../utils/fieldMapper";

interface InvoiceOption {
  id: string;
  name: string;
}

interface PartsInManualProps {
  invoiceMode?: boolean;
  invoiceOptions?: InvoiceOption[];
  invoiceLoading?: boolean;
  onInvoiceSelect?: (invoiceNo: string) => void;
  refreshSummaryTable?: () => void;
  refreshInvoiceTable?: () => void;
  printerConfig?: any;
}

const PartsInManual: React.FC<PartsInManualProps> = ({
  invoiceMode = false,
  invoiceOptions = [],
  invoiceLoading = false,
  onInvoiceSelect,
  refreshSummaryTable,
  refreshInvoiceTable,
  printerConfig,
}) => {
  const [formData, setFormData] = useState({
    receiptNumber: "",
    addMultipleStickers: false,
    numberOfStickers: "",
    addReferenceImage: false,
    partNumber: "",
    quantity: "",
    lotNumber: "",
    manufactureDate: "",
  });
  const [collapsed, setCollapsed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [showCameraPopup, setShowCameraPopup] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add printer-related state
  const isDev = false; // Set to true for development mode preview
  const [showConfigPreview, setShowConfigPreview] = useState(false);
  const [previewData, setPreviewData] = useState<{
    labelData: any;
    qrContent: string;
  }>({ labelData: {}, qrContent: "" });

  // Import printer functionality
  const { isConnected, printLabel } = usePrinterStore();

  // Printer functionality

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    let sanitizedValue = value;

    // // Only sanitize inputs *except* manufDate
    // if (name !== "manufactureDate") {
    //   sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, "");
    // }
      if (name === "partNumber") {
    // Allow letters, numbers, and . , / - _
    sanitizedValue = value.replace(/[^a-zA-Z0-9.,/_-]/g, "");
  } else if (name !== "manufactureDate") {
    // Other fields (except manufactureDate) → allow only alphanumeric
    sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, "");
  }

    setFormData((prevData) => ({
      ...prevData,
      [name]: sanitizedValue,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  const handleReceiptNumberChange = (
    e: React.ChangeEvent<{ value: unknown }>
  ) => {
    const value = e.target.value as string;
    setFormData({ ...formData, receiptNumber: value });
    if (onInvoiceSelect) onInvoiceSelect(value);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result?.toString().split(",")[1] || null;
        setImageBase64(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (base64: string | null) => {
    setImageBase64(base64);
  };

  // Add auto-print function (reusing logic from SummaryTable)
  // Helper: increment trailing number in an ID, preserving zero-padding
  const incrementUniqueId = (baseId: string, step = 1): string => {
    console.log(`[incrementUniqueId] Input: baseId="${baseId}", step=${step}`);

    if (step <= 0) {
      console.log(
        `[incrementUniqueId] Step <= 0, returning original: "${baseId}"`
      );
      return baseId;
    }

    const m = baseId.match(/(\d+)(?!.*\d)/);
    if (!m || m.index === undefined) {
      const result = step === 0 ? baseId : `${baseId}${step}`;
      console.log(
        `[incrementUniqueId] No trailing number found, result: "${result}"`
      );
      return result;
    }

    const prefix = baseId.slice(0, m.index);
    const numStr = m[1];
    const next = (parseInt(numStr, 10) || 0) + step;
    const nextStr = next.toString().padStart(numStr.length, "0");
    const result = `${prefix}${nextStr}`;

    console.log(
      `[incrementUniqueId] Parsed: prefix="${prefix}", numStr="${numStr}", next=${next}, nextStr="${nextStr}"`
    );
    console.log(`[incrementUniqueId] Result: "${result}"`);
    return result;
  };

  const handleAutoPrint = async (submittedData: any) => {
    try {
      // Check if printerConfig is loaded
      if (!printerConfig) {
        console.warn("[PartsInManual] Printer config is null at print time!");
        toast.error(
          "Printer configuration is still loading. Please try again in a moment."
        );
        return;
      }

      // Calculate number of copies based on multiple stickers setting
      let numberOfCopies = 1; // Default to 1 copy
      if (formData.addMultipleStickers && formData.numberOfStickers) {
        const stickersCount = parseInt(formData.numberOfStickers, 10);
        if (!isNaN(stickersCount) && stickersCount > 0) {
          numberOfCopies = stickersCount;
        }
      }

      console.log(
        "[PartsInManual] Auto-print triggered for:",
        submittedData.uniqueId,
        "- Number of copies to print:",
        numberOfCopies
      );

      // Map the submitted data to label format (same format as SummaryTable)
      const labelData = {
        uid: submittedData.uniqueId, // UID = uniqueId
        grn: submittedData.invoiceNumber, // GRN = invoiceNumber
        batch: Array.isArray(submittedData.lotNumber)
          ? submittedData.lotNumber[0]
          : submittedData.lotNumber || "", // Batch = lotNumber
        ipin: submittedData.internalPartNo || "", // I-PIN = internalPartNo
        partNumber: submittedData.partNumber,
        receiptNumber: submittedData.receiptNumber,
        lotNumber: Array.isArray(submittedData.lotNumber)
          ? submittedData.lotNumber[0]
          : submittedData.lotNumber || "",
        quantity: submittedData.quantity.toString(),
        mfgDate: submittedData.mfgDate,
        manufactureDate: submittedData.mfgDate,
        manufacturer: submittedData.manufacturer || "", // Maker field
        uniqueId: submittedData.uniqueId,
        internalPartNo: submittedData.internalPartNo,
        partLocation: submittedData.partLocation,
        copies: numberOfCopies, // Set the number of copies based on numberOfStickers
      };

      // Generate QR content using dynamic field mapper (same logic as SummaryTable)
      let qrContent = "";
      if (
        printerConfig &&
        printerConfig.priority &&
        printerConfig.priority.length > 0
      ) {
        console.log(
          "[PartsInManual] Using dynamic field mapper for QR content generation"
        );

        // Prepare comprehensive data object with all available fields
        const comprehensiveData = {
          // Core fields from submitted data
          partNumber: labelData.partNumber,
          lotNumber: labelData.lotNumber,
          quantity: labelData.quantity,
          manufactureDate: labelData.mfgDate,
          uniqueId: labelData.uniqueId,
          uid: labelData.uid,
          grn: labelData.grn,
          batch: labelData.batch,
          ipin: labelData.ipin,
          internalPartNo: labelData.ipin,
          invoiceNumber: labelData.grn,
          manufacturer: labelData.manufacturer,
          receiptNumber: labelData.receiptNumber,
       
          // Alternative field names for flexibility
          "LOT NUMBER": labelData.lotNumber,
          "Manuf Date": labelData.mfgDate,
          part_number: labelData.partNumber,
          lot_number: labelData.lotNumber,
          internal_part_number: labelData.ipin,
          invoice_number: labelData.grn,
          unique_id: labelData.uniqueId,
          "part-number": labelData.partNumber,
          "lot-number": labelData.lotNumber,

          // Additional fields that might be configured in the API
          lotnumber: labelData.lotNumber,
          partnumber: labelData.partNumber,
          internalpartnumber: labelData.ipin,
          partlocation: submittedData.partLocation || "",
          partdescription: submittedData.description || "",
          demo: "",
          newexel: "",
          
        };

        console.log(
          "[PartsInManual] Comprehensive data for field mapping:",
          comprehensiveData
        );

        // Use dynamic field mapper to resolve QR content
        const { content, debug } = resolveQRContent(
          printerConfig.priority,
          comprehensiveData,
          printerConfig.delimiter || "|",
          printerConfig.entityTableRows,
          true // Enable debug mode for detailed logging
        );

        qrContent = content;

        // Enhanced logging with field resolution details
        console.log("[PartsInManual] Dynamic field resolution results:");
        debug.forEach(({ priority, fieldName, value, source }) => {
          console.log(
            `  Priority ${priority}: "${fieldName}" = "${value}" (source: ${source})`
          );
        });

        console.log(`[PartsInManual] Final QR content: "${qrContent}"`);
      } else {
        qrContent = `UID:${labelData.uid}\nGRN:${labelData.grn}\nBatch:${labelData.batch}\nI-PIN:${labelData.ipin}`;
        console.log("[PartsInManual] Using fallback QR content format");
      }

      // In development mode, show preview instead of printing
      if (isDev) {
        console.log("[PartsInManual] Dev mode - showing config preview");
        setPreviewData({ labelData, qrContent });
        setShowConfigPreview(true);
        return;
      }

      // Production mode - actual printing
      // Check if printer is connected
      if (!isConnected) {
        toast.error("Printer is not connected");
        return;
      }

      // For multiple stickers in manual mode: print one-by-one with incremented uniqueId
      let allOk = true;
      console.log(
        `[PartsInManual] Starting print process - numberOfCopies: ${numberOfCopies}, baseUniqueId: "${submittedData.uniqueId}"`
      );

      if (numberOfCopies > 1) {
        console.log(
          `[PartsInManual] Multiple stickers detected - will print ${numberOfCopies} labels with incremented uniqueId`
        );

        for (let i = 0; i < numberOfCopies; i++) {
          console.log(
            `[PartsInManual] Printing sticker ${i + 1}/${numberOfCopies}`
          );

          const nextId = incrementUniqueId(submittedData.uniqueId, i);
          console.log(
            `[PartsInManual] Generated uniqueId for sticker ${
              i + 1
            }: "${nextId}"`
          );

          const perLabelData = {
            ...labelData,
            uid: nextId,
            uniqueId: nextId,
            copies: 1,
          };

          console.log(`[PartsInManual] Label data for sticker ${i + 1}:`, {
            uid: perLabelData.uid,
            uniqueId: perLabelData.uniqueId,
            copies: perLabelData.copies,
            partNumber: perLabelData.partNumber,
            quantity: perLabelData.quantity,
          });

          const ok = await printLabel(perLabelData, printerConfig);
          console.log(
            `[PartsInManual] Print result for sticker ${i + 1}: ${
              ok ? "SUCCESS" : "FAILED"
            }`
          );
          allOk = allOk && ok;
        }

        console.log(
          `[PartsInManual] All stickers printed. Overall result: ${
            allOk ? "SUCCESS" : "FAILED"
          }`
        );
      } else {
        // Single sticker: print once
        console.log(
          `[PartsInManual] Single sticker mode - printing 1 label with uniqueId: "${submittedData.uniqueId}"`
        );

        const singleLabelData = { ...labelData, copies: 1 };
        console.log(`[PartsInManual] Single label data:`, {
          uid: singleLabelData.uid,
          uniqueId: singleLabelData.uniqueId,
          copies: singleLabelData.copies,
          partNumber: singleLabelData.partNumber,
          quantity: singleLabelData.quantity,
        });

        const ok = await printLabel(singleLabelData, printerConfig);
        console.log(
          `[PartsInManual] Single sticker print result: ${
            ok ? "SUCCESS" : "FAILED"
          }`
        );
        allOk = allOk && ok;
      }

      if (allOk) {
        toast.success(
          `${numberOfCopies} label${numberOfCopies > 1 ? "s" : ""} printed`
        );
      } else {
        toast.error("Failed to print one or more labels");
      }
    } catch (error) {
      console.error("Auto-print error:", error);
      toast.error("Error occurred while printing");
    }
  };

  // Clear form function
  const clearForm = () => {
    const savedReceiptNumber = formData.receiptNumber; // Save current receipt number
    setFormData({
      receiptNumber: savedReceiptNumber, // Keep the receipt number
      addMultipleStickers: false,
      numberOfStickers: "",
      addReferenceImage: false,
      partNumber: "",
      quantity: "",
      lotNumber: "",
      manufactureDate: "",
    });
    setImageBase64(null);

    // Clear file input if any
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.partNumber || !formData.quantity || !formData.receiptNumber) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setIsSubmitting(true);

      const formattedImageBase64 = imageBase64
        ? `data:image/jpeg;base64,${imageBase64}`
        : null;

      const payload = {
        partNumber: formData.partNumber,
        quantity: Number(formData.quantity),
        mfgDate: formData.manufactureDate || "",
        lotNumber: formData.lotNumber || "",
        multipleSticker: formData.addMultipleStickers
          ? Number(formData.numberOfStickers)
          : 0,
        receiptNumber: formData.receiptNumber || "",
        dateOfReceipt: new Date().toISOString(),
        image_base64: formData.addReferenceImage ? formattedImageBase64 : null,
        // Default values for removed fields
        partLocation: "",
        internalPartNo: "",
        manufacturer: "",
        description: "",
        expireDate: "",
        deliveryChallan: "",
        customerCode: "",
        customerName: "",
        partType: "electronicPart",
        floor: "",
        department: "",
        hsnCode: "",
        valuationRate: "",
      };

      const response = await axios.post("/incoming/api/partsIn", payload);

      if (response.data) {
        toast.success("Part data submitted successfully");

        // Auto-print functionality - trigger print if printer config is available
        if (
          response.data.data &&
          Array.isArray(response.data.data) &&
          response.data.data.length > 0
        ) {
          const submittedData = response.data.data[0]; // Get the first item from the response data array
          console.log(
            "[PartsInManual] Attempting auto-print for submitted data:",
            submittedData
          );
          await handleAutoPrint(submittedData);
        }

        // Reset form after successful submission
        clearForm();

        // Refresh the summary table
        if (refreshSummaryTable) {
          refreshSummaryTable();
        }
        if (refreshInvoiceTable) {
          refreshInvoiceTable();
        }
      }
    } catch (error: any) {
      console.error("Error submitting part data:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.data ||
        error?.response?.data ||
        "Failed to submit part data";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const selectedOption: any = invoiceOptions.find(
      (opt) => opt.name === formData.receiptNumber
    );
    // If the selected option no longer meets the condition, clear it
    if (!selectedOption) {
      setFormData((prev) => ({ ...prev, receiptNumber: "" }));
    }
  }, [invoiceOptions]);

  const isFormValid = () => {
    if (
      !formData.partNumber.trim() ||
      !formData.quantity.trim() ||
      !formData.receiptNumber.trim()
    ) {
      return false;
    }

    if (isNaN(Number(formData.quantity)) || Number(formData.quantity) <= 0) {
      return false;
    }

    if (formData.addMultipleStickers) {
      if (
        !formData.numberOfStickers.trim() ||
        isNaN(Number(formData.numberOfStickers)) ||
        Number(formData.numberOfStickers) <= 0
      ) {
        return false;
      }
    }

    if (formData.addReferenceImage && !imageBase64) {
      return false;
    }

    return true;
  };

  return (
    <div className="bg-white rounded-md shadow-sm border">
      {/* Add PrinterConfigPreview modal for dev mode */}
      {isDev && (
        <PrinterConfigPreview
          isOpen={showConfigPreview}
          onClose={() => setShowConfigPreview(false)}
          printerConfig={printerConfig}
          labelData={previewData.labelData}
          qrContent={previewData.qrContent}
        />
      )}

      <CameraPopup
        isOpen={showCameraPopup}
        onClose={() => setShowCameraPopup(false)}
        onCapture={handleCameraCapture}
        hasReceiptNumber={!!formData.receiptNumber}
      />

      <div className="flex items-center justify-between px-4 py-2 ">
        <span className="text-sm font-medium text-gray-800">
          {collapsed ? "Form" : ""}
        </span>
        <button
          className="bg-[#676e6e]/20 rounded-full p-1 hover:bg-[#676e6e]/30 transition"
          onClick={() => setCollapsed((prev) => !prev)}
        >
          <svg
            className={`w-5 h-5 text-[#676e6e] transition-transform duration-300 ${
              collapsed ? "" : "rotate-180"
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      <div
        className={`transition-all duration-300 overflow-hidden ${
          collapsed
            ? "max-h-0 opacity-0"
            : "max-h-[2000px] opacity-100 px-6 py-6"
        }`}
      >
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-md shadow-sm border p-6 space-y-6"
        >
          {/* Section 1: Receipt Number */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Receipt Number - Fixed Width */}
            <div className="lg:w-1/4 flex-shrink-0">
              {invoiceMode ? (
                <Select
                  labelId="receipt-number-label"
                  id="receipt-number-select"
                  name="receiptNumber"
                  value={formData.receiptNumber}
                  // @ts-ignore-expect-error non fixed type
                  onChange={handleReceiptNumberChange}
                  displayEmpty
                  fullWidth
                  size="small"
                  disabled={invoiceLoading}
                  renderValue={(selected) =>
                    selected ? selected : "Select receipt number"
                  }
                >
                  <MenuItem value="" disabled>
                    {invoiceLoading ? (
                      <span className="flex items-center gap-2">
                        <CircularProgress size={16} /> Loading...
                      </span>
                    ) : (
                      "Select receipt number"
                    )}
                  </MenuItem>
                  {invoiceOptions.map((opt) => (
                      <MenuItem key={opt.id} value={opt.name}>
                        {opt.name}
                      </MenuItem>
                    ))}
                </Select>
              ) : (
                <TextField
                  label="Receipt number *"
                  name="receiptNumber"
                  value={formData.receiptNumber}
                  onChange={handleChange}
                  placeholder="Enter receipt number"
                  size="small"
                  required
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                    style: { color: "#6b7280" },
                  }}
                />
              )}
            </div>

            {/* Checkboxes - Flexible Width */}
            <div className="flex-1">
              <div className="flex flex-wrap md:items-center gap-6">
                <FormControlLabel
                  control={
                    <Checkbox
                      name="addMultipleStickers"
                      checked={formData.addMultipleStickers}
                      onChange={handleCheckboxChange}
                      sx={{
                        color: "#676e6e",
                        "&.Mui-checked": {
                          color: "#676e6e",
                        },
                        "& .MuiSvgIcon-root": {
                          borderColor: "#676e6e",
                        },
                      }}
                      color="primary"
                    />
                  }
                  label="Add multiple stickers"
                  sx={{
                    color: "#6b7280",
                    fontWeight: 500,
                  }}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      name="addReferenceImage"
                      checked={formData.addReferenceImage}
                      onChange={handleCheckboxChange}
                      sx={{
                        color: "#676e6e",
                        "&.Mui-checked": {
                          color: "#676e6e",
                        },
                        "& .MuiSvgIcon-root": {
                          borderColor: "#676e6e",
                        },
                      }}
                    />
                  }
                  label="Add reference image"
                  sx={{
                    color: "#6b7280",
                    fontWeight: 500,
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {formData.addMultipleStickers && (
                  <TextField
                    label="Number of stickers"
                    name="numberOfStickers"
                    type="number"
                    value={formData.numberOfStickers}
                    onChange={handleChange}
                    placeholder="Enter quantity"
                    size="small"
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                )}

                {formData.addReferenceImage && (
                  <div className="md:col-span-2 flex flex-col space-y-2">
                    <div
                      className="border border-dashed border-gray-300 rounded-md h-32 flex items-center justify-center cursor-pointer relative overflow-hidden"
                      onClick={() => {
                        if (!imageBase64) {
                          setShowCameraPopup(true);
                        }
                      }}
                    >
                      {imageBase64 ? (
                        <div className="w-full h-full relative">
                          <img
                            src={`data:image/jpeg;base64,${imageBase64}`}
                            alt="Captured Reference"
                            className="w-full h-full object-contain filter grayscale"
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black bg-opacity-40 transition-opacity">
                            <span className="text-white text-sm">
                              Click to change
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mx-auto mb-2 text-[#676e6e]"
                          >
                            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                            <circle cx="12" cy="13" r="3" />
                          </svg>
                          <span className="text-sm">Click to open camera</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowCameraPopup(true)}
                        className="text-[#676e6e] text-sm bg-[#676e6e]/10 hover:bg-[#676e6e]/20 px-3 py-1 rounded flex items-center"
                      >
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
                          className="mr-1"
                        >
                          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                          <circle cx="12" cy="13" r="3" />
                        </svg>
                        Camera
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-gray-600 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded flex items-center"
                      >
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
                          className="mr-1"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        Upload
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Main Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <TextField
              label="Part number"
              placeholder="983434343493849834"
              name="partNumber"
              value={formData.partNumber}
              onChange={handleChange}
              size="small"
              required
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="Quantity"
              name="quantity"
              placeholder="Enter Quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              size="small"
              required
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="Lot number"
              name="lotNumber"
              placeholder="W12233454545"
              value={formData.lotNumber}
              onChange={handleChange}
              size="small"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="Manufacture date"
              name="manufactureDate"
              value={formData.manufactureDate}
              onChange={handleChange}
              placeholder="Enter manufacture date"
              size="small"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </div>
          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              onClick={clearForm}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 md:px-8 py-1 rounded-sm"
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid() || isSubmitting}
              className="bg-[#676e6e] hover:bg-[#676e6e]/90 text-white px-4 md:px-8 py-1 rounded-sm"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <CircularProgress size={16} color="inherit" /> Submitting...
                </span>
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PartsInManual;

