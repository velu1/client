import React, { useState, useEffect, useRef } from "react";
import DataConfirmationDialog from "./DataConfirmationDialog";
import { useNavigate } from "react-router-dom";
import EntityMappingDialog from "./EntityMappingDialog";
import {
  Select,
  MenuItem,
  CircularProgress,
  SelectChangeEvent,
} from "@mui/material";
import CameraCapture from "./CameraCapture";
import {
  captureImage,
  validatePartNumber,
  CaptureResponseData,
  ValidationResponseData,
} from "../../../api/partsIn";
import { toast } from "react-fox-toast";
import axios from "../../../api/axios";
import AlertDialog from "../../common/AlertDialog";
// Add printer-related imports
import { usePrinterStore } from "../../../utils/printerService";
import PrinterConfigPreview from "./PrinterConfigPreview";
import { resolveQRContent } from "../../../utils/fieldMapper";

interface InvoiceOption {
  id: string;
  name: string;
}

interface PartsInCaptureProps {
  isActive?: boolean;
  onActivate?: () => void;
  invoiceMode?: boolean;
  invoiceOptions?: InvoiceOption[];
  invoiceLoading?: boolean;
  onInvoiceSelect?: (invoiceNo: string) => void;
  refreshSummaryTable?: () => void;
  refreshInvoiceTable?: () => void;
  printerConfig?: any;
}

// Extended capture response to include MOQ
// interface ExtendedCaptureResponse extends CaptureResponseData {
//   MOQ?: number;
// }

// const captureData = {
//   image: DialogImg,
//   partNumber: "MYSOREMINDS",
//   lotNumber: "9828729271",
//   quantity: "werwertwert",
//   manufacturer: "eretrtert",
// };

