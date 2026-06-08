// components/dialogs/TemplateDialog.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { TextField } from "@mui/material";
import deleteImg from "../../assets/newIcons/delete.svg";
import { toast } from "react-fox-toast";
import {
  addPartsNumber,
  deletePartNumber,
} from "../../api/administration/template";

interface TemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  templateData: any;
}

interface PartNumberObj {
  uniqueId: string;
  templateId: string;
  partNumber: string;
  createdAt: string;
  updatedAt: string;
  id: string;
}

const TemplateDialog: React.FC<TemplateDialogProps> = ({
  isOpen,
  onClose,
  templateData,
}) => {
  const [manufacturer, setManufacturer] = useState<string>("");
  const [closing, setClosing] = useState(false);
  const [partNumbers, setPartNumbers] = useState<PartNumberObj[]>([]);
  const [newPartNumber, setNewPartNumber] = useState<string>("");
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  console.log("PartNumbers", partNumbers);

  useEffect(() => {
    if (isOpen && templateData) {
      setManufacturer(templateData.manufacturer || "");

      if (
        Array.isArray(templateData.partNumber) &&
        templateData.partNumber.length > 0 &&
        typeof templateData.partNumber[0] === "string"
      ) {
        setPartNumbers(
          templateData.partNumber.map((pn: string) => ({
            uniqueId: "",
            templateId: templateData.id,
            partNumber: pn,
            createdAt: "",
            updatedAt: "",
            id: pn,
          }))
        );
      } else {
        setPartNumbers(templateData.partNumber || []);
      }

      setNewPartNumber("");
    }
  }, [isOpen, templateData]);

  useEffect(() => {
    if (isOpen) {
      setClosing(false);
    }
  }, [isOpen]);

  // Validate form
  useEffect(() => {
    const trimmed = newPartNumber.trim();
    const isValidFormat =
      trimmed.length > 0 && /^[a-zA-Z0-9_\-,./]+$/.test(trimmed);

    // Check for duplicates
    const isDuplicate = partNumbers.some(
      (pn) => pn.partNumber.toLowerCase() === trimmed.toLowerCase()
    );

    setIsFormValid(isValidFormat && !isDuplicate);
  }, [newPartNumber, partNumbers]);

  const handleDeletePartNumber = async (id: string) => {
    try {
      await deletePartNumber(id);
      setPartNumbers((prev) => prev.filter((pn) => pn.id !== id));
      toast.success("Part number deleted successfully");
    } catch (error) {
      console.error("Failed to delete part number:", error);
      toast.error("Failed to delete part number");
    }
  };

  const handleAddPartNumber = async () => {
    const trimmed = newPartNumber.trim();
    if (!trimmed || !/^[a-zA-Z0-9_\-,./]+$/.test(trimmed)) return;
    const partNumberExists = partNumbers.some(
      (pn) => pn.partNumber.toLowerCase() === trimmed.toLowerCase()
    );

    if (partNumberExists) {
      console.log("Part number already exists!");
      toast.error("Part number already exists!");
      return;
    }
    try {
      const payload = {
        uniqueId: "",
        templateId: templateData._id,
        partNumber: trimmed,
      };

      const response = await addPartsNumber(payload);
      toast.success("PartNumber added successfully");

      setPartNumbers((prev) => [...prev, response]);
      setNewPartNumber("");
    } catch (error: any) {
      toast.error(error?.response?.data?.message);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !closing) {
          setClosing(true);
          onClose();
        }
      }}
    >
      <DialogContent
        style={{ width: "700px", maxWidth: "90vw", paddingLeft: "40px" }}
        className="p-6 rounded-md shadow-md bg-white max-w-none"
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">
            Entity Template
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 w-[60%]">
          {/* Manufacturer Display */}
          <div className="relative w-full max-w-sm mt-6">
            <label
              htmlFor="manufacturer-display"
              className="absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-xs font-medium text-primary select-none"
            >
              Manufacturer
            </label>
            <div
              id="manufacturer-display"
              className="w-full rounded-sm border border-tertiary min-h-[40px] px-3 flex items-center text-sm text-primary select-none"
            >
              {manufacturer || "—"}
            </div>
          </div>

          {/* Part Number Field */}
          <div>
            <label className="text-sm font-medium text-primary">
              Part Number
            </label>

            {/* Controlled input for new part number */}
            <TextField
              size="small"
              variant="outlined"
              placeholder="Enter Part Number"
              fullWidth
              className="bg-white mt-5"
              value={newPartNumber}
              onChange={(e) => {
                const value = e.target.value;
                const sanitized = value.replace(/[^a-zA-Z0-9 _\-,./]/g, "");
                setNewPartNumber(sanitized);
              }}
              sx={{
                "& .MuiInputBase-input": {
                  fontSize: "14px",
                },
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "var(--primary)",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "var(--primary)",
                },
                "& .MuiInputLabel-root": {
                  fontSize: "14px",
                },
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-1">
            {partNumbers.length > 0 ? (
              partNumbers.map((pn) => (
                <div
                  key={pn.id}
                  className="flex items-center mb-4 gap-1 bg-sidebar text-xs text-tertiary px-2 py-1 rounded-full"
                >
                  {pn.partNumber}
                  <button
                    className="text-[#CFA77B] text-xs"
                    onClick={() => handleDeletePartNumber(pn.id)}
                    type="button"
                  >
                    <img src={deleteImg} alt="delete" className="h-3 w-3" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-tertiary text-xs text-tertiary mb-3">
                No part numbers
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-center items-center mt-6 gap-2">
          <button
            className={`px-8 py-2 rounded-md text-white ${
              isFormValid
                ? "bg-[#676e6e] hover:bg-[#b28545]"
                : "bg-gray-300 cursor-not-allowed"
            }`}
            onClick={handleAddPartNumber}
            disabled={!isFormValid}
          >
            Add
          </button>
          <button className="border px-8 py-2 rounded-md" onClick={onClose}>
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateDialog;
