import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { TextField, CircularProgress, InputAdornment } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import InfoIcon from "@mui/icons-material/Info";

const AUTO_SUBMIT_DELAY = 10; // Auto-submit delay in seconds

interface ValidationData {
  partNumber: string;
  quantity: number;
  manufacturer: string;
  dateOfReceipt: string;
  idCode: string;
  internalPartNo: string;
  partLocation: string;
  MOQ?: number;
}

interface DataConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  capturedData: {
    partNumber: string;
    quantity: number;
    lotNumber: string[] | [];
    manufactureDate?: string;
    mfgDate?: string;
    dateOfReceipt: string;
    manufacturer: string;
    internalPartNo: string;
    partLocation: string;
    description?: string;
    extracted_sticker: string;
    idCode?: string;
    entryPreferences?: string;
    MOQ?: number;
    fields?: string[]; // Array of field names to display dynamically
  };
  validationData?: ValidationData;
  validationLoading?: boolean;
  capturedImageUrl?: string; // Fallback image URL from local capture
}

const DataConfirmationDialog: React.FC<DataConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  capturedData,
  validationData,
  validationLoading = false,
  capturedImageUrl,
}) => {
  const [isEditable, setIsEditable] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [countdown, setCountdown] = useState<number | null>(AUTO_SUBMIT_DELAY);
  const [formData, setFormData] = useState(capturedData);
  const [quantityMismatch, setQuantityMismatch] = useState(false);
  const [quantityEditMode, setQuantityEditMode] = useState(false);
  const [capturedQuantity, setCapturedQuantity] = useState<number | null>(null);
  const [moqQuantity, setMoqQuantity] = useState<number | null>(null);
  const [isQuantityFieldDisabled, setIsQuantityFieldDisabled] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Function to get user-friendly field labels
  const getFieldLabel = (fieldName: string): string => {
    const fieldLabels: { [key: string]: string } = {
      partNumber: "Part number *",
      quantity: "Quantity *",
      lotNumber: "Lot number *",
      manufactureDate: "Date Code",
      mfgDate: "Date Code",
    };
    return fieldLabels[fieldName] || fieldName;
  };

  // Function to get field value from form data
  const getFieldValue = (fieldName: string): any => {
    if (fieldName === "lotNumber") {
      return getLotNumberString();
    } else if (fieldName === "manufactureDate" || fieldName === "mfgDate") {
      return getDateCodeString();
    } else {
      return formData[fieldName as keyof typeof formData] || "";
    }
  };

  // Function to handle dynamic field changes
  const handleDynamicFieldChange = (fieldName: string, value: any) => {
    if (fieldName === "lotNumber") {
      handleInputChange("lotNumber", [value]);
    } else {
      handleInputChange(fieldName, value);
    }
  };

  // Validation function to check form validity
  const checkFormValidity = (data: typeof formData) => {
    // Get dynamic fields from capturedData
    const dynamicFields = capturedData.fields || [];

    // Check if all dynamic fields are valid (all are mandatory)
    const dynamicFieldsValid = dynamicFields.every((fieldName) => {
      if (fieldName === "quantity") {
        return data.quantity > 0;
      } else if (fieldName === "lotNumber") {
        return data.lotNumber?.length > 0;
      } else {
        const value = data[fieldName as keyof typeof data];
        return value && String(value).trim() !== "";
      }
    });

    // Check if all mapped data fields are valid (all are mandatory)
    const mappedDataValid = Boolean(
      data.internalPartNo?.trim()
      // data.description?.trim() &&
      // data.partLocation?.trim()
      // maker is not mandatory
    );

    return dynamicFieldsValid && mappedDataValid;
  };

  // Setup initial state when dialog opens
  useEffect(() => {
    if (isOpen) {
      console.log(quantityEditMode);
      console.log(capturedQuantity);
      // When dialog opens, check if all mandatory fields are present for auto-submission
      const allMandatoryFieldsPresent = checkFormValidity(capturedData);

      // Only start countdown if all mandatory fields are present
      if (allMandatoryFieldsPresent) {
        setCountdown(AUTO_SUBMIT_DELAY);
        setIsEditable(false);
      } else {
        setCountdown(null);
        setIsEditable(true);
      }

      // Check if we have MOQ in captured data or validation data
      const capturedMOQ = capturedData.MOQ;
      const validationMOQ = validationData?.MOQ;
      const capturedQty = capturedData.quantity;

      // Store the original captured quantity for reference
      setCapturedQuantity(capturedQty);

      // Determine the MOQ from either source
      const moq = capturedMOQ || validationMOQ || null;
      setMoqQuantity(moq);

      // Check for quantity mismatch if MOQ is available
      if (moq && capturedQty !== moq) {
        setQuantityMismatch(true);
        setQuantityEditMode(true);
        setIsQuantityFieldDisabled(false);

        // Automatically pause countdown when there's a quantity mismatch
        clearInterval(timerRef.current!);
        timerRef.current = null;
        setIsEditable(true);
        setCountdown(null);
      } else {
        setQuantityMismatch(false);
        setQuantityEditMode(false);
        setIsQuantityFieldDisabled(true);

        // Only start countdown if there's no quantity mismatch AND all fields are present
        if (allMandatoryFieldsPresent) {
          timerRef.current = setInterval(() => {
            setCountdown((prev) => {
              if (prev === null) return null;

              if (prev === 1) {
                clearInterval(timerRef.current!);
                // Auto-submit the data when countdown reaches 0
                handleSubmit();
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
      }
    } else {
      // Cleanup when dialog closes
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setCountdown(AUTO_SUBMIT_DELAY);
      setIsEditable(false);
      setQuantityEditMode(false);
      setIsQuantityFieldDisabled(true);
    }
  }, [isOpen, capturedData, validationData]);

  // Update form data when capturedData changes
  useEffect(() => {
    setFormData(capturedData);
    // Check initial form validity
    setIsFormValid(checkFormValidity(capturedData));
  }, [capturedData]);

  // Add effect to check form validation in real-time
  useEffect(() => {
    setIsFormValid(checkFormValidity(formData));
  }, [formData]);

  // Handle quantity field actions
  const handleAcceptQuantity = () => {
    // Accept the current edited quantity
    setQuantityMismatch(false);
    setQuantityEditMode(false);
    setIsQuantityFieldDisabled(true);
  };

  const handleRejectQuantity = () => {
    // Use the moq value if available
    if (moqQuantity !== null) {
      handleInputChange("quantity", moqQuantity);
    }
    setQuantityMismatch(false);
    setQuantityEditMode(false);
    setIsQuantityFieldDisabled(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setIsEditable(true);
      setCountdown(null);
    }
  };

  const handlePauseClick = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setIsEditable(true);
      setCountdown(null);
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  // Get lot number string for display
  const getLotNumberString = () => {
    if (!formData?.lotNumber) return "";
    if (Array.isArray(formData.lotNumber)) {
      return formData.lotNumber.length > 0 ? formData.lotNumber[0] : "";
    }
    return formData.lotNumber as unknown as string;
  };

  // Get date code string
  const getDateCodeString = () => {
    return formData?.mfgDate || "";
  };

  // Get the appropriate image URL to display
  const getImageUrl = () => {
    // First try extracted_sticker from API response
    if (capturedData?.extracted_sticker && !imageError) {
      return capturedData.extracted_sticker;
    }
    // Fallback to locally captured image
    if (capturedImageUrl) {
      return capturedImageUrl;
    }
    // No image available
    return null;
  };

  // Handle image loading error
  const handleImageError = () => {
    setImageError(true);
  };

  // Reset image error when dialog opens
  useEffect(() => {
    if (isOpen) {
      setImageError(false);
    }
  }, [isOpen]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      modal={true}
    >
      <DialogContent className="bg-white rounded-lg p-4 sm:p-6 shadow-lg w-[95%] max-w-2xl md:!max-w-5xl mx-auto">
        <DialogHeader>
          <DialogTitle className="md:text-xl text-sm font-semibold text-center">
            Data confirmation
          </DialogTitle>
        </DialogHeader>

        {validationLoading ? (
          <div className="flex justify-center items-center h-64">
            <CircularProgress size={40} />
            <span className="ml-2">Validating part number...</span>
          </div>
        ) : (
          <>
            <div className="flex flex-col justify-center items-center sm:flex-row gap-6 border border-primary p-2 rounded-md">
              {/* Image */}
              <div className="relative flex justify-start w-[40%]">
                <div className="p-2 rounded-md">
                  {getImageUrl() ? (
                    <img
                      src={getImageUrl()!}
                      alt={imageError ? "Captured Image" : "Extracted Label"}
                      className="object-contain max-h-[200px] md:max-h-[350px]"
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-[200px] md:h-[350px] bg-gray-100 rounded-md ">
                      <div className="text-center text-gray-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="48"
                          height="48"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mx-auto mb-2"
                        >
                          <rect
                            width="18"
                            height="18"
                            x="3"
                            y="3"
                            rx="2"
                            ry="2"
                          />
                          <circle cx="9" cy="9" r="2" />
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                        </svg>
                        <p className="text-sm">No image available</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Label and Mapped Data */}
              <div className="w-full md:w-[60%] flex justify-center items-center ">
                <div className="relative w-full overflow-y-auto md:overflow-hidden max-h-60 md:max-h-none">
                  <div className="col-span-2 text-gray-700 font-BreeSerif font-semibold mb-3">
                    Label data
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(capturedData.fields || []).filter((fieldName) => {
                      const val = getFieldValue(fieldName);
                      if (val === null || val === undefined || val === "" || val === "-") return false;
                      if (Array.isArray(val) && val.length === 0) return false;
                      return true;
                    }).map((fieldName) => {
                      // Special handling for quantity field with MOQ validation
                      if (fieldName === "quantity") {
                        return (
                          <TextField
                            key={fieldName}
                            label={getFieldLabel(fieldName)}
                            value={getFieldValue(fieldName)}
                            size="small"
                            InputProps={{
                              readOnly: isQuantityFieldDisabled,
                              endAdornment: quantityMismatch ? (
                                <InputAdornment position="end">
                                  <div className="flex">
                                    <CheckCircleIcon
                                      className="cursor-pointer text-[#676e6e]"
                                      onClick={handleAcceptQuantity}
                                      style={{
                                        fontSize: 20,
                                        backgroundColor: "#f5f5dc",
                                        borderRadius: "50%",
                                        padding: 2,
                                      }}
                                    />
                                    <CancelIcon
                                      className="cursor-pointer text-gray-400 ml-1"
                                      onClick={handleRejectQuantity}
                                      style={{
                                        fontSize: 20,
                                        backgroundColor: "#f0f0f0",
                                        borderRadius: "50%",
                                        padding: 2,
                                      }}
                                    />
                                  </div>
                                </InputAdornment>
                              ) : null,
                            }}
                            InputLabelProps={{
                              sx: {
                                backgroundColor: "white",
                                padding: "0 4px",
                                color: "#676e6e",
                              },
                            }}
                            fullWidth
                            onChange={(e) =>
                              handleInputChange(
                                "quantity",
                                parseInt(e.target.value, 10) || 0
                              )
                            }
                            sx={{
                              "& .MuiInputBase-root": {
                                height: 36,
                                fontSize: "small",
                              },
                            }}
                            error={quantityMismatch}
                            helperText={
                              quantityMismatch ? (
                                <div className="flex items-center text-red-500">
                                  <InfoIcon
                                    style={{ fontSize: 16, marginRight: 4 }}
                                  />
                                  <span>
                                    Captured value is different from master data
                                    value: {moqQuantity}
                                  </span>
                                </div>
                              ) : (
                                ""
                              )
                            }
                          />
                        );
                      }

                      // Regular field rendering for all other fields
                      return (
                        <TextField
                          key={fieldName}
                          label={getFieldLabel(fieldName)}
                          value={getFieldValue(fieldName)}
                          size="small"
                          InputProps={{ readOnly: !isEditable }}
                          InputLabelProps={{
                            sx: {
                              backgroundColor: "white",
                              padding: "0 4px",
                            },
                          }}
                          fullWidth
                          onChange={(e) => {
                            if (fieldName === "quantity") {
                              handleDynamicFieldChange(
                                fieldName,
                                parseInt(e.target.value, 10) || 0
                              );
                            } else {
                              handleDynamicFieldChange(
                                fieldName,
                                e.target.value
                              );
                            }
                          }}
                          sx={{
                            "& .MuiInputBase-root": {
                              height: 36,
                              fontSize: "small",
                            },
                          }}
                        />
                      );
                    })}
                  </div>

                  <div className="col-span-2 text-gray-700 font-BreeSerif font-semibold mt-4 mb-3">
                    Mapped data
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextField
                      label="Internal Part Number *"
                      value={formData?.internalPartNo || ""}
                      size="small"
                      InputProps={{ readOnly: !isEditable }}
                      InputLabelProps={{
                        sx: {
                          backgroundColor: "white",
                          padding: "0 4px",
                        },
                      }}
                      fullWidth
                      onChange={(e) =>
                        handleInputChange("internalPartNo", e.target.value)
                      }
                      sx={{
                        "& .MuiInputBase-root": {
                          height: 36,
                          fontSize: "small",
                        },
                      }}
                    />

                    <TextField
                      label="Manufacturer"
                      value={formData?.manufacturer || ""}
                      size="small"
                      InputProps={{ readOnly: !isEditable }}
                      InputLabelProps={{
                        sx: {
                          backgroundColor: "white",
                          padding: "0 4px",
                        },
                      }}
                      fullWidth
                      onChange={(e) =>
                        handleInputChange("manufacturer", e.target.value)
                      }
                      sx={{
                        "& .MuiInputBase-root": {
                          height: 36,
                          fontSize: "small",
                        },
                      }}
                    />

                    <TextField
                      label="Part description"
                      value={formData?.description || ""}
                      size="small"
                      InputProps={{ readOnly: !isEditable }}
                      InputLabelProps={{
                        sx: {
                          backgroundColor: "white",
                          padding: "0 4px",
                        },
                      }}
                      fullWidth
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      sx={{
                        "& .MuiInputBase-root": {
                          height: 36,
                          fontSize: "small",
                        },
                      }}
                    />

                    <TextField
                      label="Part Location"
                      value={formData?.partLocation || ""}
                      size="small"
                      InputProps={{ readOnly: !isEditable }}
                      InputLabelProps={{
                        sx: {
                          backgroundColor: "white",
                          padding: "0 4px",
                        },
                      }}
                      fullWidth
                      onChange={(e) =>
                        handleInputChange("partLocation", e.target.value)
                      }
                      sx={{
                        "& .MuiInputBase-root": {
                          height: 36,
                          fontSize: "small",
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {countdown !== null ? (
              <div className="mt-6 flex justify-end">
                <Button
                  type="button"
                  onClick={handlePauseClick}
                  className="bg-[#676e6e] hover:bg-[#676e6e]/90 text-white"
                >
                  Pause in {countdown} sec
                </Button>
              </div>
            ) : (
              <div className="mt-6 flex justify-end gap-2">
                <Button
                  type="button"
                  onClick={onClose}
                  className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={!isFormValid}
                  onClick={handleSubmit}
                  className="bg-[#676e6e] hover:bg-[#676e6e]/90 text-white"
                >
                  Submit
                </Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DataConfirmationDialog;