const PartsInCapture: React.FC<PartsInCaptureProps> = ({
  isActive = true,
  onActivate,
  invoiceMode = false,
  invoiceOptions = [],
  invoiceLoading = false,
  onInvoiceSelect,
  refreshSummaryTable,
  refreshInvoiceTable,
  printerConfig,
}) => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [templateName] = useState("Default Template");

  useEffect(() => {
    if (isActive) setCollapsed(false);
  }, [isActive]);
  const [manufacturer] = useState("Samsung");
  const isRedirectingRef = useRef(false);
  const [dialogMode, setDialogMode] = useState<
    "none" | "entityMapping" | "dataConfirmation"
  >("none");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [associateTemplates, setAssociateTemplates] = useState<string[]>([]);
  const [partNumber, setPartNumber] = useState<string>("");

  // Add printer-related state
  const isDev = false; // Set to true for development mode preview
  const [showConfigPreview, setShowConfigPreview] = useState(false);
  const [previewData, setPreviewData] = useState<{
    labelData: any;
    qrContent: string;
  }>({ labelData: {}, qrContent: "" });

  // Import printer functionality
  const { isConnected, printLabel } = usePrinterStore();

  // State for captured image and processing status
  const [captureLoading, setCaptureLoading] = useState(false);
  const [capturedBase64, setCapturedBase64] = useState<string | null>(null);
  const [capturedImageDataUrl, setCapturedImageDataUrl] = useState<string>("");
  const [captureResponse, setCaptureResponse] =
    useState<CaptureResponseData | null>(null);

  // State for validation
  const [validationLoading, setValidationLoading] = useState(false);
  const [validationData, setValidationData] = useState<
    ValidationResponseData["data"] | null
  >(null);
  const [fieldMapping] = useState({
    partNumber: "PN-12345",
    quantity: "100",
    lotNumber: "LOT-56789",
    manufacturingDate: "2024-03-15",
  });

  const handleReceiptNumberChange = (e: SelectChangeEvent<string>) => {
    if (e === null) {
      console.log("e", captureResponse);
      setCaptureResponse(null);
    }
    const value = e.target.value as string;
    setReceiptNumber(value);
    if (onInvoiceSelect) onInvoiceSelect(value);
  };

  // Clear form function
  const clearForm = () => {
    // Do not clear receipt number
    setCapturedBase64(null);
    setCapturedImageDataUrl("");
    setCaptureResponse(null);
    setValidationData(null);
    setDialogMode("none");
  };

   useEffect(() => {
      const selectedOption: any = invoiceOptions.find(
        (opt) => opt.name === receiptNumber
      );
      // If the selected option no longer meets the condition, clear it
      if (!selectedOption) {
        setReceiptNumber("");
      }
    }, [invoiceOptions]);

  // Handle image capture from the camera component
  const handleCapture = async (dataUrl: string, base64Data: string | null) => {
    if (!base64Data) {
      // Reset if there's no image
      setCapturedBase64(null);
      setCapturedImageDataUrl("");
      return;
    }

    // Ensure we have a receipt number
    if (!receiptNumber) {
      toast.error("Please enter a receipt number first");
      return;
    }

    setCapturedImageDataUrl(dataUrl);
    setCapturedBase64(base64Data);

    try {
      setCaptureLoading(true);

      // Make the capture API call
      const capturePayload = {
        receiptNumber: receiptNumber,
        entryPreferences: "auto",
        trialRun: false,
        image_base64: `data:image/png;base64,${base64Data}`,
      };

      // Get the response from the capture API
      const response = await captureImage(capturePayload);
      console.log("Capture API response:", response);
      // Process the response based on its format
      let processedResponse: CaptureResponseData;

      if (response.message === "quantity" && response.data) {
        // Handle the special response format with data property
        processedResponse = {
          partNumber: response.data.partNumber,
          quantity: response.data.quantity,
          lotNumber: response.data.lotNumber || [],
          manufactureDate: response.data.manufactureDate || "",
          dateOfReceipt: response.data.dateOfReceipt,
          manufacturer: response.data.manufacturer || "",
          internalPartNo: response.data.internalPartNo || "",
          partLocation: response.data.partLocation || "",
          entryPreferences: response.data.entryPreferences || "auto",
          extracted_sticker: response.data.extracted_sticker,
          MOQ: response.data.MOQ,
          fields: response.data.fields || [], // Include dynamic fields array
        };
      } else {
        // Handle regular response format (direct CaptureResponseData)
        processedResponse = response as unknown as CaptureResponseData;
      }

      setCaptureResponse(processedResponse);

      // If capture is successful, validate the part number
      if (processedResponse.partNumber) {
        await validateCapturedPartNumber(processedResponse.partNumber);
      }

      // Show the data confirmation dialog
      setDialogMode("dataConfirmation");
    } catch (error: any) {
      console.error("Error during image capture:", error);

      const errorMessage = error?.response?.data?.message || error.message;
     

      if (
        errorMessage ===
        "Part Number from the Image could not be extracted! Add the part number in the Master Data & RETRY!!"
      ) {
        toast.error(
          "Part Number from the Image could not be extracted! Add the part number in the Master Data & RETRY!!"
        );
      } 
      else if (
        error?.response?.data?.newTemplate
      ) {
        setShowAlertDialog(true);
        setAssociateTemplates(error.response.data.associateTemplate || []);
        setPartNumber(error.response.data.partNumber || "");
      } else if (errorMessage === "Template not found for the scanned image") {
        if (!isRedirectingRef.current) {
          setShowAlertDialog(true);
        }
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setCaptureLoading(false);
    }
  };

  // Validate the part number from the capture response
  const validateCapturedPartNumber = async (partNumber: string) => {
    try {
      setValidationLoading(true);
      const validationResponse = await validatePartNumber(partNumber);

      // Check if validation data includes MOQ
      if (validationResponse.data) {
        setValidationData(validationResponse.data);
      }
    } catch (error) {
      console.error("Error validating part number:", error);
      toast.error("Failed to validate part number");
      setValidationData(null);
    } finally {
      setValidationLoading(false);
    }
  };

  // Add auto-print function (reusing logic from SummaryTable)
  const handleAutoPrint = async (submittedData: any) => {
    try {
      // Check if printerConfig is loaded
      if (!printerConfig) {
        console.warn("[PartsInCapture] Printer config is null at print time!");
        toast.error(
          "Printer configuration is still loading. Please try again in a moment."
        );
        return;
      }

      console.log(
        "[PartsInCapture] Auto-print triggered for:",
        submittedData.uniqueId
      );

      // Map the submitted data to label format (same format as SummaryTable)
      const labelData = {
        ...submittedData, // Use ALL data from API response
        copies: submittedData.copies || 1, // Only default copies if not provided
      };

      // Generate QR content using dynamic field mapper (same logic as SummaryTable)
      let qrContent = "";
      if (
        printerConfig &&
        printerConfig.priority &&
        printerConfig.priority.length > 0
      ) {
        console.log(
          "[PartsInCapture] Using dynamic field mapper for QR content generation"
        );

        // Prepare comprehensive data object with all available fields
        const comprehensiveData = {
          ...labelData, // ALL response data
        };

        console.log(
          "[PartsInCapture] Comprehensive data for field mapping:",
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
        console.log("[PartsInCapture] Dynamic field resolution results:");
        debug.forEach(({ priority, fieldName, value, source }) => {
          console.log(
            `  Priority ${priority}: "${fieldName}" = "${value}" (source: ${source})`
          );
        });

        console.log(`[PartsInCapture] Final QR content: "${qrContent}"`);
      } else {
        qrContent = `UID:${labelData.uid}\nGRN:${labelData.grn}\nBatch:${labelData.batch}\nI-PIN:${labelData.ipin}`;
        console.log("[PartsInCapture] Using fallback QR content format");
      }

      // In development mode, show preview instead of printing
      if (isDev) {
        console.log("[PartsInCapture] Dev mode - showing config preview");
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

      // Print the label with printer configuration
      const success = await printLabel(labelData, printerConfig);

      if (success) {
        toast.success(`Label printed for ${submittedData.uniqueId}`);
      } else {
        toast.error("Failed to print label");
      }
    } catch (error) {
      console.error("Auto-print error:", error);
      toast.error("Error occurred while printing");
    }
  };
  // Handle submission from the confirmation dialog
  const handleDataSubmit = async (formData: any) => {
    try {
      const basePayload: any = {
        receiptNumber: receiptNumber,
        dateOfReceipt: formData.dateOfReceipt || new Date().toISOString(),
        partType: "electronicPart",
        image_base64: capturedBase64
          ? `data:image/png;base64,${capturedBase64}`
          : null,
      };

      // Include all fields with valid values, preserving arrays
      const dynamicPayload = Object.entries(formData).reduce(
        (acc, [key, value]) => {
          if (
            value !== undefined &&
            value !== null &&
            value !== "" &&
            !(Array.isArray(value) && value.length === 0)
          ) {
            acc[key] =
              Array.isArray(value) && value.length === 1 ? value[0] : value;
          }
          return acc;
        },
        {} as Record<string, any>
      );

      const payload = {
        ...basePayload,
        ...dynamicPayload,
      };

      const response = await axios.post("/incoming/api/partsIn", payload);

      if (response.data) {
        toast.success("Part data submitted successfully");

        // Auto-print
        if (
          response.data.data &&
          Array.isArray(response.data.data) &&
          response.data.data.length > 0
        ) {
          const submittedData = response.data.data[0];
          console.log(
            "[PartsInCapture] Attempting auto-print for submitted data:",
            submittedData
          );
          await handleAutoPrint(submittedData);
        }

        clearForm();
        if (refreshSummaryTable) refreshSummaryTable();
        if (refreshInvoiceTable) refreshInvoiceTable();
      }
    } catch (error) {
      console.error("Error submitting parts-in data:", error);
      toast.error("Failed to submit part data");
    }
  };
  

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {isDev && (
        <PrinterConfigPreview
          isOpen={showConfigPreview}
          onClose={() => setShowConfigPreview(false)}
          printerConfig={printerConfig}
          labelData={previewData.labelData}
          qrContent={previewData.qrContent}
        />
      )}

      <AlertDialog
        isOpen={showAlertDialog}
        onClose={() => setShowAlertDialog(false)}
        onCreateTemplate={() => {
          isRedirectingRef.current = true;
          setShowAlertDialog(false);
          navigate("/template");
        }}
        templates={associateTemplates}
        partNumber={partNumber}
      />

      {dialogMode === "dataConfirmation" && captureResponse && (
        <DataConfirmationDialog
          isOpen={true}
          onClose={() => setDialogMode("none")}
          onSubmit={handleDataSubmit}
          capturedData={captureResponse}
          validationData={validationData || undefined}
          validationLoading={validationLoading}
          capturedImageUrl={capturedImageDataUrl}
        />
      )}

      {dialogMode === "entityMapping" && (
        <EntityMappingDialog
          isOpen={true}
          onClose={() => setDialogMode("none")}
          imageUrl={capturedImageDataUrl}
          templateName={templateName}
          manufacturer={manufacturer}
          fieldMapping={fieldMapping}
        />
      )}

      {/* Section header */}
      {!isActive ? (
        <div
          className="flex items-center justify-between px-5 py-3 cursor-pointer select-none hover:bg-gray-50/80 transition-colors"
          onClick={onActivate}
        >
          <div className="flex items-center gap-2.5">
            <div className="h-2 w-2 rounded-full bg-gray-300" />
            <span className="text-sm font-medium text-gray-400">AI Capture</span>
          </div>
          <span className="text-xs text-gray-300 font-medium">Click to switch</span>
        </div>
      ) : (
        <div
          className="flex items-center justify-between px-5 py-3.5 bg-emerald-100/80 border-b border-emerald-200 cursor-pointer select-none"
          onClick={() => setCollapsed((prev) => !prev)}
        >
          <div className="flex items-center gap-2.5">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200" />
            <span className="text-sm font-semibold text-gray-800">AI Capture</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Active</span>
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              collapsed ? "" : "rotate-180"
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      )}

      {/* Collapsible content — only rendered when active */}
      <div
        className={`transition-all duration-300 overflow-hidden ${
          !isActive || collapsed ? "max-h-0 opacity-0" : "max-h-250 opacity-100"
        }`}
      >
        <div className="px-5 py-5 space-y-5">
          <div className="md:w-[30%] w-full">
            {invoiceMode ? (
              <Select
                labelId="receipt-number-label"
                id="receipt-number-select"
                name="receiptNumber"
                value={receiptNumber}
                onChange={handleReceiptNumberChange}
                displayEmpty
                fullWidth
                size="small"
                disabled={invoiceLoading || captureLoading}
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
              <input
                type="text"
                placeholder="Receipt number *"
                value={receiptNumber}
                onChange={(e) =>
                  setReceiptNumber(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))
                }
                disabled={captureLoading}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#434a52] focus:ring-2 focus:ring-[#434a52]/15 transition-all disabled:opacity-50 bg-white"
              />
            )}
          </div>

          <div>
            <CameraCapture
              onCapture={handleCapture}
              disabled={false}
              hasReceiptNumber={!!receiptNumber}
              isDev={false}
            />

            {captureLoading && (
              <div className="flex justify-center items-center mt-4 gap-2">
                <CircularProgress size={20} className="text-[#676e6e]" />
                <span className="text-sm text-gray-500">Processing image...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartsInCapture;
