import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from "@mui/material";
import { Button } from "../ui/button";
import { toast } from "react-fox-toast";
import { createNewTemplate } from "../../api/administration/master";
import { getPartsInPrinterConfig } from "../../api/settings";

type ValidationState = {
  columnName: string;
  isValid: boolean;
  message?: string;
};

type EntityTableRow = {
  slNo: number;
  name: string;
  id: string;
};

type AddTemplateDialogProps = {
  type: string;
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: any) => void;
  validationStatus: ValidationState[];
  fileHeaders: string[];
};

const masterOptions = [
  { key: "partNumber", value: "Part Number" },
  { key: "internalPartNo", value: "Internal Part Number" },
  { key: "quantity", value: "Quantity" },
  { key: "partLocation", value: "Part Location" },
  { key: "manufacturer", value: "Manufacturer" },
  { key: "description", value: "Description" },
];

const receiptOptions = [
  { key: "receiptNumber", value: "Receipt Number" },
  { key: "receiptQuantity", value: "Receipt Quantity" },
  { key: "partNumber", value: "Part Number" },
  { key: "dateOfReceipt", value: "Date of Receipt" },
];

const toCamelCase = (label: string) => {
  if (label === "Internal Part Number") return "internalPartNO";

  return label
    .toLowerCase()
    .split(" ")
    .map((word, index) =>
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join("");
};

const AddTemplateDialog: React.FC<AddTemplateDialogProps> = ({
  open,
  type,
  onClose,
  onSubmit,
  fileHeaders,
}) => {
  const [templateName, setTemplateName] = useState("");
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [entityTableRows, setEntityTableRows] = useState<EntityTableRow[]>([]);
  console.log("EntityTableRows", entityTableRows);
  const options = type === "master" ? masterOptions : receiptOptions;

  // const fileColumns = validationStatus
  //   .map((item) => item.columnName)
  //   .filter((col) => col !== "Id Code");

  useEffect(() => {
    // Initialize mappings for each file header
    const initialMappings = fileHeaders.reduce((acc, header) => {
      acc[header] = ""; // Default to empty, user will select template field
      return acc;
    }, {} as Record<string, string>);
    setMappings(initialMappings);
  }, [fileHeaders]);

  useEffect(() => {
    const fetchPrinterConfig = async () => {
      try {
        setLoading(true);
        const data = await getPartsInPrinterConfig();

        let entityTable = data.entityTableRows.map((row) => ({
          ...row,
          id: toCamelCase(row.name || row.id), // Use name field for proper camelCase conversion
        }));
        console.log("EntityTables", entityTable);

        setEntityTableRows(entityTable);
      } catch (error) {
        console.error("Failed to fetch printer config:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrinterConfig();
  }, []);

  const handleMappingChange = (field: string, value: string) => {
    setMappings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Get list of already selected template fields
  const getSelectedFields = () => {
    return Object.values(mappings).filter(Boolean);
  };

  // Check if a template field is available for selection
  const isFieldAvailable = (
    templateField: string,
    currentFileHeader: string
  ) => {
    const selectedFields = getSelectedFields();
    const currentSelection = mappings[currentFileHeader];

    // Field is available if:
    // 1. It's not selected by anyone else, OR
    // 2. It's currently selected by this file header (so user can keep it)
    return (
      !selectedFields.includes(templateField) ||
      currentSelection === templateField
    );
  };

  // Check if form is valid for submission
  const isFormValid = () => {
    return templateName.trim() !== "";
  };

  const handleSubmit = async () => {
    // Additional validation before submission
    if (!isFormValid()) {
      toast.error("Please enter a template name");
      return;
    }

    const templateMapping = Object.entries(mappings)
      .filter(([templateField]) => templateField)
      .map(([fileHeader, templateField]) => ({
        label: fileHeader, // The actual file header name
        path: toCamelCase(templateField), // Convert template field to camelCase
      }));

    const payload = {
      templateName,
      type: type,
      templateMapping,
    };

    try {
      const response = await createNewTemplate(payload);
      console.log("Template created successfully:", response.data);
      onSubmit?.(payload);
      toast.success("Template Created Successfully!");
      onClose();
    } catch (error) {
      console.error("Error creating template:", error);
      toast.error("Failed to create template");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="text-primary">Add Template</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <div style={{ padding: "20px", textAlign: "center", color: "grey" }}>
            Loading...
          </div>
        ) : (
          <>
            <TextField
              label="Template Name"
              fullWidth
              value={templateName}
              InputLabelProps={{ shrink: true }}
              onChange={(e) => setTemplateName(e.target.value)}
              margin="normal"
              sx={{
                "& .MuiInputBase-input": { fontSize: "14px", padding: "10px" },
                "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                  borderColor: "var(--primary)",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "var(--primary)",
                },
                "& .MuiInputLabel-root": { fontSize: "14px" },
              }}
            />

            {fileHeaders.map((header) => (
              <div
                key={header}
                style={{
                  display: "flex",
                  gap: "20px",
                  marginBottom: "20px",
                  marginTop: "20px",
                }}
              >
                <TextField
                  label="File Column"
                  value={header}
                  disabled
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    "& .MuiInputBase-input": {
                      fontSize: "14px",
                      padding: "10px",
                    },
                    "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                      borderColor: "var(--primary)",
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "var(--primary)",
                    },
                    "& .MuiInputLabel-root": { fontSize: "14px" },
                  }}
                />

                <TextField
                  select
                  label="Map to Template Field"
                  value={mappings[header] || ""}
                  onChange={(e) => handleMappingChange(header, e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    "& .MuiInputBase-input": {
                      fontSize: "14px",
                      padding: "10px",
                    },
                    "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                      borderColor: "var(--primary)",
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "var(--primary)",
                    },
                    "& .MuiInputLabel-root": { fontSize: "14px" },
                  }}
                >
                  <MenuItem value="">None</MenuItem>
                  {options.map((entity) => (
                    <MenuItem
                      key={entity.key}
                      value={entity.value}
                      disabled={!isFieldAvailable(entity.value, header)}
                    >
                      {entity.value}
                    </MenuItem>
                  ))}
                </TextField>
              </div>
            ))}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <button
          onClick={onClose}
          className="border border-primary text-primary bg-white px-4 py-2 cursor-pointer   rounded-md text-sm"
        >
          Cancel
        </button>
        <Button
          variant="default"
          onClick={handleSubmit}
          disabled={!isFormValid()}
          className="bg-primary text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddTemplateDialog;
